import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type AppMode = "articles" | "resources" | "components" | "templates";

export const MODE_LABELS: Record<AppMode, string> = {
  articles: "Статті",
  resources: "Ресурси",
  components: "Компоненти",
  templates: "Шаблони коду",
};

/**
 * Every mode owns a small slice of the design system. Values are HSL triplets
 * so they can be written straight into the semantic tokens from index.css.
 */
type ModeTheme = Record<string, string>;

const MODE_THEMES: Record<AppMode, ModeTheme> = {
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
    "--background": "220 18% 8%",
    "--card": "220 16% 12%",
    "--popover": "220 16% 12%",
    "--muted": "220 12% 17%",
    "--muted-foreground": "220 10% 62%",
    "--border": "220 12% 22%",
    "--input": "220 12% 22%",
    "--primary": "160 55% 55%",
    "--primary-foreground": "220 18% 8%",
    "--accent": "160 55% 55%",
    "--accent-foreground": "220 18% 8%",
    "--ring": "160 55% 55%",
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
  return "articles";
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
