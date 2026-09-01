import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import ModeSwitcher from "@/components/ModeSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMode, getModeTitle, getModeSubtitle } from "@/hooks/useMode";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Terminal,
  Code2,
  ArrowRight,
  Search,
  CheckCircle2,
  FileCode2,
  Braces,
  Palette,
} from "lucide-react";

interface ToolCardItem {
  id: string;
  title: { uk: string; en: string };
  description: { uk: string; en: string };
  icon: React.ElementType;
  route: string;
  status: "active" | "featured" | "preview";
  keywords: string[];
  features: { uk: string[]; en: string[] };
}

const TOOLS_LIST: ToolCardItem[] = [
  {
    id: "code-editor",
    title: {
      uk: "Редактор коду",
      en: "Code Editor",
    },
    description: {
      uk: "Повноцінний редактор коду з підтримкою виконання скриптів Python безпосередньо у вашому браузері через WebAssembly.",
      en: "Full-featured online code editor with real-time script execution directly in your browser via WebAssembly.",
    },
    icon: Terminal,
    route: "/tools/code-editor",
    status: "featured",
    keywords: ["python", "pyodide", "webassembly", "repl", "interactive", "code", "редактор", "пісочниця"],
    features: {
      uk: [
        "Миттєве виконання Python у WebAssembly (Pyodide)",
        "Підсвітка синтаксису CodeMirror & OneDark тема",
        "Вбудована консоль з таймером та виведенням результатів",
        "Готові алгоритмічні та математичні шаблони",
      ],
      en: [
        "Instant Python execution via WebAssembly (Pyodide)",
        "CodeMirror syntax highlighting & OneDark theme",
        "Interactive console with execution benchmarks",
        "Pre-built algorithmic and CS templates",
      ],
    },
  },
  {
    id: "regex-tester",
    title: {
      uk: "RegEx Тестер & Валідатор",
      en: "RegEx Tester & Validator",
    },
    description: {
      uk: "Інтерактивна перевірка регулярних виразів з візуальним підсвічуванням збігів, груп захоплення та генерацією коду.",
      en: "Interactive regular expression testing with visual match highlighting, capture groups, and code generation.",
    },
    icon: FileCode2,
    route: "/tools/code-editor?preset=regex",
    status: "active",
    keywords: ["regex", "regexp", "string", "регулярні вирази", "валідація"],
    features: {
      uk: [
        "Тестування шаблонів у реальному часі",
        "Аналіз груп захоплення та прапорців",
        "Шаблони для email, URL, телефонів та UUID",
      ],
      en: [
        "Real-time pattern matching & inspection",
        "Capture groups & flag analysis",
        "Presets for email, URLs, phone numbers & UUIDs",
      ],
    },
  },
  {
    id: "json-formatter",
    title: {
      uk: "JSON Форматер & Валідатор",
      en: "JSON Formatter & Validator",
    },
    description: {
      uk: "Форматування, валідація, аналіз структури та швидка конвертація JSON документів з детальними повідомленнями про помилки.",
      en: "Formatting, validation, structure inspection, and fast conversion of JSON payloads with precise syntax error locations.",
    },
    icon: Braces,
    route: "/tools/code-editor?preset=json",
    status: "active",
    keywords: ["json", "formatter", "linter", "data", "форматування", "валідатор"],
    features: {
      uk: [
        "Валідація синтаксису з вказівкою рядка помилки",
        "Автоматичне форматування з кастомними відступами",
        "Сортування ключів та стиснення (minify)",
      ],
      en: [
        "Syntax validation with exact error lines",
        "Auto-formatting with customizable indentation",
        "Key sorting and minification",
      ],
    },
  },
  {
    id: "palette-generator",
    title: {
      uk: "Палітри та Колірний Studio",
      en: "Palette & Color Studio",
    },
    description: {
      uk: "Каталог гармонійних колірних схем, розрахунок коефіцієнта контрастності WCAG та експорт у форматі CSS змінних і Tailwind.",
      en: "Harmonious color schemes generator, WCAG accessibility contrast checker, and export in CSS variables & Tailwind format.",
    },
    icon: Palette,
    route: "/palettes",
    status: "active",
    keywords: ["palette", "colors", "wcag", "css", "tailwind", "палітри", "кольори", "дизайн"],
    features: {
      uk: [
        "Гармонійні палітри для UI інтерфейсів",
        "Перевірка доступності WCAG AA/AAA",
        "Експорт у форматі CSS Variables та Tailwind CSS",
      ],
      en: [
        "Harmonious palettes for UI interfaces",
        "WCAG AA/AAA accessibility checks",
        "Direct export to CSS Variables & Tailwind",
      ],
    },
  },
];

const ToolsPage: React.FC = () => {
  const { mode, setMode } = useMode();
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (mode !== "tools") {
      setMode("tools");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTools = TOOLS_LIST.filter((tool) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = tool.title[language].toLowerCase();
    const desc = tool.description[language].toLowerCase();
    const keywords = tool.keywords.join(" ").toLowerCase();
    return title.includes(q) || desc.includes(q) || keywords.includes(q);
  });

  return (
    <PageLayout>
      <SEO
        title={`${language === "en" ? "Developer Tools" : "Інструменти розробника"} — Magnifique numérique`}
        description={
          language === "en"
            ? "Suite of interactive developer tools, playgrounds, and utilities including Python WebAssembly editor, JSON formatter, and RegEx tester."
            : "Набір інтерактивних онлайн-інструментів для розробників: редактор коду Python у WebAssembly, форматер JSON, тестер RegEx та колірні палітри."
        }
        path="/tools"
        type="website"
      />

      {/* Header Title & Subtitle (Unwrapped directly in parent layout) */}
      <div className="space-y-3 max-w-3xl mb-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-100">
          {getModeTitle("tools", language)}
        </h1>

        <p className="text-slate-300/80 text-base sm:text-lg leading-relaxed">
          {getModeSubtitle("tools", language)}
        </p>
      </div>

      {/* Toolbar: Search input & Mode Switcher (Unwrapped directly in parent layout) */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BDA6CE]/70" />
            <Input
              id="tools-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "en" ? "Filter tools..." : "Пошук серед інструментів..."}
              className="pl-10 h-10 bg-[#080202] border-[#393E46] text-slate-100 placeholder:text-slate-400 focus:border-[#BDA6CE] focus:ring-[#BDA6CE]/20 rounded-xl"
            />
          </div>
          <ModeSwitcher className="h-10 w-[165px] bg-[#080202] border-[#393E46] text-white hover:border-[#BDA6CE]/80 shrink-0 rounded-xl" />
        </div>
      </div>

      {/* Step 3: Standardized Tools Grid Layout */}
      <section id="tools-grid-section" className="mb-12">
        {filteredTools.length === 0 ? (
          <div className="rounded-2xl p-12 text-center bg-[#0F0E0E] border border-transparent text-slate-300">
            <Code2 className="w-12 h-12 text-[#BDA6CE]/50 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-100 mb-1">
              {language === "en" ? "No matching tools" : "Інструментів не знайдено"}
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              {language === "en"
                ? "Try searching for Python, JSON, RegEx, or Palette."
                : "Спробуйте пошукати за словами Python, JSON, Редактор, RegEx чи Палітри."}
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="border-[#BDA6CE]/50 text-slate-200 hover:bg-[#BDA6CE]/10"
            >
              {language === "en" ? "Clear filter" : "Очистити фільтр"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTools.map((tool) => {
              const IconComponent = tool.icon;

              return (
                <div
                  key={tool.id}
                  id={`tool-card-${tool.id}`}
                  className="group flex flex-col h-full rounded-2xl p-6 sm:p-7 bg-[#0F0E0E] border border-transparent hover:border-[#BDA6CE] transition-colors duration-300 shadow-xl relative overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 bg-[#BDA6CE] text-[#0F0E0E] shadow-md shadow-[#BDA6CE]/20">
                      <IconComponent className="w-6 h-6 text-[#0F0E0E]" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight group-hover:text-[#BDA6CE] transition-colors">
                        {tool.title[language]}
                      </h2>
                    </div>
                  </div>

                  {/* Card Description */}
                  <p className="text-slate-300/85 text-sm sm:text-base leading-relaxed mb-5">
                    {tool.description[language]}
                  </p>

                  {/* Feature Bullets */}
                  <ul className="space-y-2 mb-6 text-xs sm:text-sm text-slate-300/90">
                    {tool.features[language].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#BDA6CE] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Card Footer: clean spacing without border-t or dividing lines */}
                  <div className="mt-auto pt-2 flex items-center justify-end">
                    <Link to={tool.route} className="inline-flex">
                      <Button
                        id={`open-tool-button-${tool.id}`}
                        className="h-10 px-5 rounded-xl font-semibold gap-2 transition-all duration-200 active:scale-95 shadow-md bg-[#BDA6CE] text-[#0F0E0E] hover:bg-[#d6c4e4] hover:shadow-lg hover:shadow-[#BDA6CE]/20"
                      >
                        <span>{t("tools.open")}</span>
                        <ArrowRight className="w-4 h-4 text-[#0F0E0E] transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PageLayout>
  );
};

export default ToolsPage;
