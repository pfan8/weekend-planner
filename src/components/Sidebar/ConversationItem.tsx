import type { Conversation } from "../../types";
import { Trash2 } from "lucide-react";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  accentIndex?: number;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  accentIndex = 0,
}: ConversationItemProps) {
  const accentPalettes = [
    "from-sky-500 via-indigo-500 to-purple-500",
    "from-emerald-400 via-blue-500 to-indigo-500",
    "from-amber-400 via-rose-500 to-purple-500",
  ];

  const accentBackground =
    accentPalettes[accentIndex % accentPalettes.length] || accentPalettes[0];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white/70 transition-all duration-300 dark:bg-slate-900/60 ${isActive ? "border-transparent shadow-[0_20px_40px_-24px_rgba(79,70,229,0.65)]" : "border-white/20 hover:border-white/50 dark:border-white/10 dark:hover:border-white/30"}`}
      onClick={() => onSelect(conversation.id)}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${accentBackground} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.35] dark:group-hover:opacity-40`}
      />
      {isActive && (
        <div
          className={`absolute inset-0 bg-gradient-to-r ${accentBackground} opacity-90`}
        />
      )}
      <div className="relative z-10 flex items-center justify-between p-4">
        <div className="flex-1 overflow-hidden">
          <p
            className={`truncate text-sm font-semibold tracking-wide ${
              isActive ? "text-white" : "text-gray-700 dark:text-gray-100"
            }`}
          >
            {conversation.title}
          </p>
          <p
            className={`mt-1 text-xs font-medium ${
              isActive
                ? "text-white/80"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {conversation.messages.length} messages
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(conversation.id);
          }}
          className={`relative z-10 rounded-full p-1 transition-all duration-300 ${
            isActive
              ? "text-white hover:bg-white/20"
              : "text-gray-500 hover:bg-white/60 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100"
          } opacity-0 group-hover:opacity-100`}
          title="Delete conversation"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
