import OpenAI from "openai";

const MIN_TEXT_LENGTH = 50;
const MAX_INPUT_LENGTH = 2000;

const SYSTEM_PROMPT =
  "あなたは記事要約アシスタントです。与えられたテキストを日本語で1〜2文に要約してください。要約のみを返してください。";

const OPENAI_MODEL = "gpt-5.4-nano";

function createClient(): { client: OpenAI; model: string } | undefined {
  if (process.env.OPENAI_API_KEY) {
    return { client: new OpenAI(), model: OPENAI_MODEL };
  }
  if (process.env.OLLAMA_BASE_URL) {
    return {
      client: new OpenAI({
        baseURL: process.env.OLLAMA_BASE_URL + "/v1",
        apiKey: "ollama",
      }),
      model: process.env.OLLAMA_MODEL ?? "llama3.2",
    };
  }
  return undefined;
}

export async function summarizeText(text: string): Promise<string | undefined> {
  if (text.length < MIN_TEXT_LENGTH) return undefined;

  const config = createClient();
  if (!config) return undefined;

  try {
    const response = await config.client.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text.slice(0, MAX_INPUT_LENGTH) },
      ],
      temperature: 0.3,
      max_completion_tokens: 200,
    });
    return response.choices[0]?.message?.content ?? undefined;
  } catch (error) {
    console.error("Failed to summarize text:", error);
    return undefined;
  }
}

export async function summarizeItems(
  items: { id: string; text: string | null }[],
  concurrency = 3,
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      const item = items[i];
      if (!item?.text) continue;
      const summary = await summarizeText(item.text);
      if (summary) results.set(item.id, summary);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.allSettled(workers);

  return results;
}
