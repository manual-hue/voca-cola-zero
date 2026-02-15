import { handleDailyContent } from "@/lib/daily-content";
import { getDayOfYear } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

interface VocabResponse {
  subject: string;
  language: string;
  vocabulary: { word: string; meaning: string; pronunciation: string }[];
}

export async function GET() {
  const language = getDayOfYear() % 2 !== 0 ? "English" : "Chinese";

  return handleDailyContent<VocabResponse>({
    collection: "daily-vocabulary",
    prompt: `Generate exactly 40 vocabulary words for language learning.
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

Provide exactly 40 items in the vocabulary array. Make words range from beginner to intermediate level.`,
    validate: (data) => !!data.vocabulary?.length,
    quotaMsg: "API 무료 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요. (약 1분 대기)",
    errorMsg: "단어 생성에 실패했습니다. 다시 시도해주세요.",
  });
}
