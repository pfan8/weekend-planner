export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  theme: "light" | "dark";
}

// Weekend Planner Types
export type PlanType = "旅游" | "运动";

export interface PlanOption {
  id: string;
  name: string;
  pros: string[];
  cons: string[];
}

export interface TimelineItem {
  id: string;
  time: string; // Format: "09:00", "10:30", etc.
  action: string;
  route?: {
    type: "公交" | "驾驶" | "步行" | "地铁";
    description: string; // e.g., "乘坐地铁1号线，约30分钟"
  };
}

export interface WeatherInfo {
  date: string;
  temperature: string;
  condition: string;
  humidity?: string;
  wind?: string;
}

export interface WeekendInfo {
  city: string;
  currentDate: string;
  currentWeather?: WeatherInfo;
  weekendDates: {
    saturday: string;
    sunday: string;
  };
  weekendWeather?: {
    saturday: WeatherInfo;
    sunday: WeatherInfo;
  };
}

export interface PlannerState {
  // User selections
  city: string;
  planType: PlanType | null;
  
  // Weekend information
  weekendInfo: WeekendInfo | null;
  
  // Plan options
  planOptions: PlanOption[];
  selectedPlanIndex: number | null;
  
  // Timeline - current timeline for selected plan
  timeline: TimelineItem[];
  // Timelines by plan index - store timelines for each plan
  timelinesByPlanIndex: Record<number, TimelineItem[]>;
  
  // UI state
  isLoading: boolean;
  isLoadingWeather: boolean;
  error: string | null;
  theme: "light" | "dark";
  
  // Ask dialog state
  isAskDialogOpen: boolean;
  askMessages: Message[];
}
