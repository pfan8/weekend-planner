import { useEffect } from "react";
import { useChatStore } from "./store/chatStore";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { ChatContainer } from "./components/Chat/ChatContainer";
import "./index.css";

function App() {
  const { loadFromStorage } = useChatStore();

  useEffect(() => {
    // Load persisted state from localStorage
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <div className="relative mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-16">
        <div className="absolute inset-0 -z-10 scale-105 rounded-3xl bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-pink-500/15 blur-3xl opacity-80 animate-pulse-slow" />
        <div className="relative flex w-full flex-col gap-6 lg:flex-row lg:items-stretch">
          <Sidebar />
          <ChatContainer />
        </div>
      </div>
    </div>
  );
}

export default App;
