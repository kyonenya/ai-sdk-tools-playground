"use client";

import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";

export default function Chat() {
  const { messages, sendMessage } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl py-24 px-4 sm:px-6 mx-auto stretch gap-4">
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
              default:
                if (part.type.startsWith("tool-")) {
                  return (
                    <details key={`${message.id}-${i}`} className="pb-2">
                      <summary className="secondary-text">
                        API Response (Click to expand)
                      </summary>
                      <pre className="text-xs">
                        {JSON.stringify(part, null, 2)}
                      </pre>
                    </details>
                  );
                }
                return null;
            }
          })}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const formData = new FormData(form);
          const text =
            (formData.get("user-input") as string | null)?.trim() ?? "";
          if (text.length === 0) return;
          sendMessage({ text });
          form.reset();
        }}
      >
        <input
          name="user-input"
          className="fixed dark:bg-zinc-900 bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          placeholder="Say something..."
        />
      </form>
    </div>
  );
}
