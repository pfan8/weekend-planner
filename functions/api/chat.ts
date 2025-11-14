import { buildSchema, graphql } from "graphql";

// GraphQL Schema 定义
const schema = buildSchema(`
  type Message {
    role: String!
    content: String!
  }

  input MessageInput {
    role: String!
    content: String!
  }

  type ChatResponse {
    content: String!
  }

  type Query {
    _empty: String
  }

  type Mutation {
    chat(messages: [MessageInput!]!): ChatResponse!
  }
`);

// OpenAI API 配置
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o";
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2000;

// Resolver 实现
const rootValue = {
  chat: async (args: { messages: Array<{ role: string; content: string }> }, context: { env: Record<string, unknown> }) => {
    const { messages } = args;
    const { env } = context;

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Invalid request format: messages array required");
    }

    const apiKey = env.OPENAI_API_KEY as string | undefined;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY binding");
    }

    const model = (env.OPENAI_MODEL as string | undefined) ?? DEFAULT_MODEL;
    const temperature =
      env.OPENAI_TEMPERATURE !== undefined
        ? Number(env.OPENAI_TEMPERATURE)
        : DEFAULT_TEMPERATURE;
    const maxTokens =
      env.OPENAI_MAX_TOKENS !== undefined
        ? Number(env.OPENAI_MAX_TOKENS)
        : DEFAULT_MAX_TOKENS;

    if (Number.isNaN(temperature) || Number.isNaN(maxTokens)) {
      throw new Error("Invalid OPENAI_TEMPERATURE or OPENAI_MAX_TOKENS value");
    }

    const openaiResponse = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!openaiResponse.ok) {
      const errorPayload = await openaiResponse.json().catch(() => ({}));
      console.error("OpenAI API error:", errorPayload);

      throw new Error(
        errorPayload?.error?.message ??
          `OpenAI request failed with status ${openaiResponse.status}`
      );
    }

    const data = await openaiResponse.json();
    const assistantMessage: string =
      data?.choices?.[0]?.message?.content ?? "No response generated";

    return {
      content: assistantMessage,
    };
  },
};

interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

export const onRequest = async ({ request, env }: { request: Request; env: Record<string, unknown> }) => {
  // 只允许 POST 请求
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  try {
    // 解析 GraphQL 请求
    const body = (await request.json()) as GraphQLRequest;
    const { query, variables, operationName } = body;

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({
          errors: [{ message: "GraphQL query is required" }],
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 执行 GraphQL 查询
    const result = await graphql({
      schema,
      source: query,
      rootValue,
      variableValues: variables,
      operationName,
      contextValue: { env },
    });

    // 返回 GraphQL 响应
    return new Response(JSON.stringify(result), {
      status: result.errors && result.errors.length > 0 ? 400 : 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GraphQL handler error:", error);

    return new Response(
      JSON.stringify({
        errors: [
          {
            message:
              error instanceof Error
                ? error.message
                : "Internal server error",
          },
        ],
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
