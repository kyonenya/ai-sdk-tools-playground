import { openai } from "@ai-sdk/openai";
import { streamText, tool, CoreMessage } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: CoreMessage[] };

  const result = streamText({
    model: openai("gpt-4.1"),
    /**
     * マルチステップ呼び出しを有効化
     * @see https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#multi-step-calls-using-maxsteps
     */
    maxSteps: 5,
    messages: [
      {
        role: "system",
        content:
          "天気APIの生データを受け取ったら、日本語でわかりやすく要約して返してください。",
      },
      ...messages,
    ],
    tools: {
      weather: tool({
        description:
          '日本の現在の天気を返します。引数`location`には一次細分区域（cityタグ）のID（例: 東京→"130010"）を指定してください。',
        parameters: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          const res = await fetch(
            `https://weather.tsukumijima.net/api/forecast/city/${location}`,
          );
          if (!res.ok) throw new Error("Failed to fetch weather data");
          return await res.json();
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
