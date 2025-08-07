import { openai } from "@ai-sdk/openai";
import {
  streamText,
  tool,
  CoreMessage,
  experimental_createMCPClient as createMCPClient,
} from "ai";
import { z } from "zod";
import cityMap from "./cityMap.json";

export const maxDuration = 30;

/**
 * @see https://v4.ai-sdk.dev/docs/troubleshooting/use-chat-an-error-occurred#usechat-an-error-occurred
 */
function errorHandler(error: unknown) {
  if (error == null) return "unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: CoreMessage[] };

  const mcpClient = await createMCPClient({
    transport: {
      type: "sse",
      url: "https://playwright-mcp-example.kyonenya.workers.dev/sse",
    },
  });
  const mcpTools = await mcpClient.tools();

  const result = streamText({
    model: openai("gpt-4.1"),
    /**
     * マルチステップ呼び出しを有効化
     * @see https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#multi-step-calls-using-maxsteps
     */
    maxSteps: 2,
    messages: [
      {
        role: "system",
        content:
          `weather ツールは、引数に一次細分区域IDを受け取り、天気取得APIを叩いて生のJSONを返します。あなたは、入力された場所から最も近い地域を下記の「一時細分区域ID一覧」から選んで、そのIDを指定して weather ツールを呼んでください。あなたはその後、天気APIから返ってきたJSONを日本語でわかりやすく要約してください。
          --- 一時細分区域IDの一覧 ---
          ${JSON.stringify(cityMap)}`.trim(),
      },
      ...messages,
    ],
    tools: {
      weather: tool({
        description:
          "日本の現在の天気を返します。引数 location には一次細分区域のIDを指定してください。",
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
      ...mcpTools,
    },
    onFinish: () => {
      mcpClient.close();
    },
  });

  return result.toDataStreamResponse({
    getErrorMessage: errorHandler,
  });
}
