import { Plus } from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import { ConversationItem } from "./ConversationItem";

export function Sidebar() {
  const {
    conversations,
    currentConversationId,
    createConversation,
    setCurrentConversation,
    deleteConversation,
  } = useChatStore();

  const handleNewConversation = () => {
    createConversation();
  };

  return (
    <div className="animate-fade-in w-full flex flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/80 shadow-xl backdrop-blur-2xl transition-transform duration-500 hover:-translate-y-1 dark:border-white/10 dark:bg-slate-900/70 lg:w-72">
      <div className="relative overflow-hidden border-b border-white/40 bg-white/40 px-4 py-5 dark:border-white/10 dark:bg-white/5">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-400/20 via-indigo-500/20 to-fuchsia-500/20 blur-2xl opacity-60" />
        <div className="relative">
          <button
            onClick={handleNewConversation}
            className="btn-primary flex w-full items-center justify-center gap-2 text-sm font-medium uppercase tracking-wide"
          >
            <Plus size={20} />
            New Chat
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin">
        <div className="flex flex-col gap-3">
          {conversations.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/40 bg-white/40 py-10 text-center text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              No conversations yet
            </p>
          ) : (
            conversations.map((conversation, index) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === currentConversationId}
                onSelect={setCurrentConversation}
                onDelete={deleteConversation}
                accentIndex={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
