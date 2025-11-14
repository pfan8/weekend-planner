import { useEffect, useRef } from "react";
import type { Message as MessageType } from "../../types";
import { Message } from "./Message";

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-gray-600 dark:text-gray-300">
        <div className="animate-fade-in rounded-3xl border border-dashed border-white/40 bg-white/40 px-10 py-12 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <h2 className="mb-3 text-3xl font-semibold tracking-wide text-gray-800 dark:text-gray-100">
            Welcome to AI Chat
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Start a new conversation by typing a message below
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
      <div className="flex flex-col space-y-4">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="rounded-3xl rounded-tl-none bg-white/80 px-5 py-4 shadow-lg backdrop-blur-xl transition-all duration-300 dark:bg-slate-800/80">
              <div className="flex space-x-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.2s] dark:bg-gray-300" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.05s] dark:bg-gray-300" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:0.1s] dark:bg-gray-300" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
