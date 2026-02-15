import { getDb } from "@/lib/firebase-admin";
import { getGenAI, generateWithFallback } from "@/lib/gemini";
import { getTodayKey } from "@/lib/date-utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface HistoryResponse {
  topic: string;
  category: string;
  summary: string;
  keyFacts: string[];
  reflection: string;
}

let memCache: { dateKey: string; data: HistoryResponse } | null = null;

export async function GET(request: NextRequest) {
  const todayKey = getTodayKey();

  if (memCache && memCache.dateKey === todayKey) {
    return NextResponse.json(memCache.data);
  }

  try {
    const doc = await getDb().collection("daily-history").doc(todayKey).get();
    if (doc.exists) {
      const data = doc.data() as HistoryResponse;
      memCache = { dateKey: todayKey, data };
      return NextResponse.json(data);
    }
  } catch (e) {
    console.error("Firestore read error:", e);
    const errMsg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `데이터베이스 연결에 실패했습니다: ${errMsg}` },
      { status: 503 },
    );
  }

  let genAI;
  try {
    genAI = getGenAI();
  } catch {
    return NextResponse.json(
      { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const prompt = `Pick an interesting historical event, figure, or current affairs topic.
It can be from any era or region. Make it educational and thought-provoking.

Return ONLY valid JSON matching this exact schema, no markdown fences:
{
  "topic": "<the topic title>",
  "category": "<History or Current Affairs or Science or Culture>",
  "summary": "<3-5 sentence summary explaining the topic>",
  "keyFacts": ["<fact 1>", "<fact 2>", "<fact 3>", "<fact 4>", "<fact 5>"],
  "reflection": "<a thought-provoking question for the reader to reflect on>"
}

Provide exactly 5 key facts.`;

  try {
    const text = await generateWithFallback(genAI, prompt);
    const cleaned = text.replace(/```json\s*|```\s*/g, "").trim();
    const data: HistoryResponse = JSON.parse(cleaned);

    if (!data.topic || !data.keyFacts?.length) {
      throw new Error("Invalid history response from AI");
    }

    try {
      await getDb().collection("daily-history").doc(todayKey).set({
        ...data,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Firestore write error:", e);
    }

    memCache = { dateKey: todayKey, data };
    return NextResponse.json(data);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const isQuota =
      errMsg.includes("429") ||
      errMsg.includes("RESOURCE_EXHAUSTED") ||
      errMsg.includes("quota");

    console.error("Gemini generation error:", error);

    if (isQuota) {
      return NextResponse.json(
        { error: "API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: "역사/시사 콘텐츠 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}
