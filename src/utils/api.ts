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

export interface WeatherInfo {
  date: string;
  temperature: string;
  condition: string;
  humidity?: string;
  wind?: string;
}

export interface WeekendWeatherResponse {
  city: string;
  currentDate: string;
  currentWeather?: WeatherInfo;
  weekendDates: {
    saturday: string;
    sunday: string;
  };
  weekendWeather: {
    saturday: WeatherInfo;
    sunday: WeatherInfo;
  };
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

/**
 * Get weekend weather information for a city
 * This calls the backend API to get weather data
 */
export async function getWeekendWeather(city: string): Promise<WeekendWeatherResponse> {
  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        (error as { error?: string })?.error || "Failed to fetch weather data"
      );
    }

    const data = (await response.json()) as WeekendWeatherResponse;
    return data;
  } catch (error) {
    console.error("Weather API error:", error);
    // Return mock data if API fails (for development)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = dayOfWeek === 0 ? 6 : 6 - dayOfWeek;
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + daysUntilSunday);
    
    return {
      city,
      currentDate: today.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      weekendDates: {
        saturday: saturday.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        sunday: sunday.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
      weekendWeather: {
        saturday: {
          date: saturday.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          temperature: "20-25°C",
          condition: "晴天",
          humidity: "60%",
          wind: "微风",
        },
        sunday: {
          date: sunday.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          temperature: "22-27°C",
          condition: "多云",
          humidity: "65%",
          wind: "微风",
        },
      },
    };
  }
}
