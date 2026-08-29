import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import BlockRenderer from "@/components/BlockRenderer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, ExternalLink, Heart, Share2, Calendar, Sparkles, ChevronDown, BookOpen } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { localizeEntry, useModeEntry, useToggleModeEntryLike } from "@/hooks/useModeEntries";
import { blocksToPlainText, extractHeadings } from "@/lib/blocks";
import { getLikedEntries, setEntryLiked, shareEntry } from "@/lib/shareEntry";
import { ItemTagsList } from "@/components/ItemTagBadge";

const ResearchDetail = () => {
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
  }, [id]);

  const loc = entry ? localizeEntry(entry, language) : null;
  const headings = useMemo(() => (loc ? extractHeadings(loc.blocks) : []), [loc]);

  useEffect(() => {
    if (!isLoading && window.location.hash) {
      const targetId = decodeURIComponent(window.location.hash.replace("#", ""));
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isLoading, id]);

  const handleScrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${targetId}`);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#F78D60] border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm font-mono">{language === "en" ? "Loading research..." : "Завантаження дослідження..."}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!entry || !loc) {
    return (
      <PageLayout>
        <div className="py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-neutral-100">
            {language === "en" ? "Research article not found" : "Дослідження не знайдено"}
          </h1>
          <Button
            variant="outline"
            className="border-[#222B2C] hover:bg-[#192224] text-neutral-200"
            onClick={() => navigate("/research")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('detail.back_to_research')}
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

  return (
    <PageLayout>
      <SEO
        title={`${loc.title} — ${language === "en" ? "Research" : "Дослідження"}`}
        description={loc.description || blocksToPlainText(loc.blocks).slice(0, 155)}
        path={`/research/${entry.id}`}
        image={entry.image_url ?? undefined}
        type="article"
        canonicalUrl={canonicalUrl}
      />

      <article className="max-w-4xl mx-auto pb-16">
        {/* Top Back Navigation and Tags */}
        <div id="research-detail-top-bar" className="mb-8 space-y-4">
          <Button
            id="research-back-button"
            variant="ghost"
            className="text-[#94A3B8] border border-transparent hover:border-[#F78D60] hover:bg-[#F78D60] hover:text-[#0F0F0F] [&:hover>svg]:text-[#0F0F0F] active:scale-95 transition-all duration-300 px-4 py-2 rounded-lg inline-flex items-center text-sm font-semibold cursor-pointer shadow-sm"
            onClick={() => navigate("/research")}
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-[#94A3B8] transition-colors" />
            {t('detail.back')}
          </Button>

          {/* Tags relocated immediately below the back button */}
          {entry.tags && entry.tags.length > 0 && (
            <ItemTagsList tags={entry.tags} mode="research" className="flex flex-wrap gap-2" />
          )}
        </div>

        {/* Header section */}
        <header className="space-y-4 mb-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-100 leading-tight">
            {loc.title}
          </h1>

          {loc.description && (
            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
              {loc.description}
            </p>
          )}

          {/* Date relocated directly below the short description */}
          {entry.created_at && (
            <div className="flex items-center text-xs text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(entry.created_at)}
              </span>
            </div>
          )}
        </header>

        {/* Main Cover Image */}
        {entry.image_url && (
          <div className="mb-10 rounded-2xl overflow-hidden border border-[#222B2C] bg-[#0C1011] shadow-xl">
            <img
              src={entry.image_url}
              alt={loc.title}
              className="w-full max-h-[460px] object-cover"
            />
            {entry.image_source_url && (
              <div className="p-2.5 text-right bg-[#0C1011] border-t border-[#1C2527]">
                <a
                  href={entry.image_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-400 hover:text-[#F78D60] inline-flex items-center gap-1"
                >
                  <span>{t('detail.image_source')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Table of Contents for Long Articles */}
        {headings.length > 1 && (
          <nav
            id="research-table-of-contents"
            aria-label={t('detail.toc')}
            className="mb-10 p-5 rounded-xl bg-[#141718] border border-[#222B2C]"
          >
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F78D60] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{t('detail.toc')}</span>
            </h2>
            <ul className="space-y-2 text-sm text-neutral-300">
              {headings.map((h, i) => (
                <li
                  key={h.id || i}
                  className={`hover:text-[#F78D60] transition-colors ${
                    h.level === 3 ? "pl-4 text-xs text-neutral-400" : h.level === 4 ? "pl-8 text-xs text-neutral-400" : ""
                  }`}
                >
                  <a
                    href={`#${h.id}`}
                    onClick={(e) => handleScrollToHeading(e, h.id)}
                    className="hover:underline inline-block py-0.5 text-neutral-300 hover:text-[#F78D60] transition-colors"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Blocks Body */}
        <div className="prose prose-invert max-w-none space-y-6">
          <BlockRenderer blocks={loc.blocks} />
        </div>

        {/* Footer actions: "Використані джерела" Dropdown, Like, and Share */}
        <footer className="mt-12 pt-6 border-t border-[#222B2C] flex flex-wrap items-center gap-3 sm:gap-4">
          {/* 1. "Використані джерела" Dropdown */}
          {loc.sources && loc.sources.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="research-sources-dropdown-trigger"
                  className="bg-[#F78D60] hover:bg-[#e67c4e] text-[#0F0F0F] font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#0F0F0F]" />
                  <span>{t('detail.sources')}</span>
                  <ChevronDown className="w-4 h-4 text-[#0F0F0F]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-72 sm:w-80 bg-[#141718] border border-[#222B2C] text-neutral-100 p-2 shadow-2xl z-50 rounded-xl"
              >
                <div className="px-2 py-1.5 text-xs font-semibold text-neutral-400 border-b border-[#222B2C] mb-1">
                  {t('detail.sources_desc')}
                </div>
                {loc.sources.map((source, idx) => (
                  <DropdownMenuItem
                    key={idx}
                    asChild
                    className="focus:bg-[#F78D60] focus:text-[#0F0F0F] rounded-lg p-2.5 cursor-pointer text-sm font-medium transition-colors"
                  >
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 w-full text-neutral-200 hover:text-[#0F0F0F]"
                    >
                      <span className="truncate">{source.title || source.url}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* 2. Like Button */}
          <Button
            id="research-like-button"
            variant="secondary"
            onClick={handleLike}
            aria-label={t('detail.like')}
            className={`bg-[#192224] hover:bg-[#202E31] text-neutral-200 border border-[#253538] ${
              liked ? "text-[#F78D60]" : ""
            }`}
          >
            <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-[#F78D60] text-[#F78D60]" : ""}`} />
            <span>{likes}</span>
          </Button>

          {/* 3. Share Button */}
          <Button
            id="research-share-button"
            variant="secondary"
            onClick={() => shareEntry(entry.id, loc.title, `/research/${entry.id}`)}
            aria-label={t('detail.share')}
            className="bg-[#192224] hover:bg-[#202E31] text-neutral-200 border border-[#253538]"
          >
            <Share2 className="w-4 h-4 mr-2" />
            <span>{t('detail.share')}</span>
          </Button>
        </footer>
      </article>
    </PageLayout>
  );
};

export default ResearchDetail;
