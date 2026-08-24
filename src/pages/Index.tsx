import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import ArticleCard from "@/components/ArticleCard";
import ResourceCard, { ResourceItem } from "@/components/ResourceCard";
import ComponentCard, { ComponentItem } from "@/components/ComponentCard";
import NewsCard from "@/components/NewsCard";
import PaletteCard from "@/components/PaletteCard";
import SearchBar from "@/components/SearchBar";
import ArticleFilters, { SortOption, FilterCategoryOption } from "@/components/ArticleFilters";
import CategoryPills, { PillItem } from "@/components/CategoryPills";
import { useArticles, useIncrementImpressions } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { useLanguage } from "@/hooks/useLanguage";
import { useCategoriesTranslations } from "@/hooks/useCategoryTranslation";
import { localizeArticle } from "@/lib/localize";
import { useMode, MODE_LABELS, MODE_ACCENTS } from "@/hooks/useMode";
import {
  useModeEntries,
  localizeEntry,
  useToggleModeEntryLike,
  type ModeEntry,
} from "@/hooks/useModeEntries";
import { shareEntry, getLikedEntries, setEntryLiked } from "@/lib/shareEntry";

const FILTERS_STORAGE_KEY = "article-filters";

const getStoredFilters = () => {
  try {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as { sortBy: SortOption; categoryId: string };
    }
  } catch {
    // Return default filters on parse error
  }
  return { sortBy: "newest" as SortOption, categoryId: "all" };
};

// Category Options for Non-Article Modes
const NEWS_CATEGORIES: FilterCategoryOption[] = [
  { id: "languages", name: "Мови програмування" },
  { id: "web", name: "Веб & Фронтенд" },
  { id: "ai", name: "Штучний інтелект (AI)" },
  { id: "devops", name: "DevOps & Хмара" },
  { id: "releases", name: "Релізи та Оновлення" },
];

const PALETTE_CATEGORIES: FilterCategoryOption[] = [
  { id: "dark", name: "Темні теми (Dark)" },
  { id: "light", name: "Світлі теми (Light)" },
  { id: "saas", name: "SaaS & Продукти" },
  { id: "devtools", name: "DevTools & Термінал" },
  { id: "fintech", name: "Fintech & Градієнти" },
];

const RESOURCE_CATEGORIES: FilterCategoryOption[] = [
  { id: "design", name: "Дизайн & UI" },
  { id: "devtools", name: "Інструменти розробника" },
  { id: "backend", name: "Бекенд & Бази даних" },
  { id: "cloud", name: "Хостинг & Хмара" },
  { id: "ai", name: "ШІ-інструменти" },
];

const COMPONENT_CATEGORIES: FilterCategoryOption[] = [
  { id: "ui", name: "UI компоненти" },
  { id: "charts", name: "Графіки & Charts" },
  { id: "forms", name: "Форми & Валідація" },
  { id: "animation", name: "Анімації" },
];

const TEMPLATE_CATEGORIES: FilterCategoryOption[] = [
  { id: "fullstack", name: "Fullstack застосунки" },
  { id: "frontend", name: "Фронтенд шаблони" },
  { id: "backend", name: "Бекенд & API" },
  { id: "auth", name: "Автентифікація & DB" },
];

// Mapping helper for category keywords
const CATEGORY_TAG_MAP: Record<string, string[]> = {
  // News
  languages: ["python", "rust", "go", "typescript", "javascript", "c++", "jit", "мову", "програмування"],
  web: ["react", "next.js", "vue", "javascript", "typescript", "фронтенд", "веб-розробка", "css", "html", "tailwind"],
  ai: ["ai", "ші", "llm", "агенти", "нейромережі", "gpt", "gemini", "claude", "machine learning"],
  devops: ["devops", "docker", "kubernetes", "хмара", "інфраструктура", "cloud", "ci/cd"],
  releases: ["реліз", "оновлення", "версія", "release", "анонс"],

  // Palettes
  dark: ["dark", "dark mode", "темна", "minimalist", "neon", "emerald", "cli"],
  light: ["light", "light mode", "світла", "vibrant", "gradient", "fintech"],
  saas: ["saas", "modern", "minimalist", "fintech", "продукт", "web app"],
  devtools: ["developer tools", "cli", "terminal", "neon", "database", "інструменти"],
  fintech: ["fintech", "vibrant", "gradient", "фінанси", "банкінг"],

  // Resources
  design: ["design", "ui", "ux", "icons", "дизайн", "іконки", "шрифти", "css"],
  devtools: ["tools", "devtools", "інструменти", "cli", "git", "термінал"],
  backend: ["backend", "database", "бази даних", "api", "rest", "sql"],
  cloud: ["cloud", "hosting", "хостинг", "хмара", "serverless", "aws", "vercel"],
  ai: ["ai", "ші", "генерація", "llm", "нейромережі"],

  // Components
  ui: ["ui", "button", "modal", "card", "dropdown", "компоненти"],
  charts: ["chart", "charts", "графіки", "d3", "recharts", "visualization", "дані"],
  forms: ["form", "forms", "input", "валідація", "форми"],
  animation: ["animation", "motion", "framer", "анімація", "ефекти"],

  // Templates
  fullstack: ["fullstack", "next.js", "remix", "mern", "застосунок"],
  frontend: ["frontend", "react", "vue", "vite", "фронтенд", "landing"],
  backend: ["backend", "fastapi", "express", "node", "бек-енд", "api"],
  auth: ["auth", "oauth", "supabase", "firebase", "security", "автентифікація"],
};

const getFilteredModeEntries = (
  entries: ModeEntry[],
  query: string,
  categoryId: string,
  activePill: string,
  sort: SortOption,
  lang: string
) => {
  let list = entries.map((entry) => ({
    entry,
    loc: localizeEntry(entry, lang as any),
  }));

  // 1. Search Query
  if (query.trim()) {
    const q = query.toLowerCase();
    list = list.filter(
      ({ entry, loc }) =>
        loc.title.toLowerCase().includes(q) ||
        loc.description.toLowerCase().includes(q) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  // 2. Primary Filter (Dropdown category)
  if (categoryId !== "all") {
    const validKeywords = CATEGORY_TAG_MAP[categoryId] || [categoryId.toLowerCase()];
    list = list.filter(({ entry, loc }) => {
      const matchTags = entry.tags.some((tag) =>
        validKeywords.some((kw) => tag.toLowerCase().includes(kw) || kw.includes(tag.toLowerCase()))
      );
      const matchText = validKeywords.some(
        (kw) =>
          loc.title.toLowerCase().includes(kw) || loc.description.toLowerCase().includes(kw)
      );
      return matchTags || matchText;
    });
  }

  // 3. Secondary Filter (Pill Selection)
  if (activePill !== "all") {
    const pillLower = activePill.toLowerCase();
    list = list.filter(({ entry, loc }) => {
      const matchTag = entry.tags.some((tag) => tag.toLowerCase() === pillLower);
      const matchText =
        loc.title.toLowerCase().includes(pillLower) ||
        loc.description.toLowerCase().includes(pillLower);
      return matchTag || matchText;
    });
  }

  // 4. Sort
  list.sort((a, b) => {
    const dateA = new Date(a.entry.created_at).getTime();
    const dateB = new Date(b.entry.created_at).getTime();
    return sort === "newest" ? dateB - dateA : dateA - dateB;
  });

  return list;
};

const Index = () => {
  const navigate = useNavigate();
  const { mode } = useMode();
  const { t, language } = useLanguage();

  // Articles data
  const { data: articles = [], isLoading: articlesLoading } = useArticles();
  const { data: categories = [] } = useCategories();
  const incrementImpressions = useIncrementImpressions();
  const impressionsTracked = useRef(false);

  // Mode entries data
  const { data: news = [], isLoading: newsLoading } = useModeEntries("news");
  const { data: resources = [], isLoading: resourcesLoading } = useModeEntries("resource");
  const { data: components = [], isLoading: componentsLoading } = useModeEntries("component");
  const { data: templates = [], isLoading: templatesLoading } = useModeEntries("template");
  const { data: palettes = [], isLoading: palettesLoading } = useModeEntries("palette");
  const toggleLike = useToggleModeEntryLike();

  const storedFilters = getStoredFilters();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(storedFilters.sortBy);
  const [categoryId, setCategoryId] = useState(storedFilters.categoryId);
  const [activePill, setActivePill] = useState<string>("all");

  const categoryIds = useMemo(() => categories.map((c) => c.id), [categories]);
  const { data: categoryTranslations = {} } = useCategoriesTranslations(categoryIds);

  // Reset secondary pill when mode or primary category changes
  useEffect(() => {
    setActivePill("all");
  }, [mode, categoryId]);

  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify({ sortBy, categoryId }));
  }, [sortBy, categoryId]);

  // Track impressions when articles are loaded
  useEffect(() => {
    if (articles.length > 0 && !impressionsTracked.current) {
      impressionsTracked.current = true;
      incrementImpressions.mutate(articles.map((a) => a.id));
    }
  }, [articles, incrementImpressions]);

  // Mode-specific category options for Primary Dropdown
  const activeCategoryOptions: FilterCategoryOption[] = useMemo(() => {
    if (mode === "articles") {
      return categories.map((c) => ({
        id: c.id,
        name: language === "en" && categoryTranslations[c.id] ? categoryTranslations[c.id] : c.name,
      }));
    }
    if (mode === "news") return NEWS_CATEGORIES;
    if (mode === "palettes") return PALETTE_CATEGORIES;
    if (mode === "resources") return RESOURCE_CATEGORIES;
    if (mode === "components") return COMPONENT_CATEGORIES;
    return TEMPLATE_CATEGORIES;
  }, [mode, categories, categoryTranslations, language]);

  // Mode-specific placeholder for Primary Dropdown
  const activeDropdownPlaceholder = useMemo(() => {
    if (mode === "articles") return t("filters.all_sections");
    if (mode === "palettes") return "Всі стилі";
    return "Всі категорії";
  }, [mode, t]);

  // Derive secondary pills dynamically based on active mode & selected category
  const availablePills: PillItem[] = useMemo(() => {
    const allPill: PillItem = { id: "all", label: "Всі" };

    if (mode === "articles") {
      if (categoryId === "all") {
        // Collect all sub-topics from all categories + article tags
        const subTopicsSet = new Set<string>();
        categories.forEach((cat) => {
          (cat.sub_topics || []).forEach((st) => subTopicsSet.add(st));
        });
        articles.forEach((art) => {
          (art.tags || []).forEach((tag) => subTopicsSet.add(tag));
        });
        const pills = Array.from(subTopicsSet)
          .filter(Boolean)
          .slice(0, 10)
          .map((topic) => ({ id: topic, label: topic }));
        return [allPill, ...pills];
      } else {
        const currentCategory = categories.find((c) => c.id === categoryId);
        const subTopics = currentCategory?.sub_topics || [];
        if (subTopics.length > 0) {
          return [allPill, ...subTopics.map((st) => ({ id: st, label: st }))];
        }
        // Fallback to tags of articles in this category
        const categoryTags = Array.from(
          new Set(
            articles
              .filter((a) => a.category_id === categoryId)
              .flatMap((a) => a.tags || [])
          )
        );
        return [allPill, ...categoryTags.map((tag) => ({ id: tag, label: tag }))];
      }
    }

    // For other modes: News, Palettes, Resources, Components, Templates
    const currentEntries =
      mode === "news"
        ? news
        : mode === "palettes"
        ? palettes
        : mode === "resources"
        ? resources
        : mode === "components"
        ? components
        : templates;

    let candidateEntries = currentEntries;
    if (categoryId !== "all") {
      const validKeywords = CATEGORY_TAG_MAP[categoryId] || [categoryId.toLowerCase()];
      candidateEntries = currentEntries.filter((entry) => {
        const loc = localizeEntry(entry, language as any);
        const matchTags = entry.tags.some((tag) =>
          validKeywords.some((kw) => tag.toLowerCase().includes(kw) || kw.includes(tag.toLowerCase()))
        );
        const matchText = validKeywords.some(
          (kw) =>
            loc.title.toLowerCase().includes(kw) || loc.description.toLowerCase().includes(kw)
        );
        return matchTags || matchText;
      });
    }

    // Collect all tags from the candidate entries
    const tagsCount: Record<string, number> = {};
    candidateEntries.forEach((entry) => {
      entry.tags.forEach((tag) => {
        if (!tag) return;
        tagsCount[tag] = (tagsCount[tag] || 0) + 1;
      });
    });

    const sortedTags = Object.entries(tagsCount)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => ({ id: tag, label: tag }));

    return [allPill, ...sortedTags.slice(0, 12)];
  }, [mode, categoryId, categories, articles, news, palettes, resources, components, templates, language]);

  // Localized articles
  const localizedArticles = useMemo(
    () => articles.map((a) => ({ article: a, loc: localizeArticle(a, language) })),
    [articles, language]
  );

  // Filtered articles (Two-Tier filtering)
  const filteredArticles = useMemo(() => {
    let result = [...localizedArticles];

    // 1. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        ({ loc, article }) =>
          loc.title.toLowerCase().includes(query) ||
          loc.description.toLowerCase().includes(query) ||
          (article.tags || []).some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // 2. Primary Filter (Dropdown Category)
    if (categoryId !== "all") {
      result = result.filter(({ article }) => article.category_id === categoryId);
    }

    // 3. Secondary Filter (Pill Tag / Subtopic)
    if (activePill !== "all") {
      const pillLower = activePill.toLowerCase();
      result = result.filter(
        ({ article, loc }) =>
          (article.tags || []).some((t) => t.toLowerCase() === pillLower) ||
          loc.title.toLowerCase().includes(pillLower) ||
          loc.description.toLowerCase().includes(pillLower)
      );
    }

    // 4. Sort
    result.sort((a, b) => {
      const dateA = new Date(a.article.created_at).getTime();
      const dateB = new Date(b.article.created_at).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [localizedArticles, searchQuery, sortBy, categoryId, activePill]);

  const filteredNews = useMemo(
    () => getFilteredModeEntries(news, searchQuery, categoryId, activePill, sortBy, language),
    [news, searchQuery, categoryId, activePill, sortBy, language]
  );

  const filteredResources = useMemo(
    () => getFilteredModeEntries(resources, searchQuery, categoryId, activePill, sortBy, language),
    [resources, searchQuery, categoryId, activePill, sortBy, language]
  );

  const filteredComponents = useMemo(
    () => getFilteredModeEntries(components, searchQuery, categoryId, activePill, sortBy, language),
    [components, searchQuery, categoryId, activePill, sortBy, language]
  );

  const filteredTemplates = useMemo(
    () => getFilteredModeEntries(templates, searchQuery, categoryId, activePill, sortBy, language),
    [templates, searchQuery, categoryId, activePill, sortBy, language]
  );

  const filteredPalettes = useMemo(
    () => getFilteredModeEntries(palettes, searchQuery, categoryId, activePill, sortBy, language),
    [palettes, searchQuery, categoryId, activePill, sortBy, language]
  );

  // Active suggestions for SearchBar based on current mode
  const activeSuggestions = useMemo(() => {
    if (mode === "news") {
      return news.map((n) => localizeEntry(n, language).title);
    }
    if (mode === "articles") {
      return localizedArticles.map(({ loc }) => loc.title);
    }
    if (mode === "resources") {
      return resources.map((r) => localizeEntry(r, language).title);
    }
    if (mode === "components") {
      return components.map((c) => localizeEntry(c, language).title);
    }
    if (mode === "templates") {
      return templates.map((t) => localizeEntry(t, language).title);
    }
    return palettes.map((p) => localizeEntry(p, language).title);
  }, [mode, news, localizedArticles, resources, components, templates, palettes, language]);

  const isLoading =
    mode === "news"
      ? newsLoading
      : mode === "articles"
      ? articlesLoading
      : mode === "resources"
      ? resourcesLoading
      : mode === "components"
      ? componentsLoading
      : mode === "templates"
      ? templatesLoading
      : palettesLoading;

  return (
    <PageLayout>
      <SEO
        title="Magnifique numérique — Програмування та IT українською"
        description="Освітня платформа зі статтями, ресурсами, компонентами та шаблонами коду українською мовою. Читайте останні матеріали, туторіали та огляди."
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

      {/* Persistent Top Header Section across ALL modes */}
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          {mode === "articles" ? t("index.title") : MODE_LABELS[mode]}
        </h1>
        <p className="text-muted-foreground mb-6 text-base">
          {mode === "news"
            ? "Свіжі новини IT-індустрії, релізи мов програмування, веб-технологій та штучного інтелекту."
            : mode === "articles"
            ? t("index.subtitle")
            : mode === "resources"
            ? "Корисні сервіси, інструменти та сервіси для навчання й продуктивної розробки."
            : mode === "components"
            ? "Бібліотеки, пакети та фреймворки для ваших Python-проєктів."
            : mode === "templates"
            ? "Готові до використання шаблони коду з коментарями та поясненнями."
            : "Добірка колірних палітр реальних вебсайтів для вашого натхнення та швидкої інтеграції."}
        </p>

        {/* Tier 1 Primary Controls: Search + Sort + ModeSwitcher + Dropdown */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            suggestions={activeSuggestions}
            placeholder={
              mode === "news"
                ? "Пошук новин..."
                : mode === "articles"
                ? t("search.placeholder")
                : mode === "resources"
                ? "Пошук ресурсів та інструментів..."
                : mode === "components"
                ? "Пошук бібліотек та компонентів..."
                : mode === "templates"
                ? "Пошук шаблонів коду..."
                : "Пошук колірних палітр..."
            }
          />
          <ArticleFilters
            sortBy={sortBy}
            onSortChange={setSortBy}
            categoryId={categoryId}
            onCategoryChange={(val) => {
              setCategoryId(val);
              setActivePill("all");
            }}
            categoryOptions={activeCategoryOptions}
            categoryTranslations={categoryTranslations}
            dropdownPlaceholder={activeDropdownPlaceholder}
          />
        </div>

        {/* Tier 2 Secondary Controls: CategoryPills with dynamic mode accent color */}
        {availablePills.length > 1 && (
          <div className="mt-4 pt-1 border-t border-border/40">
            <CategoryPills
              pills={availablePills}
              activePillId={activePill}
              onSelectPill={setActivePill}
              mode={mode}
              accentColor={MODE_ACCENTS[mode]}
            />
          </div>
        )}
      </section>

      {/* Content Rendering based on active mode */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <p className="text-muted-foreground">{t("index.loading")}</p>
        </div>
      ) : mode === "news" ? (
        filteredNews.length === 0 ? (
          <div className="flex justify-center py-16">
            <p className="text-muted-foreground">
              {searchQuery || categoryId !== "all" || activePill !== "all"
                ? "Нічого не знайдено за вашим запитом"
                : "Ще немає новин"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col max-w-5xl mx-auto w-full space-y-8">
            {filteredNews.map(({ entry, loc }, index) => (
              <NewsCard
                key={entry.id}
                item={{
                  id: entry.id,
                  title: loc.title,
                  description: loc.description,
                  image: entry.image_url,
                  likes: entry.likes,
                  url: entry.external_url,
                  tags: entry.tags,
                }}
                index={index}
                onRead={() => {
                  navigate(`/news/${entry.id}`);
                }}
                onLike={() => {
                  toggleLike.mutate({
                    entryId: entry.id,
                    isLiking: true,
                  });
                }}
                onShare={() => {
                  shareEntry(entry.id, loc.title, `/news/${entry.id}`);
                }}
              />
            ))}
          </div>
        )
      ) : mode === "articles" ? (
        filteredArticles.length === 0 ? (
          <div className="flex justify-center py-16">
            <p className="text-muted-foreground">
              {searchQuery || categoryId !== "all" || activePill !== "all"
                ? t("index.no_results")
                : t("index.no_articles")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(({ article, loc }, index: number) => (
              <ArticleCard
                key={article.id}
                article={{
                  id: article.id,
                  title: loc.title,
                  description: loc.description,
                  image: article.image_url,
                  likes: article.likes,
                  reads: article.reads,
                  category: article.category_id || "",
                }}
                index={index}
              />
            ))}
          </div>
        )
      ) : mode === "resources" ? (
        filteredResources.length === 0 ? (
          <div className="flex justify-center py-16">
            <p className="text-muted-foreground">
              {searchQuery || categoryId !== "all" || activePill !== "all"
                ? "Нічого не знайдено за вашим запитом"
                : "Ще немає ресурсів"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(({ entry, loc }, index) => {
              const resItem: ResourceItem = {
                id: entry.id,
                title: loc.title,
                description: loc.description,
                image: entry.image_url ?? undefined,
                likes: entry.likes,
                url: entry.external_url ?? undefined,
              };
              return (
                <ResourceCard
                  key={entry.id}
                  item={resItem}
                  index={index}
                  onDetails={() => navigate(`/resource/${entry.id}`)}
                  onTry={() => {
                    if (entry.external_url) {
                      window.open(entry.external_url, "_blank", "noopener,noreferrer");
                    }
                  }}
                  onLike={() => {
                    toggleLike.mutate({
                      entryId: entry.id,
                      isLiking: true,
                    });
                  }}
                  onShare={() => {
                    shareEntry(entry.id, loc.title, `/resource/${entry.id}`);
                  }}
                />
              );
            })}
          </div>
        )
      ) : mode === "components" ? (
        filteredComponents.length === 0 ? (
          <div className="flex justify-center py-16">
            <p className="text-muted-foreground">
              {searchQuery || categoryId !== "all" || activePill !== "all"
                ? "Нічого не знайдено за вашим запитом"
                : "Ще немає компонентів"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComponents.map(({ entry, loc }, index) => {
              const compItem: ComponentItem = {
                id: entry.id,
                title: loc.title,
                description: loc.description,
                url: entry.external_url ?? undefined,
              };
              return (
                <ComponentCard
                  key={entry.id}
                  item={compItem}
                  index={index}
                  onView={() => navigate(`/component/${entry.id}`)}
                  onLink={() => {
                    if (entry.external_url) {
                      window.open(entry.external_url, "_blank", "noopener,noreferrer");
                    }
                  }}
                />
              );
            })}
          </div>
        )
      ) : mode === "templates" ? (
        filteredTemplates.length === 0 ? (
          <div className="flex justify-center py-16">
            <p className="text-muted-foreground">
              {searchQuery || categoryId !== "all" || activePill !== "all"
                ? "Нічого не знайдено за вашим запитом"
                : "Ще немає шаблонів коду"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(({ entry, loc }, index) => {
              const compItem: ComponentItem = {
                id: entry.id,
                title: loc.title,
                description: loc.description,
                url: entry.external_url ?? undefined,
              };
              return (
                <ComponentCard
                  key={entry.id}
                  item={compItem}
                  index={index}
                  onView={() => navigate(`/component/${entry.id}`)}
                  onLink={() => {
                    if (entry.external_url) {
                      window.open(entry.external_url, "_blank", "noopener,noreferrer");
                    }
                  }}
                />
              );
            })}
          </div>
        )
      ) : (
        /* mode === 'palettes' */
        filteredPalettes.length === 0 ? (
          <div className="flex justify-center py-16">
            <p className="text-neutral-400">
              {searchQuery || categoryId !== "all" || activePill !== "all"
                ? "Нічого не знайдено за вашим запитом"
                : "Ще немає доданих палітр"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-7">
            {filteredPalettes.map(({ entry, loc }, index) => (
              <PaletteCard
                key={entry.id}
                item={{
                  id: entry.id,
                  title: loc.title,
                  description: loc.description,
                  image: entry.image_url,
                  likes: entry.likes,
                  url: entry.external_url,
                  tags: entry.tags,
                }}
                index={index}
                isLiked={getLikedEntries().includes(entry.id)}
                onColors={() => navigate(`/palette/${entry.id}`)}
                onView={() => {
                  if (entry.external_url) {
                    window.open(entry.external_url, "_blank", "noopener,noreferrer");
                  } else {
                    navigate(`/palette/${entry.id}`);
                  }
                }}
                onLike={() => {
                  const currentlyLiked = getLikedEntries().includes(entry.id);
                  setEntryLiked(entry.id, !currentlyLiked);
                  toggleLike.mutate({ entryId: entry.id, isLiking: !currentlyLiked });
                }}
                onShare={() => shareEntry(entry.id, loc.title, `/palette/${entry.id}`)}
              />
            ))}
          </div>
        )
      )}
    </PageLayout>
  );
};

export default Index;

