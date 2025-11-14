import { useChat } from "../../hooks/useChat";
import { useChatStore } from "../../store/chatStore";
import { MessageList } from "./MessageList";
import { InputBox } from "./InputBox";
import { Header } from "../Common/Header";

export function ChatContainer() {
  const { sendMessage, isLoading, error } = useChat();
  const conversation = useChatStore((state) => state.getCurrentConversation());

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-3xl border border-white/40 bg-white/80 px-8 py-16 text-sm text-gray-600 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70">
        <p className="animate-pulse text-base font-semibold tracking-wide text-gray-500 dark:text-gray-300">
          Initialising your chat space...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/90 shadow-[0_30px_60px_-35px_rgba(59,130,246,0.6)] backdrop-blur-2xl transition-transform duration-500 hover:-translate-y-1 dark:border-white/10 dark:bg-slate-900/70 min-h-[65vh] lg:min-h-[70vh]">
      <Header title={conversation.title} />
      <MessageList messages={conversation.messages} isLoading={isLoading} />
      {error && (
        <div className="bg-red-100/80 px-4 py-2 text-red-700 backdrop-blur-sm dark:bg-red-900/60 dark:text-red-200">
          <p className="text-sm">{error}</p>
        </div>
      )}
      <InputBox onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
