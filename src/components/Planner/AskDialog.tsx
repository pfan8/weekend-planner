import { useState, useRef, useEffect } from "react";
import { usePlannerStore } from "../../store/plannerStore";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import type { Message } from "../../types";

interface AskDialogProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export function AskDialog({ onSendMessage, isLoading = false }: AskDialogProps) {
  const {
    isAskDialogOpen,
    askMessages,
    selectedPlanIndex,
    planOptions,
    setAskDialogOpen,
    addAskMessage,
  } = usePlannerStore();

  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isAskDialogOpen) {
      scrollToBottom();
    }
  }, [askMessages, isAskDialogOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 150) + "px";
    }
  }, [input]);

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: Date.now(),
      };

      addAskMessage(userMessage);
      setInput("");

      try {
        await onSendMessage(input);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedPlan = selectedPlanIndex !== null ? planOptions[selectedPlanIndex] : null;

  if (!isAskDialogOpen && !isMinimized) {
    return (
      <button
        onClick={() => setAskDialogOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl transition-all hover:scale-110 hover:shadow-blue-500/50"
        aria-label="打开对话"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all dark:border-gray-700 dark:bg-slate-800 ${
        isMinimized ? "h-16 w-80" : "h-[600px] w-96"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 dark:border-gray-700">
        <h3 className="font-semibold text-white">与 AI 对话</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-lg p-1 text-white transition-colors hover:bg-white/20"
            aria-label={isMinimized ? "展开" : "最小化"}
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setAskDialogOpen(false);
              setIsMinimized(false);
            }}
            className="rounded-lg p-1 text-white transition-colors hover:bg-white/20"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Context Info */}
          <div className="border-b border-gray-200 bg-blue-50 px-4 py-2 text-xs text-gray-700 dark:border-gray-700 dark:bg-blue-900/20 dark:text-gray-300">
            {selectedPlan ? (
              <p>
                <span className="font-semibold">当前方案：</span>
                {selectedPlan.name}
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                💡 提示：您可以询问问题，或说"调整方案"、"修改行程"等来生成新的方案或时间线
              </p>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {askMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center px-4">
                <div>
                  <MessageCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    有什么问题想问吗？
                  </p>
                  <div className="mt-4 space-y-2 text-left">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      您可以：
                    </p>
                    <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-500">
                      <li>• 询问关于方案的问题</li>
                      <li>• 说"调整方案"生成新方案</li>
                      <li>• 说"修改行程"生成新时间线</li>
                      <li>• 提出具体调整需求</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {askMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900 dark:bg-slate-700 dark:text-gray-100"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-gray-100 px-4 py-2 dark:bg-slate-700">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.2s]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.05s]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:0.1s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-slate-900">
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您的问题..."
                disabled={isLoading}
                className="flex-1 resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-100"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="发送"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

