import { getDb } from "@/lib/firebase-admin";
import { getGenAI, generateWithFallback } from "@/lib/gemini";
import { getTodayKey } from "@/lib/date-utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface LiteratureResponse {
  title: string;
  author: string;
  excerpt: string;
  language: string;
  translation: string;
}

let memCache: { dateKey: string; data: LiteratureResponse } | null = null;

export async function GET(request: NextRequest) {
  const todayKey = getTodayKey();

  if (memCache && memCache.dateKey === todayKey) {
    return NextResponse.json(memCache.data);
  }

  try {
    const doc = await getDb().collection("daily-literature").doc(todayKey).get();
    if (doc.exists) {
      const data = doc.data() as LiteratureResponse;
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

  const prompt = `Select a famous passage from English or Chinese classic literature.
The excerpt should be 2-4 sentences long, suitable for transcription practice.
Alternate between English and Chinese works.

Return ONLY valid JSON matching this exact schema, no markdown fences:
{
  "title": "<title of the work>",
  "author": "<author name>",
  "excerpt": "<the passage in its original language, 2-4 sentences>",
  "language": "<English or Chinese>",
  "translation": "<Korean translation of the excerpt>"
}`;

  try {
    const text = await generateWithFallback(genAI, prompt);
    const cleaned = text.replace(/```json\s*|```\s*/g, "").trim();
    const data: LiteratureResponse = JSON.parse(cleaned);

    if (!data.excerpt || !data.title) {
      throw new Error("Invalid literature response from AI");
    }

    try {
      await getDb().collection("daily-literature").doc(todayKey).set({
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
      { error: "문학 발췌문 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}
