export interface ChatRequest {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export interface ChatResponse {
  content: string;
}

interface GraphQLResponse {
  data?: {
    chat: ChatResponse;
  };
  errors?: Array<{
    message: string;
  }>;
}

/**
 * Send a chat request to the Cloudflare Workers API using GraphQL
 */
export async function sendChatMessage(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  try {
    // GraphQL mutation 查询
    const query = `
      mutation Chat($messages: [MessageInput!]!) {
        chat(messages: $messages) {
          content
        }
      }
    `;

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          messages,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        (error as GraphQLResponse)?.errors?.[0]?.message ||
          error.error ||
          "Failed to send message"
      );
    }

    const data = (await response.json()) as GraphQLResponse;

    // 检查 GraphQL 错误
    if (data.errors && data.errors.length > 0) {
      throw new Error(data.errors[0].message || "GraphQL error occurred");
    }

    // 检查响应数据
    if (!data?.data?.chat?.content || typeof data.data.chat.content !== "string") {
      throw new Error("Invalid response format from chat API");
    }

    return data.data.chat.content;
  } catch (error) {
    console.error("Chat API error:", error);
    throw error;
  }
}
