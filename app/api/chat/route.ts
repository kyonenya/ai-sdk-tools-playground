import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  experimental_createMCPClient as createMCPClient,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { z } from "zod";
import cityMap from "./cityMap.json";
// import { AgenticToolClient } from "@agentic/platform-tool-client";
// import { createAISDKTools } from "@agentic/ai-sdk";

export const maxDuration = 90;

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };

  const mcpClient = await createMCPClient({
    transport: {
      type: "sse",
      url: "https://playwright-mcp-example.kyonenya.workers.dev/sse",
    },
  });
  const mcpTools = await mcpClient.tools();

  // const searchClient =
  //   await AgenticToolClient.fromIdentifier("@agentic/search");
  // const searchTools = createAISDKTools(searchClient);

  const tools = {
    weather: tool({
      description:
        "日本の現在の天気を返します。引数 location には一次細分区域のIDを指定してください。",
      inputSchema: z.object({
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
    // ...searchTools,
  } as const;

  const result = streamText({
    model: openai("gpt-4.1"),
    stopWhen: stepCountIs(2),
    system:
      `weather ツールは、引数に一次細分区域IDを受け取り、天気取得APIを叩いて生のJSONを返します。あなたは、入力された場所から最も近い地域を下記の「一時細分区域ID一覧」から選んで、そのIDを指定して weather ツールを呼んでください。あなたはその後、天気APIから返ってきたJSONを日本語でわかりやすく要約してください。
      --- 一時細分区域IDの一覧 ---
      ${JSON.stringify(cityMap)}`.trim(),
    messages: convertToModelMessages(messages, { tools }),
    tools,
    onFinish: () => {
      mcpClient.close();
    },
  });

  return result.toUIMessageStreamResponse({
    onError: (error: unknown) => {
      /** @see https://ai-sdk.dev/docs/troubleshooting/use-chat-an-error-occurred#usechat-an-error-occurred */
      if (error == null) return "unknown error";
      if (typeof error === "string") return error;
      if (error instanceof Error) return error.message;
      return JSON.stringify(error);
    },
  });
}
