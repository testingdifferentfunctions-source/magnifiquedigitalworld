import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import ModeSwitcher from "@/components/ModeSwitcher";
import ModeCardRenderer from "@/components/ModeCardRenderer";
import { useLikedEntriesByMode } from "@/hooks/useModeEntries";
import { useMode, MODE_LABELS } from "@/hooks/useMode";
import { useLanguage } from "@/hooks/useLanguage";
import { Heart } from "lucide-react";

const Favorites = () => {
  const { mode } = useMode();
  // Editor mode has no content cards, default to articles in favorites ranking
  const effectiveMode = mode === "editor" ? "articles" : mode;
  const { data: likedData = [], isLoading } = useLikedEntriesByMode(effectiveMode, 10);
  const { t, language } = useLanguage();

  // Task 3: Debugging log for Liked Data verification
  console.log("Current Mode:", effectiveMode, "Fetched Liked Data:", likedData);

  const getModeSubtitle = () => {
    switch (effectiveMode) {
      case "resources":
        return language === "uk"
          ? "Топ-10 корисних ресурсів за кількістю вподобань"
          : "Top 10 resources by number of likes";
      case "news":
        return language === "uk"
          ? "Топ-10 актуальних новин за кількістю вподобань"
          : "Top 10 news by number of likes";
      case "components":
        return language === "uk"
          ? "Топ-10 UI компонентів за кількістю вподобань"
          : "Top 10 UI components by number of likes";
      case "templates":
        return language === "uk"
          ? "Топ-10 сніпетів та шаблонів коду за кількістю вподобань"
          : "Top 10 snippets and code templates by number of likes";
      case "research":
        return language === "uk"
          ? "Топ-10 IT досліджень та аналітики за кількістю вподобань"
          : "Top 10 IT research and analytics by number of likes";
      case "palettes":
        return language === "uk"
          ? "Топ-10 колірних палітр за кількістю вподобань"
          : "Top 10 color palettes by number of likes";
      case "dictionary":
        return language === "uk"
          ? "Топ-10 термінів зі словника за кількістю вподобань"
          : "Top 10 technical terms by number of likes";
      case "design":
        return language === "uk"
          ? "Топ-10 UI дизайнів та градієнтів за кількістю вподобань"
          : "Top 10 UI designs and gradients by number of likes";
      case "articles":
      default:
        return t("favorites.subtitle");
    }
  };

  return (
    <PageLayout>
      <SEO
        title={`${t("favorites.title")} (${MODE_LABELS[effectiveMode]}) — Magnifique numérique`}
        description={getModeSubtitle()}
        path="/favorites"
      />
      <section className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-3xl font-bold">{t("favorites.title")}</h1>
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
      ) : likedData.length === 0 ? (
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
          {likedData.map((item: any, index: number) => (
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

export default Favorites;

