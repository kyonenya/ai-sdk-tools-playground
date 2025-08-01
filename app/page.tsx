"use client";

import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch gap-4">
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? "User: " : "AI: "}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case "text":
                return (
                  <ReactMarkdown key={`${message.id}-${i}`}>
                    {part.text}
                  </ReactMarkdown>
                );
              case "tool-invocation":
                return (
                  <details key={`${message.id}-${i}`} className="pb-2">
                    <summary className="secondary-text">
                      API Response (Click to expand)
                    </summary>
                    <pre className="text-xs">
                      {JSON.stringify(part.toolInvocation, null, 2)}
                    </pre>
                  </details>
                );
            }
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
