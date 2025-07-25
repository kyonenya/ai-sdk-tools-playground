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
        description: 'Get the weather in a location (celsius)',
        parameters: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (32 - 0) + 0);
          return {
            location,
            temperature,
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}