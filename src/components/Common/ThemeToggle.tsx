import { Moon, Sun } from "lucide-react";
import { useChatStore } from "../../store/chatStore";

export function ThemeToggle() {
  const { theme, toggleTheme } = useChatStore();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-full border border-white/40 bg-white/60 p-2 text-gray-700 shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60 dark:text-gray-100"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
