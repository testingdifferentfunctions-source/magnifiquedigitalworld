import { useState, useMemo, useEffect, useRef } from "react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import ArticleCard from "@/components/ArticleCard";
import SearchBar from "@/components/SearchBar";
import ArticleFilters, { SortOption } from "@/components/ArticleFilters";
import { useArticles, Article, useIncrementImpressions } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { useLanguage } from "@/hooks/useLanguage";
import { useArticlesTranslations } from "@/hooks/useArticleTranslation";
import { useCategoriesTranslations } from "@/hooks/useCategoryTranslation";

const FILTERS_STORAGE_KEY = "article-filters";

const getStoredFilters = () => {
  try {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as { sortBy: SortOption; categoryId: string };
    }
  } catch {}
  return { sortBy: "newest" as SortOption, categoryId: "all" };
};

const Index = () => {
  const { data: articles = [], isLoading } = useArticles();
  const { data: categories = [] } = useCategories();
  const incrementImpressions = useIncrementImpressions();
  const impressionsTracked = useRef(false);
  const { t, language } = useLanguage();
  const storedFilters = getStoredFilters();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(storedFilters.sortBy);
  const [categoryId, setCategoryId] = useState(storedFilters.categoryId);

  const articleIds = useMemo(() => articles.map(a => a.id), [articles]);
  const { data: translationsMap = {} } = useArticlesTranslations(articleIds);
  const categoryIds = useMemo(() => categories.map(c => c.id), [categories]);
  const { data: categoryTranslations = {} } = useCategoriesTranslations(categoryIds);

  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify({ sortBy, categoryId }));
  }, [sortBy, categoryId]);

  // Track impressions when articles are loaded
  useEffect(() => {
    if (articles.length > 0 && !impressionsTracked.current) {
      impressionsTracked.current = true;
      incrementImpressions.mutate(articles.map(a => a.id));
    }
  }, [articles]);

  const articleTitles = useMemo(() => 
    articles.map(a => {
      const tr = translationsMap[a.id];
      return (language === 'en' && tr?.title) ? tr.title : a.title;
    }), 
    [articles, translationsMap, language]
  );

  const filteredArticles = useMemo(() => {
    let result = [...articles];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((article) => {
        const tr = translationsMap[article.id];
        const title = (language === 'en' && tr?.title) ? tr.title : article.title;
        return title.toLowerCase().includes(query);
      });
    }

    if (categoryId !== "all") {
      result = result.filter((article) => article.category_id === categoryId);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [articles, searchQuery, sortBy, categoryId, translationsMap, language]);

  return (
    <PageLayout>
      <SEO
        title="Magnifique numérique — Програмування Python українською"
        description="Освітня платформа зі статтями про Python, технології та IT українською мовою. Читайте останні матеріали, туторіали та огляди."
        path="/"
        type="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Magnifique numérique",
          url: "https://byte-scribe-studio.lovable.app/",
          inLanguage: "uk",
        }}
      />
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('index.title')}</h1>
        <p className="text-muted-foreground mb-6">
          {t('index.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
            suggestions={articleTitles}
            placeholder={t('search.placeholder')}
          />
          <ArticleFilters
            sortBy={sortBy}
            onSortChange={setSortBy}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            categories={categories}
            categoryTranslations={categoryTranslations}
          />
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">{t('index.loading')}</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || categoryId !== "all" ? t('index.no_results') : t('index.no_articles')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article: Article, index: number) => {
            const tr = translationsMap[article.id];
            return (
              <ArticleCard 
                key={article.id} 
                article={{
                  id: article.id,
                  title: (language === 'en' && tr?.title) ? tr.title : article.title,
                  description: (language === 'en' && tr?.description) ? tr.description : article.description,
                  image: article.image_url,
                  likes: article.likes,
                  reads: article.reads,
                  category: article.category_id || ''
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

export default Index;
