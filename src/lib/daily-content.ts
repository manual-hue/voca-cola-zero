import { NextResponse } from "next/server";
import { getDb } from "./firebase-admin";
import { getGenAI, generateWithFallback } from "./gemini";
import { getTodayKey } from "./date-utils";

const caches = new Map<string, { dateKey: string; data: unknown }>();

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota");
}

interface DailyContentOptions<T> {
  collection: string;
  prompt: string;
  validate: (data: T) => boolean;
  quotaMsg: string;
  errorMsg: string;
}

export async function handleDailyContent<T>(
  options: DailyContentOptions<T>,
): Promise<NextResponse> {
  const todayKey = getTodayKey();

  const cached = caches.get(options.collection);
  if (cached && cached.dateKey === todayKey) {
    return NextResponse.json(cached.data);
  }

  try {
    const doc = await getDb().collection(options.collection).doc(todayKey).get();
    if (doc.exists) {
      const data = doc.data() as T;
      caches.set(options.collection, { dateKey: todayKey, data });
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

  try {
    const text = await generateWithFallback(genAI, options.prompt);
    const cleaned = text.replace(/```json\s*|```\s*/g, "").trim();
    const data: T = JSON.parse(cleaned);

    if (!options.validate(data)) {
      throw new Error("Invalid response from AI");
    }

    try {
      await getDb().collection(options.collection).doc(todayKey).set({
        ...(data as Record<string, unknown>),
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Firestore write error:", e);
    }

    caches.set(options.collection, { dateKey: todayKey, data });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Gemini generation error:", error);

    if (isQuotaError(error)) {
      return NextResponse.json({ error: options.quotaMsg }, { status: 429 });
    }

    return NextResponse.json({ error: options.errorMsg }, { status: 500 });
  }
}
