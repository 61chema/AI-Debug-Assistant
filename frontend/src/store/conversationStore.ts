/**
 * Global state store using Zustand.
 *
 * Zustand is a simple state management library for React.
 * Think of it as a global "box" where you put data that
 * multiple components need to share.
 */
import { create } from "zustand";
import type { Annotation, Feature, Level } from "../types/api.types";
import type { AppLanguage } from "../utils/translations";

type Theme = "dark" | "light";

interface ConversationState {
  // The text currently being streamed from Claude
  streamingText: string;
  // Line annotations extracted from Claude's explain response
  annotations: Annotation[];
  // Whether a request is in progress
  isStreaming: boolean;
  // The ID of the current conversation (for follow-up questions)
  conversationId: string | null;
  // The feature being used right now
  currentFeature: Feature | null;
  // The selected experience level
  level: Level;
  // The app UI language
  appLanguage: AppLanguage;
  // The color theme (light / dark)
  theme: Theme;

  // Actions (functions that update the state)
  setStreamingText: (text: string) => void;
  appendStreamingText: (chunk: string) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  setIsStreaming: (value: boolean) => void;
  setConversationId: (id: string | null) => void;
  setCurrentFeature: (feature: Feature | null) => void;
  setLevel: (level: Level) => void;
  setAppLanguage: (lang: AppLanguage) => void;
  setTheme: (theme: Theme) => void;
  reset: () => void;
}

// Initialise theme from localStorage and apply the CSS class to <html> immediately.
// This runs once when the store module is first imported (before React renders).
function initTheme(): Theme {
  const saved = (localStorage.getItem("theme") as Theme) || "dark";
  document.documentElement.classList.toggle("dark", saved === "dark");
  return saved;
}

export const useConversationStore = create<ConversationState>((set) => ({
  streamingText: "",
  annotations: [],
  isStreaming: false,
  conversationId: null,
  currentFeature: null,
  level: (localStorage.getItem("preferred_level") as Level) || "junior",
  appLanguage: (localStorage.getItem("app_language") as AppLanguage) || "es",
  theme: initTheme(),

  setStreamingText: (text) => set({ streamingText: text }),
  appendStreamingText: (chunk) =>
    set((state) => ({ streamingText: state.streamingText + chunk })),
  setAnnotations: (annotations) => set({ annotations }),
  setIsStreaming: (value) => set({ isStreaming: value }),
  setConversationId: (id) => set({ conversationId: id }),
  setCurrentFeature: (feature) => set({ currentFeature: feature }),
  setLevel: (level) => {
    localStorage.setItem("preferred_level", level);
    set({ level });
  },
  setAppLanguage: (lang) => {
    localStorage.setItem("app_language", lang);
    set({ appLanguage: lang });
  },
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },
  reset: () =>
    set({ streamingText: "", annotations: [], isStreaming: false }),
}));
