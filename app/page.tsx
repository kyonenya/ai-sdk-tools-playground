"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Chat() {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState("");

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
          const text = input.trim();
          if (text.length === 0) return;
          sendMessage({ text });
          setInput("");
        }}
      >
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </div>
  );
}
