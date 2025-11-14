import { create } from "zustand";
import type {
  PlannerState,
  PlanType,
  PlanOption,
  TimelineItem,
  WeekendInfo,
  Message,
} from "../types";

interface PlannerStoreState extends PlannerState {
  // Actions
  setCity: (city: string) => void;
  setPlanType: (type: PlanType | null) => void;
  setWeekendInfo: (info: WeekendInfo | null) => void;
  setPlanOptions: (options: PlanOption[]) => void;
  setSelectedPlanIndex: (index: number | null) => void;
  setTimeline: (timeline: TimelineItem[]) => void;
  setLoading: (loading: boolean) => void;
  setLoadingWeather: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setAskDialogOpen: (open: boolean) => void;
  addAskMessage: (message: Message) => void;
  clearAskMessages: () => void;
  reset: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = "weekend-planner-store";

// Helper function to get weekend dates
function getWeekendDates(): { saturday: string; sunday: string } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Calculate days until Saturday (0 = Sunday, 6 = Saturday)
  const daysUntilSaturday = dayOfWeek === 0 ? 6 : 6 - dayOfWeek;
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  
  const sunday = new Date(today);
  sunday.setDate(today.getDate() + daysUntilSunday);
  
  return {
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
  };
}

const initialState: PlannerState = {
  city: "杭州",
  planType: null,
  weekendInfo: null,
  planOptions: [],
  selectedPlanIndex: null,
  timeline: [],
  timelinesByPlanIndex: {},
  isLoading: false,
  isLoadingWeather: false,
  error: null,
  theme: "dark",
  isAskDialogOpen: false,
  askMessages: [],
};

export const usePlannerStore = create<PlannerStoreState>((set, get) => ({
  ...initialState,

  setCity: (city) => {
    set({ city });
    // Reset weekend info when city changes
    set({ 
      weekendInfo: null, 
      planOptions: [], 
      selectedPlanIndex: null, 
      timeline: [],
      timelinesByPlanIndex: {}
    });
    get().saveToStorage();
  },

  setPlanType: (type) => {
    set({ planType: type });
    // Reset plans when type changes
    set({ 
      planOptions: [], 
      selectedPlanIndex: null, 
      timeline: [],
      timelinesByPlanIndex: {}
    });
    get().saveToStorage();
  },

  setWeekendInfo: (info) => {
    set({ weekendInfo: info });
    get().saveToStorage();
  },

  setPlanOptions: (options) => {
    // When plan options change, clear selected index and timeline
    // But keep timelinesByPlanIndex for existing plans
    const state = get();
    const newTimelinesByPlanIndex: Record<number, TimelineItem[]> = {};
    
    // Preserve timelines for plans that still exist (by matching IDs)
    options.forEach((newPlan, newIndex) => {
      const oldIndex = state.planOptions.findIndex(p => p.id === newPlan.id);
      if (oldIndex !== -1 && state.timelinesByPlanIndex[oldIndex]) {
        newTimelinesByPlanIndex[newIndex] = state.timelinesByPlanIndex[oldIndex];
      }
    });
    
    set({ 
      planOptions: options, 
      selectedPlanIndex: null, 
      timeline: [],
      timelinesByPlanIndex: newTimelinesByPlanIndex
    });
    get().saveToStorage();
  },

  setSelectedPlanIndex: (index) => {
    const state = get();
    let timeline: TimelineItem[] = [];
    
    // If switching to a plan that has a saved timeline, restore it
    if (index !== null && state.timelinesByPlanIndex[index]) {
      timeline = state.timelinesByPlanIndex[index];
    }
    
    set({ selectedPlanIndex: index, timeline });
    get().saveToStorage();
  },

  setTimeline: (timeline) => {
    const state = get();
    const timelinesByPlanIndex = { ...state.timelinesByPlanIndex };
    
    // Save timeline for current selected plan
    if (state.selectedPlanIndex !== null) {
      timelinesByPlanIndex[state.selectedPlanIndex] = timeline;
    }
    
    set({ timeline, timelinesByPlanIndex });
    get().saveToStorage();
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setLoadingWeather: (loading) => {
    set({ isLoadingWeather: loading });
  },

  setError: (error) => {
    set({ error });
  },

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

  setAskDialogOpen: (open) => {
    set({ isAskDialogOpen: open });
  },

  addAskMessage: (message) => {
    set((state) => ({
      askMessages: [...state.askMessages, message],
    }));
    get().saveToStorage();
  },

  clearAskMessages: () => {
    set({ askMessages: [] });
    get().saveToStorage();
  },

  reset: () => {
    set({
      ...initialState,
      city: get().city,
      theme: get().theme,
      timelinesByPlanIndex: {},
    });
    get().saveToStorage();
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Initialize weekend info if not present
        let weekendInfo = data.weekendInfo;
        if (!weekendInfo) {
          const weekendDates = getWeekendDates();
          const currentDate = new Date().toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          
          weekendInfo = {
            city: data.city || initialState.city,
            currentDate,
            weekendDates,
          };
        }
        
        const selectedPlanIndex = data.selectedPlanIndex ?? null;
        const timelinesByPlanIndex = data.timelinesByPlanIndex || {};
        
        // Restore timeline for selected plan if it exists
        let timeline: TimelineItem[] = [];
        if (selectedPlanIndex !== null && timelinesByPlanIndex[selectedPlanIndex]) {
          timeline = timelinesByPlanIndex[selectedPlanIndex];
        } else if (data.timeline) {
          // Fallback: use old timeline format if exists
          timeline = data.timeline;
          // Migrate old timeline to new format
          if (selectedPlanIndex !== null) {
            timelinesByPlanIndex[selectedPlanIndex] = timeline;
          }
        }
        
        set({
          city: data.city || initialState.city,
          planType: data.planType || null,
          weekendInfo,
          planOptions: data.planOptions || [],
          selectedPlanIndex,
          timeline,
          timelinesByPlanIndex,
          isLoading: false,
          isLoadingWeather: false,
          error: null,
          theme: data.theme || "dark",
          isAskDialogOpen: false,
          askMessages: data.askMessages || [],
        });

        // Apply theme
        const theme = data.theme || "dark";
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        // Initialize with default weekend info
        const weekendDates = getWeekendDates();
        const currentDate = new Date().toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        
        set({
          weekendInfo: {
            city: initialState.city,
            currentDate,
            weekendDates,
          },
        });
        get().saveToStorage();
      }
    } catch (error) {
      console.error("Failed to load from storage:", error);
      // Initialize with default weekend info on error
      const weekendDates = getWeekendDates();
      const currentDate = new Date().toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      set({
        weekendInfo: {
          city: initialState.city,
          currentDate,
          weekendDates,
        },
      });
    }
  },

  saveToStorage: () => {
    try {
      const state = get();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          city: state.city,
          planType: state.planType,
          weekendInfo: state.weekendInfo,
          planOptions: state.planOptions,
          selectedPlanIndex: state.selectedPlanIndex,
          timeline: state.timeline,
          timelinesByPlanIndex: state.timelinesByPlanIndex,
          theme: state.theme,
          askMessages: state.askMessages,
        })
      );
    } catch (error) {
      console.error("Failed to save to storage:", error);
    }
  },
}));

