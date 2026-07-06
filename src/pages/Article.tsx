import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { useArticle, useTrackArticleView } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { useLanguage } from "@/hooks/useLanguage";
import { useCategoriesTranslations } from "@/hooks/useCategoryTranslation";
import { localizeArticle } from "@/lib/localize";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import LikeButton from "@/components/LikeButton";
import { ArrowLeft, Eye, Calendar, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { shareArticle } from "@/lib/share";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

const Article = () => {
  const { id } = useParams<{ id: string }>();
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

  return (
    <PageLayout>
      <SEO
        title={`${displayTitle} — Magnifique numérique`}
        description={seoDescription}
        path={`/article/${article.id}`}
        image={article.image_url}
        type="article"
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
        <div className="flex items-center gap-4 mb-10">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('article.back')}
          </Link>

          {category && (
            <Link to={`/sections?category=${category.id}`}>
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium hover:bg-primary/20 transition-colors">
                {displayCategoryName}
              </span>
            </Link>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {displayTitle}
        </h1>

        <p className="text-xl text-muted-foreground mb-6">{displayDescription}</p>

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
          <LikeButton articleId={article.id} likes={article.likes} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => shareArticle(article.id, displayTitle || article.title)}
            className="ml-auto hover:text-primary-foreground hover:bg-primary hover:border-primary transition-colors duration-200"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {t('article.share') !== 'article.share' ? t('article.share') : 'Поділитися'}
          </Button>
        </div>

        <div className="aspect-video overflow-hidden rounded-xl mb-8">
          <img
            src={article.image_url}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        </div>

        <div 
          className="prose prose-lg dark:prose-invert max-w-none
            [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2
            [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayContent || '', {
            ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'img', 'a', 'span', 'div'],
            ALLOWED_ATTR: ['class', 'href', 'src', 'alt', 'title', 'target', 'rel'],
          }) }}
        />
      </article>
    </PageLayout>
  );
};

export default Article;

