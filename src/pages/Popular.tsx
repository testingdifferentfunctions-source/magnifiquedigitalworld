import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import ModeSwitcher from "@/components/ModeSwitcher";
import ModeCardRenderer from "@/components/ModeCardRenderer";
import { usePopularEntriesByMode } from "@/hooks/useModeEntries";
import { useMode, MODE_LABELS } from "@/hooks/useMode";
import { useLanguage } from "@/hooks/useLanguage";
import { TrendingUp } from "lucide-react";

const Popular = () => {
  const { mode } = useMode();
  // Editor mode has no content cards, default to articles in popular ranking
  const effectiveMode = mode === "editor" ? "articles" : mode;
  const { data: popularData = [], isLoading } = usePopularEntriesByMode(effectiveMode, 10);
  const { t, language } = useLanguage();

  // Task 3: Debugging log for Popular Data verification
  console.log("Current Mode:", effectiveMode, "Fetched Popular Data:", popularData);

  const getModeSubtitle = () => {
    switch (effectiveMode) {
      case "resources":
        return language === "uk"
          ? "Топ-10 корисних ресурсів та інструментів за популярністю"
          : "Top 10 resources and tools by popularity";
      case "news":
        return language === "uk"
          ? "Топ-10 актуальних новин за популярністю"
          : "Top 10 news by popularity";
      case "components":
        return language === "uk"
          ? "Топ-10 UI компонентів та бібліотек за популярністю"
          : "Top 10 UI components and libraries by popularity";
      case "templates":
        return language === "uk"
          ? "Топ-10 готових сніпетів та шаблонів коду за популярністю"
          : "Top 10 code snippets and templates by popularity";
      case "research":
        return language === "uk"
          ? "Топ-10 IT досліджень та аналітики за популярністю"
          : "Top 10 IT research and analytics by popularity";
      case "palettes":
        return language === "uk"
          ? "Топ-10 колірних палітр за популярністю"
          : "Top 10 color palettes by popularity";
      case "dictionary":
        return language === "uk"
          ? "Топ-10 термінів зі словника за популярністю"
          : "Top 10 technical terms by popularity";
      case "design":
        return language === "uk"
          ? "Топ-10 UI дизайнів та градієнтів за популярністю"
          : "Top 10 UI designs and gradients by popularity";
      case "articles":
      default:
        return t("popular.subtitle");
    }
  };

  return (
    <PageLayout>
      <SEO
        title={`${t("popular.title")} (${MODE_LABELS[effectiveMode]}) — Magnifique numérique`}
        description={getModeSubtitle()}
        path="/popular"
      />
      <section className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">{t("popular.title")}</h1>
          </div>
          <p className="text-muted-foreground">{getModeSubtitle()}</p>
        </div>
        <div className="self-start md:self-auto">
          <ModeSwitcher excludeModes={["editor"]} />
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">{t("index.loading")}</p>
        </div>
      ) : popularData.length === 0 ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">
            {language === "uk" ? "Поки що немає записів у цьому розділі" : "No entries found in this section yet"}
          </p>
        </div>
      ) : (
        <div
          className={
            effectiveMode === "design" || effectiveMode === "дизайн"
              ? "grid grid-cols-1 gap-6 w-full items-stretch"
              : effectiveMode === "dictionary" || effectiveMode === "Словник"
              ? "grid grid-cols-1 gap-4 w-full items-stretch"
              : effectiveMode === "news"
              ? "flex flex-col max-w-5xl mx-auto w-full space-y-8"
              : effectiveMode === "templates" || effectiveMode === "palettes" || effectiveMode === "research"
              ? "grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
          }
        >
          {popularData.map((item: any, index: number) => (
            <ModeCardRenderer
              key={item.id}
              item={item}
              index={index}
              mode={effectiveMode}
              language={language}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Popular;

