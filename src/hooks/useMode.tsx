import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type AppMode = "news" | "articles" | "resources" | "components" | "templates" | "palettes";

export const MODE_LABELS: Record<AppMode, string> = {
  news: "Новини",
  articles: "Статті",
  resources: "Ресурси",
  components: "Компоненти",
  templates: "Сніпети",
  palettes: "Палітри",
};

export const MODE_ACCENTS: Record<AppMode, string> = {
  news: "#A4B885",
  palettes: "#8ABEB9",
  articles: "#A07DFA",
  resources: "#5DA7DB",
  components: "#F1F5F9",
  templates: "#C562AF",
};

/**
 * Every mode owns a small slice of the design system. Values are HSL triplets
 * so they can be written straight into the semantic tokens from index.css.
 */
type ModeTheme = Record<string, string>;

const MODE_THEMES: Record<AppMode, ModeTheme> = {
  news: {
    "--background": "175 38% 4%", // #050B0A
    "--card": "175 38% 6%", // #091413
    "--popover": "175 38% 6%", // #091413
    "--muted": "175 25% 12%",
    "--muted-foreground": "175 12% 65%",
    "--border": "175 25% 15%", // #132624
    "--input": "175 25% 15%",
    "--primary": "84 27% 62%", // #A4B885
    "--primary-foreground": "175 38% 6%",
    "--accent": "84 27% 62%", // #A4B885
    "--accent-foreground": "175 38% 6%",
    "--ring": "84 27% 62%",
  },
  // Default project theme (light purple accent) — restored by clearing overrides.
  articles: {},
  resources: {
    "--background": "225 10% 7%", // #111215
    "--card": "225 10% 11%",
    "--popover": "225 10% 11%",
    "--muted": "225 8% 16%",
    "--muted-foreground": "225 8% 62%",
    "--border": "225 8% 20%",
    "--input": "225 8% 20%",
    "--primary": "205 64% 61%", // #5DA7DB
    "--primary-foreground": "225 10% 7%",
    "--accent": "205 64% 61%",
    "--accent-foreground": "225 10% 7%",
    "--ring": "205 64% 61%",
  },
  components: {
    "--background": "0 0% 7%", // #121212
    "--card": "0 0% 9%",
    "--popover": "0 0% 9%",
    "--muted": "0 0% 15%",
    "--muted-foreground": "0 0% 63%",
    "--border": "0 0% 20%", // #333333
    "--input": "0 0% 20%",
    "--primary": "0 0% 100%", // #FFFFFF
    "--primary-foreground": "0 0% 7%",
    "--accent": "0 0% 100%",
    "--accent-foreground": "0 0% 7%",
    "--ring": "0 0% 100%",
  },
  templates: {
    "--background": "300 12% 6%", // deep dark canvas with plum undertone
    "--card": "300 10% 9%", // #1a1419
    "--popover": "300 10% 9%",
    "--muted": "300 8% 14%",
    "--muted-foreground": "300 6% 65%",
    "--border": "300 8% 17%", // #2e232c
    "--input": "300 8% 17%",
    "--primary": "313 47% 58%", // #C562AF
    "--primary-foreground": "0 0% 100%",
    "--accent": "313 47% 58%",
    "--accent-foreground": "0 0% 100%",
    "--ring": "313 47% 58%",
  },
  palettes: {
    "--background": "0 4% 6%", // #0F0E0E base layout
    "--card": "0 3% 9%", // #181717 card
    "--popover": "0 3% 9%", // #181717 popover
    "--muted": "0 3% 14%",
    "--muted-foreground": "0 0% 72%",
    "--border": "0 3% 16%", // #292626
    "--input": "0 3% 16%",
    "--primary": "174 29% 65%", // #8ABEB9 accent
    "--primary-foreground": "0 0% 12%",
    "--accent": "174 29% 65%", // #8ABEB9 accent
    "--accent-foreground": "0 0% 12%",
    "--ring": "174 29% 65%",
  },
};

const STORAGE_KEY = "app-mode";
const ALL_TOKENS = Array.from(
  new Set(Object.values(MODE_THEMES).flatMap((theme) => Object.keys(theme)))
);

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  modes: AppMode[];
  label: string;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

const readStoredMode = (): AppMode => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as AppMode | null;
    if (stored && stored in MODE_THEMES) return stored;
  } catch {
    /* ignore */
  }
  return "news";
};

export const ModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<AppMode>(readStoredMode);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }

    const root = document.documentElement;
    const theme = MODE_THEMES[mode];
    ALL_TOKENS.forEach((token) => {
      const value = theme[token];
      if (value) root.style.setProperty(token, value);
      else root.style.removeProperty(token);
    });
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      modes: Object.keys(MODE_THEMES) as AppMode[],
      label: MODE_LABELS[mode],
    }),
    [mode]
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) throw new Error("useMode must be used within ModeProvider");
  return context;
};
