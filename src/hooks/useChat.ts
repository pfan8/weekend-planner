import { useCallback } from "react";
import { useChatStore } from "../store/chatStore";
import { sendChatMessage } from "../utils/api";
import type { Message } from "../types";

export function useChat() {
  const {
    currentConversationId,
    isLoading,
    error,
    getCurrentConversation,
    addMessage,
    setLoading,
    setError,
  } = useChatStore();

  const sendMessage = useCallback(
    async (userContent: string) => {
      if (!currentConversationId || !userContent.trim()) {
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: userContent,
        timestamp: Date.now(),
      };

      addMessage(currentConversationId, userMessage);
      setLoading(true);
      setError(null);

      try {
        // Get current conversation messages for context
        const conversation = getCurrentConversation();
        if (!conversation) {
          throw new Error("Conversation not found");
        }

        // Prepare messages for API
        const messages = conversation.messages
          .concat(userMessage)
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

        // Send to API
        const response = await sendChatMessage(messages);

        // Add AI response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: Date.now(),
        };

        addMessage(currentConversationId, assistantMessage);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        console.error("Error sending message:", err);
      } finally {
        setLoading(false);
      }
    },
    [currentConversationId, addMessage, setLoading, setError, getCurrentConversation]
  );

  return {
    sendMessage,
    isLoading,
    error,
    conversation: getCurrentConversation(),
  };
}
