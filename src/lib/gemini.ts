import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

let _genAI: GoogleGenerativeAI | undefined;

export function getGenAI(): GoogleGenerativeAI {
  if (_genAI) return _genAI;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  _genAI = new GoogleGenerativeAI(apiKey);
  return _genAI;
}

export async function generateWithFallback(
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
