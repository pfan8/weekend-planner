import type { Message as MessageType } from "../../types";
import { MarkdownRenderer } from "../Markdown/MarkdownRenderer";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-slide-up`}
    >
      <div
        className={`relative max-w-3xl rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-xl transition-all duration-500 ${
          isUser
            ? "w-fit bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white hover:shadow-[0_25px_45px_-20px_rgba(99,102,241,0.65)]"
            : "bg-white/85 text-gray-800 backdrop-blur-xl hover:shadow-[0_25px_45px_-22px_rgba(59,130,246,0.45)] dark:bg-slate-800/85 dark:text-gray-100"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-px rounded-3xl border ${
            isUser ? "border-white/30" : "border-white/40 dark:border-white/10"
          } opacity-60`}
        />
        <div className="relative z-10">
          {isUser ? (
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>
      </div>
    </div>
  );
}
