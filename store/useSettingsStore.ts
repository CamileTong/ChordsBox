import { create } from "zustand";
import { ColorScheme, UserSettings } from "@/types";

interface SettingsState {
  settings: UserSettings;
  setCurrentScheme: (schemeId: string) => void;
  addColorScheme: (scheme: ColorScheme) => void;
  updateColorScheme: (id: string, scheme: Partial<ColorScheme>) => void;
  deleteColorScheme: (id: string) => void;
  loadSettings: () => void;
  saveSettings: () => void;
}

const defaultSettings: UserSettings = {
  colorSchemes: [
    {
      id: "eye-care",
      name: "护眼",
      colors: {
        background: "#f5f5dc",
        lyrics: "#333333",
        chord: "#d62828",
      },
    },
    {
      id: "dark",
      name: "深色",
      colors: {
        background: "#1a1a1a",
        lyrics: "#ffffff",
        chord: "#ffd700",
      },
    },
    {
      id: "light",
      name: "亮色",
      colors: {
        background: "#ffffff",
        lyrics: "#000000",
        chord: "#0066cc",
      },
    },
  ],
  currentSchemeId: "eye-care",
  commonChords: [
    "Am",
    "G",
    "Dm",
    "C",
    "F",
    "E",
    "A",
    "D",
    "Bm",
    "Em",
    "Fmaj7",
    "Cmaj7",
    "Gsus4",
    "E7",
  ],
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,

  setCurrentScheme: (schemeId: string) => {
    set((state) => ({
      settings: {
        ...state.settings,
        currentSchemeId: schemeId,
      },
    }));
    get().saveSettings();
  },

  addColorScheme: (scheme: ColorScheme) => {
    set((state) => ({
      settings: {
        ...state.settings,
        colorSchemes: [...state.settings.colorSchemes, scheme],
      },
    }));
    get().saveSettings();
  },

  updateColorScheme: (id: string, scheme: Partial<ColorScheme>) => {
    set((state) => ({
      settings: {
        ...state.settings,
        colorSchemes: state.settings.colorSchemes.map((s) =>
          s.id === id ? { ...s, ...scheme } : s
        ),
      },
    }));
    get().saveSettings();
  },

  deleteColorScheme: (id: string) => {
    set((state) => ({
      settings: {
        ...state.settings,
        colorSchemes: state.settings.colorSchemes.filter((s) => s.id !== id),
        // 如果删除的是当前方案，切换到第一个
        currentSchemeId:
          state.settings.currentSchemeId === id
            ? state.settings.colorSchemes[0]?.id || "light"
            : state.settings.currentSchemeId,
      },
    }));
    get().saveSettings();
  },

  loadSettings: () => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("chordsbox-settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ settings: { ...defaultSettings, ...parsed } });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  },

  saveSettings: () => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem("chordsbox-settings", JSON.stringify(get().settings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  },
}));
