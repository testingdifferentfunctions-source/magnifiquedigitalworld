import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import ArticleCard from "@/components/ArticleCard";
import ResourceCard, { ResourceItem } from "@/components/ResourceCard";
import ComponentCard, { ComponentItem } from "@/components/ComponentCard";
import NewsCard from "@/components/NewsCard";
import PaletteCard from "@/components/PaletteCard";
import SnippetCard from "@/components/SnippetCard";
import DictionaryCard from "@/components/DictionaryCard";
import DesignCard from "@/components/DesignCard";
import CodePlayground from "@/components/CodePlayground";
import SearchBar from "@/components/SearchBar";
import ArticleFilters, { SortOption, FilterCategoryOption } from "@/components/ArticleFilters";
import CategoryPills, { PillItem } from "@/components/CategoryPills";
import { useArticles, useIncrementImpressions } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { useLanguage } from "@/hooks/useLanguage";
import { localizeArticle } from "@/lib/localize";
import {
  useMode,
  MODE_ACCENTS,
  getModeTitle,
  getModeSubtitle,
  getModeSearchPlaceholder,
  getModeEmptyMessage,
} from "@/hooks/useMode";
import {
  useModeEntries,
  localizeEntry,
  useToggleModeEntryLike,
  type ModeEntry,
} from "@/hooks/useModeEntries";
import { shareEntry, getLikedEntries, setEntryLiked } from "@/lib/shareEntry";
import { computeSemanticScore, searchSemanticRpc } from "@/lib/semanticSearch";

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

// Filter entries helper for non-article modes with dynamic categories & semantic vector scoring
const getFilteredModeEntries = (
  entries: ModeEntry[],
  query: string,
  categoryId: string,
  activePill: string,
  sort: SortOption,
  lang: string,
  categoriesList: any[],
  rpcScores: Record<string, number> = {}
) => {
  let list = entries.map((entry) => {
    const loc = localizeEntry(entry, lang as any);
    const contentText = (loc.blocks || [])
      .map((b: any) => {
        if (!b) return "";
        if (b.type === "header" || b.type === "paragraph") return b.text || "";
        if (b.type === "list" && Array.isArray(b.items)) return b.items.join(" ");
        if (b.type === "code") return `${b.language || ""} ${b.code || ""}`;
        return "";
      })
      .filter(Boolean)
      .join(" ");

    let semanticScore = 1;
    if (query.trim()) {
      if (rpcScores[entry.id] !== undefined) {
        semanticScore = rpcScores[entry.id];
      } else {
        semanticScore = computeSemanticScore(query, {
          title: loc.title,
          description: loc.description,
          tags: entry.tags,
          content: contentText,
        });
      }
    }

    return {
      entry,
      loc,
      semanticScore,
    };
  });

  // 1. Semantic Search Query
  if (query.trim()) {
    list = list.filter(({ semanticScore }) => semanticScore > 0);
  }

  // 2. Primary Filter (Dropdown category)
  if (categoryId !== "all") {
    const selectedCat = categoriesList.find((c) => c.id === categoryId);
    const keywords: string[] = [];
    if (selectedCat) {
      keywords.push(selectedCat.name.toLowerCase());
      if (selectedCat.name_en) keywords.push(selectedCat.name_en.toLowerCase());
      (selectedCat.sub_topics || []).forEach((st: string) => keywords.push(st.toLowerCase()));
      (selectedCat.subcategories || []).forEach((sc: any) => {
        keywords.push(sc.name.toLowerCase());
        if (sc.name_en) keywords.push(sc.name_en.toLowerCase());
      });
    } else {
      keywords.push(categoryId.toLowerCase());
    }

    list = list.filter(({ entry, loc }) => {
      if ((entry as any).category_id === categoryId) return true;
      const matchTags = entry.tags.some((tag) =>
        keywords.some((kw) => tag.toLowerCase().includes(kw) || kw.includes(tag.toLowerCase()))
      );
      const matchText = keywords.some(
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

  // 4. Sort (ranked by semantic relevance when searching)
  list.sort((a, b) => {
    if (query.trim() && Math.abs(b.semanticScore - a.semanticScore) > 0.1) {
      return b.semanticScore - a.semanticScore;
    }
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
  const { data: modeCategories = [] } = useCategories(mode);
  const incrementImpressions = useIncrementImpressions();
  const impressionsTracked = useRef(false);

  // Mode entries data
  const { data: news = [], isLoading: newsLoading } = useModeEntries("news");
  const { data: resources = [], isLoading: resourcesLoading } = useModeEntries("resource");
  const { data: components = [], isLoading: componentsLoading } = useModeEntries("component");
  const { data: templates = [], isLoading: templatesLoading } = useModeEntries("template");
  const { data: palettes = [], isLoading: palettesLoading } = useModeEntries("palette");
  const { data: dictionary = [], isLoading: dictionaryLoading } = useModeEntries("dictionary");
  const { data: design = [], isLoading: designLoading } = useModeEntries("design");
  const toggleLike = useToggleModeEntryLike();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    try {
      const saved = localStorage.getItem("feed-sort-by");
      if (saved === "newest" || saved === "oldest") return saved as SortOption;
    } catch {
      /* ignore localStorage access errors */
    }
    return "newest";
  });
  const [categoryId, setCategoryId] = useState<string>("all");
  const [activePill, setActivePill] = useState<string>("all");
  const [rpcScores, setRpcScores] = useState<Record<string, number>>({});

  // Task 3: State Reset on Mode Switch
  // When switching mode, immediately reset category, pill, and search query to provide a clean, unfiltered index
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setCategoryId("all");
    setActivePill("all");
    setSearchQuery("");
    setRpcScores({});
  }, [mode]);

  // Reset secondary pill when primary category dropdown changes
  useEffect(() => {
    setActivePill("all");
  }, [categoryId]);

  useEffect(() => {
    try {
      localStorage.setItem("feed-sort-by", sortBy);
    } catch {
      /* ignore localStorage access errors */
    }
  }, [sortBy]);

  // Track impressions when articles are loaded
  useEffect(() => {
    if (articles.length > 0 && !impressionsTracked.current) {
      impressionsTracked.current = true;
      incrementImpressions.mutate(articles.map((a) => a.id));
    }
  }, [articles, incrementImpressions]);

  // Mode-specific category options for Primary Dropdown (completely dynamic!)
  const activeCategoryOptions: FilterCategoryOption[] = useMemo(() => {
    return modeCategories.map((c) => ({
      id: c.id,
      name: language === "en" && c.name_en ? c.name_en : c.name,
    }));
  }, [modeCategories, language]);

  // Placeholder for Primary Dropdown (Всі розділи for all modes)
  const activeDropdownPlaceholder = useMemo(() => {
    return language === "en" ? "All Sections" : "Всі розділи";
  }, [language]);

  // Derive secondary pills dynamically based on active mode & selected category
  const availablePills: PillItem[] = useMemo(() => {
    const allPill: PillItem = { id: "all", label: language === "en" ? "All" : "Всі" };

    if (categoryId === "all") {
      const pillsSet = new Set<string>();
      modeCategories.forEach((cat) => {
        (cat.subcategories || []).forEach((sc) => {
          pillsSet.add(language === "en" && sc.name_en ? sc.name_en : sc.name);
        });
        (cat.sub_topics || []).forEach((st) => pillsSet.add(st));
      });

      if (mode === "articles") {
        articles.forEach((art) => (art.tags || []).forEach((t) => pillsSet.add(t)));
      } else {
        const currentEntries =
          mode === "news"
            ? news
            : mode === "palettes"
            ? palettes
            : mode === "resources"
            ? resources
            : mode === "components"
            ? components
            : mode === "templates"
            ? templates
            : dictionary;
        currentEntries.forEach((entry) => (entry.tags || []).forEach((t) => pillsSet.add(t)));
      }

      const pills = Array.from(pillsSet)
        .filter(Boolean)
        .slice(0, 15)
        .map((p) => ({ id: p, label: p }));
      return [allPill, ...pills];
    } else {
      const currentCategory = modeCategories.find((c) => c.id === categoryId);
      if (currentCategory) {
        const categoryPills: string[] = [];
        (currentCategory.subcategories || []).forEach((sc) => {
          categoryPills.push(language === "en" && sc.name_en ? sc.name_en : sc.name);
        });
        (currentCategory.sub_topics || []).forEach((st) => {
          if (!categoryPills.includes(st)) categoryPills.push(st);
        });

        if (categoryPills.length > 0) {
          return [allPill, ...categoryPills.map((st) => ({ id: st, label: st }))];
        }
      }

      // Fallback: collect tags from items matching category
      const tagsSet = new Set<string>();
      if (mode === "articles") {
        articles
          .filter((a) => a.category_id === categoryId)
          .flatMap((a) => a.tags || [])
          .forEach((t) => tagsSet.add(t));
      } else {
        const currentEntries =
          mode === "news"
            ? news
            : mode === "palettes"
            ? palettes
            : mode === "resources"
            ? resources
            : mode === "components"
            ? components
            : mode === "templates"
            ? templates
            : dictionary;
        currentEntries.forEach((e) => (e.tags || []).forEach((t) => tagsSet.add(t)));
      }
      return [allPill, ...Array.from(tagsSet).slice(0, 15).map((t) => ({ id: t, label: t }))];
    }
  }, [mode, categoryId, modeCategories, articles, news, palettes, resources, components, templates, dictionary, language]);

  // Localized articles
  const localizedArticles = useMemo(
    () => articles.map((a) => ({ article: a, loc: localizeArticle(a, language) })),
    [articles, language]
  );

  // Trigger Supabase semantic vector RPC search when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setRpcScores({});
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchSemanticRpc(searchQuery, mode);
        if (results && results.length > 0) {
          const map: Record<string, number> = {};
          results.forEach((r) => {
            map[r.id] = r.similarity;
          });
          setRpcScores(map);
        }
      } catch (err) {
        console.debug("Semantic RPC search fallback:", err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, mode]);

  // Filtered articles (Two-Tier filtering with semantic vector scoring, only computed when mode is articles)
  const filteredArticles = useMemo(() => {
    if (mode !== "articles") return [];
    let result = localizedArticles.map(({ article, loc }) => {
      const semanticScore = searchQuery.trim()
        ? rpcScores[article.id] !== undefined
          ? rpcScores[article.id]
          : computeSemanticScore(searchQuery, {
              title: loc.title,
              description: loc.description,
              tags: article.tags,
              content: article.content || "",
            })
        : 1;
      return { article, loc, semanticScore };
    });

    // 1. Semantic Search Query
    if (searchQuery.trim()) {
      result = result.filter(({ semanticScore }) => semanticScore > 0);
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

    // 4. Sort (ranked by semantic relevance when searching)
    result.sort((a, b) => {
      if (searchQuery.trim() && Math.abs(b.semanticScore - a.semanticScore) > 0.1) {
        return b.semanticScore - a.semanticScore;
      }
      const dateA = new Date(a.article.created_at).getTime();
      const dateB = new Date(b.article.created_at).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [mode, localizedArticles, searchQuery, sortBy, categoryId, activePill, rpcScores]);

  const filteredNews = useMemo(
    () =>
      mode === "news"
        ? getFilteredModeEntries(news, searchQuery, categoryId, activePill, sortBy, language, modeCategories, rpcScores)
        : [],
    [mode, news, searchQuery, categoryId, activePill, sortBy, language, modeCategories, rpcScores]
  );

  const filteredResources = useMemo(
    () =>
      mode === "resources"
        ? getFilteredModeEntries(resources, searchQuery, categoryId, activePill, sortBy, language, modeCategories, rpcScores)
        : [],
    [mode, resources, searchQuery, categoryId, activePill, sortBy, language, modeCategories, rpcScores]
  );

  const filteredComponents = useMemo(
    () =>
      mode === "components"
        ? getFilteredModeEntries(components, searchQuery, categoryId, activePill, sortBy, language, modeCategories, rpcScores)
        : [],
    [mode, components, searchQuery, categoryId, activePill, sortBy, language, modeCategories, rpcScores]
  );

  const filteredTemplates = useMemo(
    () =>
      mode === "templates"
        ? getFilteredModeEntries(templates, searchQuery, categoryId, activePill, sortBy, language, modeCategories, rpcScores)
        : [],
    [mode, templates, searchQuery, categoryId, activePill, sortBy, language, modeCategories, rpcScores]
  );

  const filteredPalettes = useMemo(
    () =>
      mode === "palettes"
        ? getFilteredModeEntries(palettes, searchQuery, categoryId, activePill, sortBy, language, modeCategories, rpcScores)
        : [],
    [mode, palettes, searchQuery, categoryId, activePill, sortBy, language, modeCategories, rpcScores]
  );

  const filteredDictionary = useMemo(
    () =>
      mode === "dictionary"
        ? getFilteredModeEntries(dictionary, searchQuery, categoryId, activePill, sortBy, language, modeCategories, rpcScores)
        : [],
    [mode, dictionary, searchQuery, categoryId, activePill, sortBy, language, modeCategories, rpcScores]
  );

  const filteredDesign = useMemo(
    () =>
      mode === "design"
        ? getFilteredModeEntries(design, searchQuery, categoryId, activePill, sortBy, language, modeCategories, rpcScores)
        : [],
    [mode, design, searchQuery, categoryId, activePill, sortBy, language, modeCategories, rpcScores]
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
    if (mode === "dictionary") {
      return dictionary.map((d) => localizeEntry(d, language).title);
    }
    if (mode === "design") {
      return design.map((d) => localizeEntry(d, language).title);
    }
    return palettes.map((p) => localizeEntry(p, language).title);
  }, [mode, news, localizedArticles, resources, components, templates, palettes, dictionary, design, language]);

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
      : mode === "dictionary"
      ? dictionaryLoading
      : mode === "design"
      ? designLoading
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
          {getModeTitle(mode, language)}
        </h1>
        <p className="text-muted-foreground mb-6 text-base">
          {getModeSubtitle(mode, language)}
        </p>

        {/* Tier 1 Primary Controls: Search + Sort + ModeSwitcher + Dropdown (Hidden in Editor mode) */}
        {mode !== "editor" && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              suggestions={activeSuggestions}
              placeholder={getModeSearchPlaceholder(mode, language)}
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
              dropdownPlaceholder={activeDropdownPlaceholder}
            />
          </div>
        )}

        {/* Tier 2 Secondary Controls: CategoryPills with dynamic mode accent color (Hidden in Editor mode) */}
        {mode !== "editor" && (availablePills.length > 1 || (categoryId !== "all" && modeCategories.some((c) => c.id === categoryId))) && (
          <div className="mt-4 pt-1 border-t border-border/40">
            <CategoryPills
              pills={availablePills}
              activePillId={activePill}
              onSelectPill={setActivePill}
              mode={mode}
              accentColor={MODE_ACCENTS[mode]}
              selectedCategory={modeCategories.find((c) => c.id === categoryId) || null}
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
              {getModeEmptyMessage("news", Boolean(searchQuery || categoryId !== "all" || activePill !== "all"), language)}
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
              {getModeEmptyMessage("resources", Boolean(searchQuery || categoryId !== "all" || activePill !== "all"), language)}
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
              {getModeEmptyMessage("components", Boolean(searchQuery || categoryId !== "all" || activePill !== "all"), language)}
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
                likes: entry.likes,
                tags: entry.tags,
              };
              return (
                <ComponentCard
                  key={entry.id}
                  item={compItem}
                  index={index}
                  isLiked={getLikedEntries().includes(entry.id)}
                  onView={() => navigate(`/component/${entry.id}`)}
                  onLike={() => {
                    const currentlyLiked = getLikedEntries().includes(entry.id);
                    setEntryLiked(entry.id, !currentlyLiked);
                    toggleLike.mutate({ entryId: entry.id, isLiking: !currentlyLiked });
                  }}
                  onShare={() => shareEntry(entry.id, loc.title, `/component/${entry.id}`)}
                />
              );
            })}
          </div>
        )
      ) : mode === "templates" ? (
        filteredTemplates.length === 0 ? (
          <div className="flex justify-center py-16">
            <p className="text-muted-foreground">
              {getModeEmptyMessage("templates", Boolean(searchQuery || categoryId !== "all" || activePill !== "all"), language)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredTemplates.map(({ entry, loc }, index) => {
              const codeBlock = loc.blocks.find((b) => b.type === "code") as
                | { code: string; language?: string }
                | undefined;

              return (
                <SnippetCard
                  key={entry.id}
                  item={{
                    id: entry.id,
                    title: loc.title,
                    description: loc.description,
                    code: codeBlock?.code,
                    language: codeBlock?.language,
                    tags: entry.tags,
                    likes: entry.likes,
                    url: entry.external_url,
                  }}
                  index={index}
                  isLiked={getLikedEntries().includes(entry.id)}
                  onView={() => navigate(`/template/${entry.id}`)}
                  onLike={() => {
                    const currentlyLiked = getLikedEntries().includes(entry.id);
                    setEntryLiked(entry.id, !currentlyLiked);
                    toggleLike.mutate({ entryId: entry.id, isLiking: !currentlyLiked });
                  }}
                  onShare={() => shareEntry(entry.id, loc.title, `/template/${entry.id}`)}
                />
              );
            })}
          </div>
        )
      ) : mode === "palettes" ? (
        filteredPalettes.length === 0 ? (
          <div className="flex justify-center py-16">
            <p className="text-muted-foreground">
              {getModeEmptyMessage("palettes", Boolean(searchQuery || categoryId !== "all" || activePill !== "all"), language)}
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
      ) : mode === "editor" ? (
        <div className="w-full max-w-6xl mx-auto">
          <CodePlayground />
        </div>
      ) : mode === "design" ? (
        filteredDesign.length === 0 ? (
          <div className="flex justify-center py-16">
            <p className="text-muted-foreground">
              {getModeEmptyMessage("design", Boolean(searchQuery || categoryId !== "all" || activePill !== "all"), language)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredDesign.map(({ entry, loc }, index) => (
              <DesignCard
                key={entry.id}
                item={{
                  id: entry.id,
                  title: loc.title,
                  description: loc.description,
                  likes: entry.likes,
                  tags: entry.tags,
                  url: entry.external_url,
                  blocks: loc.blocks,
                }}
                index={index}
                isLiked={getLikedEntries().includes(entry.id)}
                onView={() => navigate(`/design/${entry.id}`)}
                onLike={() => {
                  const currentlyLiked = getLikedEntries().includes(entry.id);
                  setEntryLiked(entry.id, !currentlyLiked);
                  toggleLike.mutate({ entryId: entry.id, isLiking: !currentlyLiked });
                }}
                onShare={() => shareEntry(entry.id, loc.title, `/design/${entry.id}`)}
              />
            ))}
          </div>
        )
      ) : (
        /* mode === 'dictionary' */
        filteredDictionary.length === 0 ? (
          <div className="flex justify-center py-16">
            <p className="text-muted-foreground">
              {getModeEmptyMessage("dictionary", Boolean(searchQuery || categoryId !== "all" || activePill !== "all"), language)}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredDictionary.map(({ entry, loc }, index) => (
              <DictionaryCard
                key={entry.id}
                item={{
                  id: entry.id,
                  title: loc.title,
                  description: loc.description,
                  likes: entry.likes,
                  tags: entry.tags,
                  url: entry.external_url,
                }}
                index={index}
                isLiked={getLikedEntries().includes(entry.id)}
                onRead={() => navigate(`/dictionary/${entry.id}`)}
                onLike={() => {
                  const currentlyLiked = getLikedEntries().includes(entry.id);
                  setEntryLiked(entry.id, !currentlyLiked);
                  toggleLike.mutate({ entryId: entry.id, isLiking: !currentlyLiked });
                }}
                onShare={() => shareEntry(entry.id, loc.title, `/dictionary/${entry.id}`)}
              />
            ))}
          </div>
        )
      )}
    </PageLayout>
  );
};

export default Index;

