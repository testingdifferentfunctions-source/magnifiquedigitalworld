import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import BlockRenderer from "@/components/BlockRenderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Heart, ImageIcon, Share2, Tag, Calendar } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { localizeEntry, useModeEntry, useToggleModeEntryLike } from "@/hooks/useModeEntries";
import { blocksToPlainText, extractHeadings } from "@/lib/blocks";
import { getLikedEntries, setEntryLiked, shareEntry } from "@/lib/shareEntry";
import { ItemTagsList } from "@/components/ItemTagBadge";
import { logAnalyticsEvent } from "@/lib/analytics";
import { getLocalizedImageUrl } from "@/lib/localize";

const NewsDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { data: entry, isLoading } = useModeEntry(id);
  const toggleLike = useToggleModeEntryLike();

  const [liked, setLiked] = useState(false);
  const [likeOffset, setLikeOffset] = useState(0);

  useEffect(() => {
    setLiked(getLikedEntries().includes(id));
    setLikeOffset(0);
    if (id) {
      logAnalyticsEvent("view", "news", id);
    }
  }, [id]);

  const loc = entry ? localizeEntry(entry, language) : null;
  const headings = useMemo(() => (loc ? extractHeadings(loc.blocks) : []), [loc]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">{language === "en" ? "Loading..." : "Завантаження..."}</p>
        </div>
      </PageLayout>
    );
  }

  if (!entry || !loc) {
    return (
      <PageLayout>
        <div className="py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold">
            {language === "en" ? "News not found" : "Новину не знайдено"}
          </h1>
          <Button variant="outline" className="hover:text-black" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('detail.back')}
          </Button>
        </div>
      </PageLayout>
    );
  }

  const likes = Math.max(0, (entry.likes ?? 0) + likeOffset);

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikeOffset((prev) => prev + (next ? 1 : -1));
    setEntryLiked(entry.id, next);
    toggleLike.mutate({ entryId: entry.id, isLiking: next });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(language === "uk" ? "uk-UA" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const canonicalUrl = language === "en"
    ? (entry.canonical_url_en || entry.canonical_url_uk || undefined)
    : (entry.canonical_url_uk || entry.canonical_url_en || undefined);

  const displayImage = loc.imageUrl || (entry ? getLocalizedImageUrl(entry, language) : "") || entry?.image_url;

  return (
    <PageLayout>
      <SEO
        title={`${loc.title} — ${language === "en" ? "News" : "Новини"}`}
        description={loc.description || blocksToPlainText(loc.blocks).slice(0, 155)}
        path={`/news/${entry.id}`}
        image={displayImage || undefined}
        type="article"
        canonicalUrl={canonicalUrl}
      />

      <article className="max-w-4xl mx-auto pb-16">
        {/* 1. TOP BAR: A simple "Назад" (Back) button */}
        <div id="news-detail-top-bar" className="mb-4">
          <Button
            id="news-back-button"
            variant="ghost"
            className="-ml-2 text-muted-foreground hover:text-black inline-flex items-center text-sm font-medium cursor-pointer"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('detail.back')}
          </Button>
        </div>

        {/* 2. TAGS: Directly below the back button, a horizontal row of tag pills */}
        {entry.tags && entry.tags.length > 0 && (
          <div id="news-detail-tags" className="mb-6">
            <ItemTagsList tags={entry.tags} mode="news" />
          </div>
        )}

        {/* Article Headline & Summary */}
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
            {loc.title}
          </h1>
          {loc.description && (
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
              {loc.description}
            </p>
          )}

          {/* Metadata & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
              {entry.created_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {formatDate(entry.created_at)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {entry.external_url && (
                <Button
                  asChild
                  size="sm"
                  className="bg-[#A4B885] hover:bg-[#93a774] text-[#091413] font-semibold text-xs h-9 px-4 gap-1.5 shadow-sm"
                >
                  <a href={entry.external_url} target="_blank" rel="noopener noreferrer">
                    {t('detail.source')}
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={handleLike}
                aria-pressed={liked}
                aria-label={t('detail.like')}
                className="bg-[#122220] hover:bg-[#1A302D] text-neutral-200 hover:text-[#A4B885] border border-[#1E3834] h-9 px-3 text-xs font-medium"
              >
                <Heart
                  className={`w-3.5 h-3.5 mr-1.5 transition-colors ${
                    liked ? "fill-[#A4B885] text-[#A4B885]" : ""
                  }`}
                  aria-hidden="true"
                />
                {likes}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => shareEntry(entry.id, loc.title, `/news/${entry.id}`)}
                aria-label={t('detail.share')}
                className="bg-[#122220] hover:bg-[#1A302D] text-neutral-200 hover:text-[#A4B885] border border-[#1E3834] h-9 px-3 text-xs font-medium"
              >
                <Share2 className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                {t('detail.share')}
              </Button>
            </div>
          </div>
        </header>

        {/* 3. MEDIA PREVIEW: Below the tags/header, a large, full-width cover image */}
        <figure id="news-detail-media" className="mb-10">
          <div className="aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden rounded-2xl bg-[#050C0B] border border-[#182B28] flex items-center justify-center shadow-md">
            {displayImage ? (
              <img
                src={displayImage}
                alt={loc.title}
                loading="eager"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#070F0E] text-neutral-500">
                <ImageIcon className="w-16 h-16" aria-hidden="true" />
              </div>
            )}
          </div>
          {entry.image_source_url && (
            <figcaption className="mt-2.5 text-right pr-1">
              <a
                href={entry.image_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground underline hover:text-[#A4B885] transition-colors"
              >
                {t('detail.image_source')}
              </a>
            </figcaption>
          )}
        </figure>

        {/* 4. TABLE OF CONTENTS (TOC): Below the cover image, a "Зміст" block listing the article's sections/headers */}
        {headings.length > 0 && (
          <nav
            id="news-detail-toc"
            className="mb-10 p-6 rounded-xl bg-[#091413] border border-[#182B28] shadow-sm"
            aria-label={t('detail.toc_article')}
          >
            <h2 className="text-lg font-bold text-neutral-100 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#A4B885] rounded-full inline-block" />
              {t('detail.toc')}
            </h2>
            <ul className="space-y-2.5">
              {headings.map((item) => (
                <li
                  key={item.id}
                  style={{ marginLeft: item.level === 3 ? "1.25rem" : item.level === 4 ? "2rem" : "0" }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const target = document.getElementById(item.id);
                      if (target) {
                        target.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className="text-sm font-medium text-neutral-300 hover:text-[#A4B885] hover:underline underline-offset-4 transition-colors inline-block"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* 5. MAIN CONTENT: Below the TOC, the actual rendered block content of the article */}
        <main id="news-detail-content" className="prose prose-invert max-w-none">
          <BlockRenderer blocks={loc.blocks} />
        </main>
      </article>
    </PageLayout>
  );
};

export default NewsDetail;
