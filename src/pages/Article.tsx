import { useParams, Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useArticle, useTrackArticleView } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { useLanguage } from "@/hooks/useLanguage";
import { useMode } from "@/hooks/useMode";
import { useCategoriesTranslations } from "@/hooks/useCategoryTranslation";
import { localizeArticle } from "@/lib/localize";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import LikeButton from "@/components/LikeButton";
import { ArrowLeft, Eye, Calendar, Share2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { shareArticle } from "@/lib/share";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

const Article = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setMode } = useMode();
  const { data: article, isLoading, error } = useArticle(id || "");
  const { data: categories } = useCategories();
  const { t, language } = useLanguage();
  const trackView = useTrackArticleView();
  const [hasTrackedView, setHasTrackedView] = useState(false);

  useEffect(() => {
    if (article && !hasTrackedView) {
      trackView.mutate(article.id);
      setHasTrackedView(true);
    }
  }, [article, hasTrackedView]);

  const category = categories?.find((c) => c.id === article?.category_id);
  const categoryIds = useMemo(() => category ? [category.id] : [], [category]);
  const { data: categoryTranslations = {} } = useCategoriesTranslations(categoryIds);
  const displayCategoryName = category
    ? ((language === 'en' && categoryTranslations[category.id]) ? categoryTranslations[category.id] : category.name)
    : '';

  const loc = article
    ? localizeArticle(article, language)
    : { title: '', description: '', content: '' };
  const displayTitle = loc.title;
  const displayDescription = loc.description;
  const displayContent = loc.content;

  // --- ПОЧАТОК КОДУ ДЛЯ ЗМІСТУ ---
  // Інтерфейс для елемента змісту
  interface TocItem {
    id: string;
    text: string;
    level: number;
  }

  const [toc, setToc] = useState<TocItem[]>([]);
  const [parsedContent, setParsedContent] = useState<string>('');

  useEffect(() => {
    // displayContent - це твоя змінна з текстом статті (перевір, як вона точно називається у твоєму файлі)
    if (!displayContent) return; 

    // Очищуємо HTML (щоб збереглися стилі та кольори, які ми налаштовували раніше)
    const cleanHtml = DOMPurify.sanitize(displayContent, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'table', 'span', 'div'],
      ALLOWED_ATTR: ['class', 'href', 'src', 'alt', 'title', 'target', 'rel', 'style'],
    });

    // Створюємо віртуальний документ, щоб знайти заголовки
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanHtml, 'text/html');

    const headings = doc.querySelectorAll('h2, h3');
    const tocItems: TocItem[] = [];

    headings.forEach((heading, index) => {
      // Додаємо кожному заголовку унікальний id (наприклад, heading-0, heading-1)
      const id = `heading-${index}`;
      heading.setAttribute('id', id);

      tocItems.push({
        id,
        text: heading.textContent || '',
        level: heading.tagName === 'H2' ? 2 : 3, // Визначаємо рівень вкладеності
      });
    });

    setToc(tocItems);
    setParsedContent(doc.body.innerHTML); // Зберігаємо оновлений HTML з ID
  }, [displayContent]);
  // --- КІНЕЦЬ КОДУ ДЛЯ ЗМІСТУ ---

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'uk' ? "uk-UA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-2/3 mb-8" />
          <Skeleton className="aspect-video w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !article) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold mb-4">{t('article.not_found')}</h1>
          <p className="text-muted-foreground mb-8">
            {t('article.not_found_desc')}
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('article.go_home')}
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const seoDescription = (displayDescription || '').slice(0, 155);

  const canonicalUrl = language === 'en'
    ? (article.canonical_url_en || article.canonical_url_uk || article.original_source_url)
    : (article.canonical_url_uk || article.canonical_url_en || article.original_source_url);

  return (
    <PageLayout>
      <SEO
        title={`${displayTitle} — Magnifique numérique`}
        description={seoDescription}
        path={`/article/${article.id}`}
        image={article.image_url}
        type="article"
        canonicalUrl={canonicalUrl}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: displayTitle,
          description: seoDescription,
          image: article.image_url,
          datePublished: article.created_at,
          dateModified: article.updated_at,
          inLanguage: language === 'en' ? 'en' : 'uk',
          author: { "@type": "Organization", name: "Magnifique numérique" },
          publisher: { "@type": "Organization", name: "Magnifique numérique" },
        }}
      />
      <article className="max-w-4xl mx-auto">
        {/* 1) Назад (Back) navigation button with hover fill in Articles accent color */}
        <div className="mb-6">
          <Button
            onClick={() => navigate("/")}
            className="h-10 px-4 rounded-xl text-sm font-semibold bg-transparent text-[#94A3B8] hover:bg-[#A07DFA] hover:text-black [&:hover>svg]:text-black border-0 shadow-none inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-[#94A3B8] transition-colors" />
            <span>{t('article.back')}</span>
          </Button>
        </div>

        {/* 2) Article Tags (Articles Accent Outline, no solid bg, no '#' prefix, main category label removed) */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.tags.map((tag) => {
              const cleanTag = tag.replace(/^#+/, "").trim();
              if (!cleanTag) return null;
              return (
                <span
                  key={tag}
                  className="inline-block bg-transparent text-[#A07DFA] border border-[#A07DFA] px-3 py-0.5 rounded-full text-xs font-semibold"
                >
                  {cleanTag}
                </span>
              );
            })}
          </div>
        )}

        {/* 3) Main Article Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {displayTitle}
        </h1>

        <p className="text-xl text-muted-foreground mb-6">{displayDescription}</p>

        {/* 4) Meta Information */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(article.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{article.reads}</span>
          </div>
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            <span>{(article as any).share_count ?? 0}</span>
          </div>
        </div>

        <div className="aspect-video overflow-hidden rounded-xl mb-8">
          <img
            src={article.image_url}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        </div>

        {/* --- БЛОК ЗМІСТУ (Table of Contents) --- */}
        {toc.length > 0 && (
          <div className="mb-8 p-6 bg-muted/30 rounded-lg border border-border">
            <h3 className="text-xl font-bold mb-4">Зміст статті</h3>
            <ul className="space-y-3">
              {toc.map((item) => (
                <li
                  key={item.id}
                  style={{ marginLeft: item.level === 3 ? '1.5rem' : '0' }} 
                >
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="text-primary hover:underline hover:opacity-80 transition-opacity"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* --- ОСНОВНИЙ БЛОК СТАТТІ --- */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none article-content
            [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2
            [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80"
          // Зверни увагу: ми прибрали звідси DOMPurify, бо він вже відпрацював у useEffect
          // і тепер ми просто виводимо готовий parsedContent з ID для скролу
          dangerouslySetInnerHTML={{ __html: parsedContent }}
        />

        {/* --- НИЖНІ ДІЇ СТАТТІ (Bottom Actions: Like, Share & Conditional Test Button) --- */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LikeButton
              articleId={article.id}
              likes={article.likes}
              className="h-10 px-4 rounded-xl border border-input bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary text-foreground gap-2 transition-colors cursor-pointer"
            />
            <Button
              id="article-bottom-share-btn"
              variant="outline"
              size="default"
              onClick={() => shareArticle(article.id, displayTitle || article.title)}
              className="h-10 px-4 rounded-xl gap-2 hover:text-primary-foreground hover:bg-primary hover:border-primary transition-colors duration-200 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('article.share') !== 'article.share' ? t('article.share') : (language === 'en' ? 'Share' : 'Поділитися')}</span>
            </Button>
          </div>

          {(Boolean(article.show_test_button ?? article.showTestButton)) && (
            <Button
              id="article-bottom-test-btn"
              onClick={() => {
                setMode('editor');
                navigate('/editor');
              }}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md transition-all cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              <span>{language === 'en' ? 'Test' : 'Тестувати'}</span>
            </Button>
          )}
        </div>
      </article>
    </PageLayout>
  );
};

export default Article;
