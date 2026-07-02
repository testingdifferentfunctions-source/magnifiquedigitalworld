import { useMemo, useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useArticles, Article, useIncrementImpressions } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { useLanguage } from "@/hooks/useLanguage";
import { useArticlesTranslations } from "@/hooks/useArticleTranslation";
import { useCategoriesTranslations } from "@/hooks/useCategoryTranslation";
import { cn } from "@/lib/utils";



const Section = () => {
  const { categoryId = "" } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: articles = [], isLoading } = useArticles();
  const { data: categories = [] } = useCategories();
  const incrementImpressions = useIncrementImpressions();
  const tracked = useRef(false);
  const [activeTopic, setActiveTopic] = useState<string>("__all__");

  const category = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId]
  );

  const sectionArticles = useMemo(
    () =>
      articles
        .filter((a) => a.category_id === categoryId)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
    [articles, categoryId]
  );

  const articleIds = useMemo(() => sectionArticles.map((a) => a.id), [sectionArticles]);
  const { data: translationsMap = {} } = useArticlesTranslations(articleIds);
  const { data: categoryTranslations = {} } = useCategoriesTranslations(
    category ? [category.id] : []
  );

  const categoryName = category
    ? language === "en" && categoryTranslations[category.id]
      ? categoryTranslations[category.id]
      : category.name
    : "";

  const subtopics = useMemo(
    () => category?.sub_topics ?? [],
    [category]
  );


  // Reset active topic if it disappears after language switch
  useEffect(() => {
    if (activeTopic !== "__all__" && !subtopics.includes(activeTopic)) {
      setActiveTopic("__all__");
    }
  }, [subtopics, activeTopic]);

  const filtered = useMemo(() => {
    if (activeTopic === "__all__") return sectionArticles;
    return sectionArticles.filter((a) =>
      (a.tags || []).includes(activeTopic)
    );
  }, [sectionArticles, activeTopic]);

  useEffect(() => {
    if (sectionArticles.length > 0 && !tracked.current) {
      tracked.current = true;
      incrementImpressions.mutate(sectionArticles.map((a) => a.id));
    }
  }, [sectionArticles]);




  const backLabel = language === "en" ? "All Sections" : "Усі розділи";
  const allLabel = language === "en" ? "All" : "Усі";

  const chipBase =
    "shrink-0 px-4 py-1.5 text-sm rounded-full border-2 border-[#A67DE8] transition-colors duration-200 whitespace-nowrap";
  const chipInactive =
    "bg-[#A67DE8]/10 text-foreground hover:bg-[#A67DE8] hover:text-white";
  const chipActive = "bg-[#A67DE8] text-white";

  return (
    <PageLayout>
      {category && (
        <SEO
          title={`${categoryName} — Magnifique numérique`}
          description={`Статті про ${categoryName} українською мовою на Magnifique numérique.`}
          path={`/section/${category.id}`}
        />
      )}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/sections")}
          className="gap-2 hover:text-[#A67DE8] hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Button>
      </div>

      <section className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {categoryName || t("sections.title")}
        </h1>
        <p className="text-muted-foreground">{t("sections.subtitle")}</p>
      </section>

      {category && subtopics.length > 0 && (
        <div className="mb-8 -mx-4 px-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 pb-2 w-max">
            <button
              type="button"
              onClick={() => setActiveTopic("__all__")}
              className={cn(
                chipBase,
                activeTopic === "__all__" ? chipActive : chipInactive
              )}
            >
              {allLabel}
            </button>
            {subtopics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setActiveTopic(topic)}
                className={cn(
                  chipBase,
                  activeTopic === topic ? chipActive : chipInactive
                )}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">{t("index.loading")}</p>
        </div>
      ) : !category ? (
        <div className="flex flex-col items-center py-12 gap-4">
          <p className="text-muted-foreground">{t("index.no_results")}</p>
          <Link to="/sections" className="text-[#A67DE8] hover:underline">
            {backLabel}
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">{t("index.no_articles")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article: Article, index: number) => {
            const tr = translationsMap[article.id];
            return (
              <ArticleCard
                key={article.id}
                article={{
                  id: article.id,
                  title:
                    language === "en" && tr?.title ? tr.title : article.title,
                  description:
                    language === "en" && tr?.description
                      ? tr.description
                      : article.description,
                  image: article.image_url,
                  likes: article.likes,
                  reads: article.reads,
                  category: article.category_id || "",
                }}
                index={index}
              />
            );
          })}
        </div>
      )}
    </PageLayout>
  );
};

export default Section;
