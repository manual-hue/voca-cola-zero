import { handleDailyContent } from "@/lib/daily-content";

export const dynamic = "force-dynamic";

interface LiteratureResponse {
  title: string;
  author: string;
  excerpt: string;
  language: string;
  translation: string;
}

export async function GET() {
  return handleDailyContent<LiteratureResponse>({
    collection: "daily-literature",
    prompt: `Select a famous passage from English or Chinese classic literature.
The excerpt should be 2-4 sentences long, suitable for transcription practice.
Alternate between English and Chinese works.

Return ONLY valid JSON matching this exact schema, no markdown fences:
{
  "title": "<title of the work>",
  "author": "<author name>",
  "excerpt": "<the passage in its original language, 2-4 sentences>",
  "language": "<English or Chinese>",
  "translation": "<Korean translation of the excerpt>"
}`,
    validate: (data) => !!data.excerpt && !!data.title,
    quotaMsg: "API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.",
    errorMsg: "문학 발췌문 생성에 실패했습니다.",
  });
}
