import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function InputBox({ onSend, disabled = false }: InputBoxProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-white/40 bg-white/70 px-6 py-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for newline)"
          disabled={disabled}
          className="scrollbar-hide flex-1 resize-none rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-gray-900 shadow-inner transition-all duration-300 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-slate-900/70 dark:text-gray-100 dark:placeholder-gray-500"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="btn-primary flex h-12 w-full items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wide sm:w-36"
          title="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
