import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json() as { messages: any[] };

  const result = streamText({
    model: openai('gpt-4.1'),
    messages,
    tools: {
      weather: tool({
        description: '日本の現在の天気を返します。引数 location には一次細分区域（cityタグ）のID（例: 東京→"130010"）を指定してください。',
        parameters: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => {
          const res = await fetch(`https://weather.tsukumijima.net/api/forecast/city/${location}`);
          if (!res.ok) throw new Error('Failed to fetch weather data');
          return await res.json();
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}