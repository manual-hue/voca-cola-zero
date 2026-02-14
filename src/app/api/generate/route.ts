import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface VocabWord {
  word: string;
  meaning: string;
  pronunciation: string;
}

interface VocabResponse {
  subject: string;
  language: string;
  vocabulary: VocabWord[];
}

// In-memory cache (fast path within same serverless instance)
let memCache: { dateKey: string; data: VocabResponse } | null = null;

function getTodayKey(): string {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000); // KST
  return now.toISOString().split("T")[0]; // "2026-02-15"
}

function getDayOfYear(): number {
  return Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );
}

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

async function generateWithFallback(
  genAI: GoogleGenerativeAI,
  prompt: string,
): Promise<string> {
  let lastError: unknown;

  for (const modelName of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err: unknown) {
        lastError = err;
        const errMsg = err instanceof Error ? err.message : String(err);
        const isQuotaError =
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("quota");

        if (isQuotaError && attempt === 0) {
          await new Promise((r) => setTimeout(r, 5000));
          continue;
        }
        break;
      }
    }
  }

  throw lastError;
}

export async function GET(request: NextRequest) {
  const todayKey = getTodayKey();

  // 1. In-memory cache (fastest)
  if (memCache && memCache.dateKey === todayKey) {
    return NextResponse.json(memCache.data);
  }

  // 2. Firestore cache (persistent across serverless instances)
  try {
    const doc = await getDb()
      .collection("daily-vocabulary")
      .doc(todayKey)
      .get();

    if (doc.exists) {
      const data = doc.data() as VocabResponse;
      memCache = { dateKey: todayKey, data };
      return NextResponse.json(data);
    }
  } catch (e) {
    console.error("Firestore read error:", e);
  }

  // 3. Generate new vocabulary via Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const dayOfYear = getDayOfYear();
  const isOddDay = dayOfYear % 2 !== 0;
  const language = isOddDay ? "English" : "Chinese";

  const prompt = `Generate exactly 40 vocabulary words for language learning.
Language: ${language}
Today's theme: Pick an interesting, practical daily-life topic (e.g., cooking, travel, technology, emotions, business, nature).

Return ONLY valid JSON matching this exact schema, no markdown fences:
{
  "subject": "<the topic you chose>",
  "language": "${language}",
  "vocabulary": [
    {
      "word": "<the word in ${language}>",
      "meaning": "<translation/definition in Korean>",
      "pronunciation": "<phonetic pronunciation guide>"
    }
  ]
}

Provide exactly 40 items in the vocabulary array. Make words range from beginner to intermediate level.`;

  try {
    const text = await generateWithFallback(genAI, prompt);

    const cleaned = text.replace(/```json\s*|```\s*/g, "").trim();
    const data: VocabResponse = JSON.parse(cleaned);

    if (!data.vocabulary || data.vocabulary.length === 0) {
      throw new Error("Empty vocabulary array from AI");
    }

    // Save to Firestore
    try {
      await getDb()
        .collection("daily-vocabulary")
        .doc(todayKey)
        .set({
          subject: data.subject,
          language: data.language,
          vocabulary: data.vocabulary,
          createdAt: new Date().toISOString(),
        });
    } catch (e) {
      console.error("Firestore write error:", e);
    }

    // Save to memory cache
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
        {
          error:
            "API 무료 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요. (약 1분 대기)",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: "단어 생성에 실패했습니다. 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
