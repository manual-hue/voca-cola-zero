import { handleDailyContent } from "@/lib/daily-content";

export const dynamic = "force-dynamic";

interface HistoryResponse {
  topic: string;
  category: string;
  summary: string;
  keyFacts: string[];
  reflection: string;
}

export async function GET() {
  return handleDailyContent<HistoryResponse>({
    collection: "daily-history",
    prompt: `Pick an interesting historical event, figure, or current affairs topic.
It can be from any era or region. Make it educational and thought-provoking.

Return ONLY valid JSON matching this exact schema, no markdown fences:
{
  "topic": "<the topic title>",
  "category": "<History or Current Affairs or Science or Culture>",
  "summary": "<3-5 sentence summary explaining the topic>",
  "keyFacts": ["<fact 1>", "<fact 2>", "<fact 3>", "<fact 4>", "<fact 5>"],
  "reflection": "<a thought-provoking question for the reader to reflect on>"
}

Provide exactly 5 key facts.`,
    validate: (data) => !!data.topic && !!data.keyFacts?.length,
    quotaMsg: "API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.",
    errorMsg: "역사/시사 콘텐츠 생성에 실패했습니다.",
  });
}
