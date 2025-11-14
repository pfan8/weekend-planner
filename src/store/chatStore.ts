import { create } from "zustand";
import type { Conversation, Message } from "../types";

interface ChatStoreState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  theme: "light" | "dark";

  // Actions
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getCurrentConversation: () => Conversation | null;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = "ai-chat-store";

export const useChatStore = create<ChatStoreState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  error: null,
  theme: "dark",

  setTheme: (theme) => {
    set({ theme });
    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    get().saveToStorage();
  },

  toggleTheme: () => {
    const current = get().theme;
    get().setTheme(current === "dark" ? "light" : "dark");
  },

  createConversation: (title) => {
    const id = Date.now().toString();
    const conversation: Conversation = {
      id,
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      conversations: [conversation, ...state.conversations],
      currentConversationId: id,
    }));

    get().saveToStorage();
    return id;
  },

  deleteConversation: (id) => {
    set((state) => {
      const remaining = state.conversations.filter((c) => c.id !== id);
      const nextId =
        state.currentConversationId === id
          ? remaining[0]?.id ?? null
          : state.currentConversationId;

      return {
        conversations: remaining,
        currentConversationId: nextId,
      };
    });

    const { conversations, currentConversationId, createConversation } = get();

    if (conversations.length === 0) {
      createConversation();
      return;
    }

    if (!currentConversationId) {
      set({ currentConversationId: conversations[0].id });
    }

    get().saveToStorage();
  },

  setCurrentConversation: (id) => {
    set({ currentConversationId: id });
    get().saveToStorage();
  },

  addMessage: (conversationId, message) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: Date.now(),
            }
          : conv
      ),
    }));
    get().saveToStorage();
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  getCurrentConversation: () => {
    const state = get();
    return (
      state.conversations.find((c) => c.id === state.currentConversationId) ||
      null
    );
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set({
          conversations: data.conversations || [],
          currentConversationId: data.currentConversationId,
          theme: data.theme || "dark",
        });

        const state = get();
        const hasCurrent = state.conversations.some(
          (conversation) => conversation.id === state.currentConversationId
        );

        if (state.conversations.length === 0) {
          state.createConversation();
        } else if (!hasCurrent) {
          set({ currentConversationId: state.conversations[0].id });
        }

        // Apply theme
        if (data.theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        // Create default conversation
        get().createConversation();
      }
    } catch (error) {
      console.error("Failed to load from storage:", error);
      get().createConversation();
    }
  },

  saveToStorage: () => {
    try {
      const state = get();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          conversations: state.conversations,
          currentConversationId: state.currentConversationId,
          theme: state.theme,
        })
      );
    } catch (error) {
      console.error("Failed to save to storage:", error);
    }
  },
}));
