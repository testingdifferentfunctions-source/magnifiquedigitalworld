import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type AppMode = "news" | "articles" | "resources" | "components" | "templates" | "research" | "palettes" | "design" | "dictionary" | "editor";

export type Language = "uk" | "en";

export interface ModeInfo {
  label: Record<Language, string>;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  searchPlaceholder: Record<Language, string>;
  emptySearch: Record<Language, string>;
  emptyDefault: Record<Language, string>;
}

export const MODE_METADATA: Record<AppMode, ModeInfo> = {
  news: {
    label: { uk: "Новини", en: "News" },
    title: { uk: "Новини", en: "Latest News" },
    subtitle: {
      uk: "Свіжі новини IT-індустрії, релізи мов програмування, веб-технологій та штучного інтелекту.",
      en: "Latest IT industry news, programming language releases, web tech, and AI updates.",
    },
    searchPlaceholder: {
      uk: "Пошук новин...",
      en: "Search news...",
    },
    emptySearch: {
      uk: "Нічого не знайдено за вашим запитом",
      en: "No news found matching your query",
    },
    emptyDefault: {
      uk: "Ще немає новин",
      en: "No news yet",
    },
  },
  articles: {
    label: { uk: "Статті", en: "Articles" },
    title: { uk: "Останні статті", en: "Latest Articles" },
    subtitle: {
      uk: "Вивчайте програмування разом з нами",
      en: "Learn programming with us",
    },
    searchPlaceholder: {
      uk: "Пошук статей...",
      en: "Search articles...",
    },
    emptySearch: {
      uk: "Статей не знайдено",
      en: "No articles found",
    },
    emptyDefault: {
      uk: "Немає статей",
      en: "No articles yet",
    },
  },
  resources: {
    label: { uk: "Ресурси", en: "Resources" },
    title: { uk: "Ресурси", en: "Resources" },
    subtitle: {
      uk: "Корисні сервіси, інструменти та платформи для навчання й продуктивної розробки.",
      en: "Useful services, tools, and platforms for learning and productive development.",
    },
    searchPlaceholder: {
      uk: "Пошук ресурсів та інструментів...",
      en: "Search resources & tools...",
    },
    emptySearch: {
      uk: "Нічого не знайдено за вашим запитом",
      en: "No resources found matching your query",
    },
    emptyDefault: {
      uk: "Ще немає ресурсів",
      en: "No resources yet",
    },
  },
  components: {
    label: { uk: "Компоненти", en: "Components" },
    title: { uk: "Компоненти", en: "Components" },
    subtitle: {
      uk: "Бібліотеки, пакети та фреймворки для ваших проєктів.",
      en: "Libraries, packages, and frameworks for your projects.",
    },
    searchPlaceholder: {
      uk: "Пошук бібліотек та компонентів...",
      en: "Search libraries & components...",
    },
    emptySearch: {
      uk: "Нічого не знайдено за вашим запитом",
      en: "No components found matching your query",
    },
    emptyDefault: {
      uk: "Ще немає компонентів",
      en: "No components yet",
    },
  },
  templates: {
    label: { uk: "Сніпети", en: "Snippets" },
    title: { uk: "Сніпети", en: "Code Snippets" },
    subtitle: {
      uk: "Готові до копіювання сніпети, функції та шаблони коду для швидкої розробки.",
      en: "Ready-to-copy code snippets, functions, and templates for rapid development.",
    },
    searchPlaceholder: {
      uk: "Пошук сніпетів коду...",
      en: "Search code snippets...",
    },
    emptySearch: {
      uk: "Нічого не знайдено за вашим запитом",
      en: "No snippets found matching your query",
    },
    emptyDefault: {
      uk: "Ще немає сніпетів коду",
      en: "No snippets yet",
    },
  },
  research: {
    label: { uk: "Дослідження", en: "Research" },
    title: { uk: "IT-Дослідження та Аналітика", en: "IT Research & Analysis" },
    subtitle: {
      uk: "Візуалізовані дослідження, аналітичні звіти та технологічні інсайти в IT-індустрії.",
      en: "Visualized research articles, analytical reports, and technological insights in IT.",
    },
    searchPlaceholder: {
      uk: "Пошук досліджень та звітів...",
      en: "Search research articles & reports...",
    },
    emptySearch: {
      uk: "Досліджень не знайдено за вашим запитом",
      en: "No research found matching your query",
    },
    emptyDefault: {
      uk: "Ще немає опублікованих досліджень",
      en: "No research articles yet",
    },
  },
  palettes: {
    label: { uk: "Палітри", en: "Palettes" },
    title: { uk: "Палітри", en: "Color Palettes" },
    subtitle: {
      uk: "Добірка колірних палітр реальних вебсайтів для вашого натхнення та швидкої інтеграції.",
      en: "Curated color palettes from real websites for inspiration and fast integration.",
    },
    searchPlaceholder: {
      uk: "Пошук колірних палітр...",
      en: "Search color palettes...",
    },
    emptySearch: {
      uk: "Нічого не знайдено за вашим запитом",
      en: "No palettes found matching your query",
    },
    emptyDefault: {
      uk: "Ще немає доданих палітр",
      en: "No palettes yet",
    },
  },
  design: {
    label: { uk: "Дизайн", en: "Design" },
    title: { uk: "UI-Елементи та Градієнти", en: "UI Elements & Gradients" },
    subtitle: {
      uk: "Ексклюзивні UI-компоненти, естетичні градієнти та готові стилі для сучасного веб-дизайну.",
      en: "Exclusive UI components, aesthetic gradients, and ready-to-use styles for modern web design.",
    },
    searchPlaceholder: {
      uk: "Пошук дизайнів, градієнтів та UI-елементів...",
      en: "Search designs, gradients & UI elements...",
    },
    emptySearch: {
      uk: "Дизайнів не знайдено за вашим запитом",
      en: "No designs found matching your query",
    },
    emptyDefault: {
      uk: "Ще немає доданих дизайнів",
      en: "No designs yet",
    },
  },
  dictionary: {
    label: { uk: "Словник", en: "Dictionary" },
    title: { uk: "IT-Словник", en: "IT Dictionary" },
    subtitle: {
      uk: "Грунтовні пояснення технічних термінів, концепцій компʼютерних наук та архітектурних патернів.",
      en: "In-depth explanations of technical terms, computer science concepts, and architectural patterns.",
    },
    searchPlaceholder: {
      uk: "Пошук термінів у словнику...",
      en: "Search technical terms in dictionary...",
    },
    emptySearch: {
      uk: "Термінів не знайдено за вашим запитом",
      en: "No dictionary terms found matching your query",
    },
    emptyDefault: {
      uk: "Ще немає доданих термінів",
      en: "No dictionary terms yet",
    },
  },
  editor: {
    label: { uk: "Редактор", en: "Editor" },
    title: { uk: "Онлайн-Редактор Коду", en: "Online Code Editor" },
    subtitle: {
      uk: "Пишіть та виконуйте код Python безпосередньо у браузері через WebAssembly (Pyodide) без серверного навантаження.",
      en: "Write and execute Python code directly in your browser via WebAssembly (Pyodide) with zero server latency.",
    },
    searchPlaceholder: {
      uk: "Пошук коду та функцій...",
      en: "Search code & functions...",
    },
    emptySearch: {
      uk: "Нічого не знайдено за вашим запитом",
      en: "No results found matching your query",
    },
    emptyDefault: {
      uk: "Консоль готова до роботи",
      en: "Console ready for execution",
    },
  },
};

export const MODE_LABELS: Record<AppMode, string> = {
  news: "Новини",
  articles: "Статті",
  resources: "Ресурси",
  components: "Компоненти",
  templates: "Сніпети",
  research: "Дослідження",
  palettes: "Палітри",
  design: "Дизайн",
  dictionary: "Словник",
  editor: "Редактор",
};

export const getModeLabel = (mode: AppMode, lang: Language = "uk"): string => {
  return MODE_METADATA[mode]?.label[lang] || MODE_LABELS[mode] || mode;
};

export const getModeTitle = (mode: AppMode, lang: Language = "uk"): string => {
  return MODE_METADATA[mode]?.title[lang] || MODE_METADATA[mode]?.label[lang] || mode;
};

export const getModeSubtitle = (mode: AppMode, lang: Language = "uk"): string => {
  return MODE_METADATA[mode]?.subtitle[lang] || "";
};

export const getModeSearchPlaceholder = (mode: AppMode, lang: Language = "uk"): string => {
  return MODE_METADATA[mode]?.searchPlaceholder[lang] || (lang === "en" ? "Search..." : "Пошук...");
};

export const getModeEmptyMessage = (
  mode: AppMode,
  isSearching: boolean,
  lang: Language = "uk"
): string => {
  const meta = MODE_METADATA[mode];
  if (!meta) return isSearching ? (lang === "en" ? "No results found" : "Нічого не знайдено") : "";
  return isSearching ? meta.emptySearch[lang] : meta.emptyDefault[lang];
};

export const MODE_ACCENTS: Record<AppMode, string> = {
  news: "#A4B885",
  palettes: "#8ABEB9",
  design: "#FFBCBC",
  articles: "#A07DFA",
  resources: "#5DA7DB",
  components: "#F1F5F9",
  templates: "#C562AF",
  research: "#F78D60",
  dictionary: "#F3CD97",
  editor: "#BDA6CE",
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
  research: {
    "--background": "0 0% 5.9%", // #0F0F0F pure IT research dark background
    "--card": "0 0% 8.6%", // #161616 card surface
    "--popover": "0 0% 8.6%",
    "--muted": "0 0% 14%",
    "--muted-foreground": "0 0% 70%",
    "--border": "0 0% 18%", // #2e2e2e
    "--input": "0 0% 18%",
    "--primary": "18 90% 67%", // #F78D60 accent
    "--primary-foreground": "0 0% 6%",
    "--accent": "18 90% 67%", // #F78D60
    "--accent-foreground": "0 0% 6%",
    "--ring": "18 90% 67%",
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
  design: {
    "--background": "263 100% 1.6%", // #030008 deep soft black primary background
    "--card": "248 100% 12.5%", // #090040 deep flat card container
    "--popover": "263 100% 1.6%", // #030008 dropdown / popover menu container
    "--muted": "248 40% 16%", // #171145
    "--muted-foreground": "263 15% 72%", // #a69fb0
    "--border": "248 40% 21%", // #1b1458
    "--input": "248 40% 21%", // #1b1458
    "--primary": "0 100% 87%", // #FFBCBC pastel peach accent
    "--primary-foreground": "263 100% 1.6%", // #030008 high contrast dark text
    "--accent": "0 100% 87%", // #FFBCBC
    "--accent-foreground": "263 100% 1.6%", // #030008
    "--ring": "0 100% 87%",
  },
  dictionary: {
    "--background": "0 60% 2%", // #080202 deep dark background
    "--card": "0 20% 6%", // #140c0c card container
    "--popover": "0 20% 6%", // #140c0c
    "--muted": "0 15% 10%", // #1e1414
    "--muted-foreground": "0 10% 70%", // #b8a8a8
    "--border": "0 15% 15%", // #2a1d1d
    "--input": "0 15% 15%", // #2a1d1d
    "--primary": "35 79% 77%", // #F3CD97 softer gold accent
    "--primary-foreground": "0 60% 2%", // #080202
    "--accent": "35 79% 77%", // #F3CD97
    "--accent-foreground": "0 60% 2%", // #080202
    "--ring": "35 79% 77%",
  },
  editor: {
    "--background": "0 0% 1.2%", // #030303 OLED pure dark background
    "--card": "0 0% 2.4%", // #060606
    "--popover": "0 0% 2.4%",
    "--muted": "0 0% 6%", // #0f0f0f
    "--muted-foreground": "0 0% 70%",
    "--border": "0 0% 13%", // #212121
    "--input": "0 0% 13%",
    "--primary": "275 29% 73%", // #BDA6CE lavender accent
    "--primary-foreground": "0 0% 10%",
    "--accent": "275 29% 73%", // #BDA6CE
    "--accent-foreground": "0 0% 10%",
    "--ring": "275 29% 73%",
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
