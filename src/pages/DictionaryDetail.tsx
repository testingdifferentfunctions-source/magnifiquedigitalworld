import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import BlockRenderer from "@/components/BlockRenderer";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ExternalLink,
  Heart,
  Share2,
  Tag,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useMode } from "@/hooks/useMode";
import {
  localizeEntry,
  useModeEntry,
  useToggleModeEntryLike,
} from "@/hooks/useModeEntries";
import { blocksToPlainText, extractHeadings } from "@/lib/blocks";
import { getLikedEntries, setEntryLiked, shareEntry } from "@/lib/shareEntry";

const DictionaryDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { setMode } = useMode();
  const { data: entry, isLoading } = useModeEntry(id);
  const toggleLike = useToggleModeEntryLike();

  const [liked, setLiked] = useState(false);
  const [likeOffset, setLikeOffset] = useState(0);

  // Enforce Dictionary mode and design tokens (#F3CD97 on #080202)
  useEffect(() => {
    setMode("dictionary");
    const root = document.documentElement;
    root.style.setProperty("--primary", "35 79% 77%");
    root.style.setProperty("--accent", "35 79% 77%");
    root.style.setProperty("--ring", "35 79% 77%");
    root.style.setProperty("--border", "0 15% 15%");
    root.style.setProperty("--card", "0 20% 6%");
    root.style.setProperty("--background", "0 60% 2%"); // #080202
    root.style.setProperty("--muted", "0 15% 10%");
  }, [setMode]);

  useEffect(() => {
    setLiked(getLikedEntries().includes(id));
    setLikeOffset(0);
  }, [id]);

  const loc = entry ? localizeEntry(entry, language) : null;
  const headings = useMemo(
    () => (loc ? extractHeadings(loc.blocks) : []),
    [loc]
  );

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh] bg-[#080202]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#F3CD97] border-t-transparent animate-spin" />
            <p className="text-sm text-neutral-400">
              {language === "en" ? "Loading dictionary term..." : "Завантаження терміна..."}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!entry || !loc) {
    return (
      <PageLayout>
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#F3CD97]/15 text-[#F3CD97] flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-6 h-6 !text-[#F3CD97]" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-100">
            {language === "en" ? "Term not found" : "Термін не знайдено"}
          </h1>
          <p className="text-sm text-neutral-400">
            {language === "en"
              ? "The requested dictionary entry could not be located."
              : "Запитуваний запис словника не знайдено або він був переміщений."}
          </p>
          <Button
            className="!bg-[#F3CD97] hover:!bg-[#e4be87] !text-[#080202] font-semibold transition-colors shadow-sm"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2 !text-[#080202]" />
            {language === "en" ? "Back" : "Назад"}
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString(
        language === "uk" ? "uk-UA" : "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
    } catch {
      return "";
    }
  };

  const canonicalUrl =
    language === "en"
      ? entry.canonical_url_en || entry.canonical_url_uk || undefined
      : entry.canonical_url_uk || entry.canonical_url_en || undefined;

  return (
    <PageLayout>
      <SEO
        title={`${loc.title} — Словник — Magnifique numérique`}
        description={
          loc.description || blocksToPlainText(loc.blocks).slice(0, 155)
        }
        path={`/dictionary/${entry.id}`}
        type="article"
        canonicalUrl={canonicalUrl}
      />

      <article
        id="dictionary-detail-article"
        className="max-w-4xl mx-auto pb-16 bg-[#080202]"
        style={{
          "--primary": "#F3CD97",
          "--accent": "#F3CD97",
          "--ring": "#F3CD97",
          "--border": "#2a1d1d",
        } as React.CSSProperties}
      >
        {/* 1. TOP BAR: Back button */}
        <div id="dictionary-detail-top-bar" className="flex items-center justify-between gap-4 mb-4">
          <Button
            id="dictionary-back-button"
            onClick={() => navigate("/")}
            className="h-10 px-4 rounded-xl text-sm font-semibold bg-transparent text-[#94A3B8] hover:bg-[#F3CD97] hover:text-black [&:hover>svg]:text-black border-0 shadow-none inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-[#94A3B8] transition-colors" size={18} />
            <span>{language === "en" ? "Back" : "Назад"}</span>
          </Button>
        </div>

        {/* 2. TAGS: Directly below top bar, horizontal row of tag pills */}
        {entry.tags && entry.tags.length > 0 && (
          <div id="dictionary-detail-tags" className="flex flex-wrap items-center gap-2 mb-6">
            {entry.tags.map((tag) => {
              const cleanTag = tag.replace(/^#+/, "").trim();
              if (!cleanTag) return null;
              return (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-transparent text-[#F3CD97] border border-[#F3CD97] transition-colors"
                >
                  <Tag className="w-3 h-3 text-[#F3CD97]" aria-hidden="true" />
                  {cleanTag}
                </span>
              );
            })}
          </div>
        )}

        {/* Article Headline & Summary: Clean Vertical Order */}
        <header className="mb-8">
          {/* 1. Main Title (Heading) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-100 leading-tight mb-4">
            {loc.title}
          </h1>

          {/* 2. Short Description / Subtitle */}
          {loc.description && (
            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed mb-6">
              {loc.description}
            </p>
          )}

          {/* Metadata & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 pb-4 border-b border-[#2D2D2D]">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-400">
              {entry.created_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  {formatDate(entry.created_at)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {entry.external_url && (
                <Button
                  asChild
                  size="sm"
                  className="!bg-[#F3CD97] hover:!bg-[#e4be87] !text-[#151515] font-semibold text-xs h-9 px-4 gap-1.5 shadow-sm transition-colors"
                >
                  <a href={entry.external_url} target="_blank" rel="noopener noreferrer">
                    {language === "en" ? "Source" : "Джерело"}
                    <ExternalLink className="w-3.5 h-3.5 !text-[#151515]" aria-hidden="true" />
                  </a>
                </Button>
              )}

              {/* Like Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                aria-pressed={liked}
                aria-label={language === "en" ? "Like" : "Вподобати"}
                className="!border !border-[#F3CD97] !bg-[#F3CD97]/10 hover:!bg-[#F3CD97]/20 !text-[#F3CD97] h-9 px-3 text-xs font-medium transition-colors"
              >
                <Heart
                  className={`w-3.5 h-3.5 mr-1.5 transition-colors !text-[#F3CD97] ${
                    liked ? "fill-[#F3CD97]" : ""
                  }`}
                  aria-hidden="true"
                />
                {likes}
              </Button>

              {/* Share Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareEntry(entry.id, loc.title, `/dictionary/${entry.id}`)}
                aria-label={language === "en" ? "Share" : "Поділитися"}
                className="!border !border-[#F3CD97] !bg-[#F3CD97]/10 hover:!bg-[#F3CD97]/20 !text-[#F3CD97] h-9 px-3 text-xs font-medium transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 mr-1.5 !text-[#F3CD97]" aria-hidden="true" />
                {language === "en" ? "Share" : "Поділитися"}
              </Button>
            </div>
          </div>
        </header>

        {/* 3. TABLE OF CONTENTS (Зміст): Full-width stacked box exactly mirroring News layout with #F3CD97 theme */}
        {headings.length > 0 && (
          <nav
            id="dictionary-detail-toc"
            className="mb-10 p-6 rounded-xl bg-[#1C1C1C] border border-[#2D2D2D] shadow-sm"
            aria-label="Зміст статті"
          >
            <h2 className="text-lg font-bold text-neutral-100 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 !bg-[#F3CD97] rounded-full inline-block" />
              {language === "en" ? "Table of Contents" : "Зміст"}
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
                    className="text-sm font-medium text-neutral-300 hover:!text-[#F3CD97] hover:underline underline-offset-4 transition-colors inline-block"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* 4. MAIN ARTICLE BODY/TEXT: Full-width stacked content */}
        <main
          id="dictionary-detail-content"
          className="prose prose-invert max-w-none text-neutral-200 [&_a]:!text-[#F3CD97] [&_a]:underline [&_a:hover]:!text-[#e4be87] [&_blockquote]:!border-l-4 [&_blockquote]:!border-l-[#F3CD97] [&_blockquote]:bg-[#181818] [&_blockquote]:py-3 [&_blockquote]:px-4 [&_blockquote]:rounded-r-lg [&_code]:!text-[#F3CD97] [&_pre]:bg-[#131313] [&_pre]:border [&_pre]:border-[#2B2B2B]"
        >
          {loc.blocks && loc.blocks.length > 0 ? (
            <BlockRenderer blocks={loc.blocks} />
          ) : (
            <div className="py-8 text-neutral-400 text-sm italic">
              {language === "en"
                ? "Detailed explanation for this term will be available soon."
                : "Детальний розбір для цього терміна незабаром з'явиться."}
            </div>
          )}
        </main>
      </article>
    </PageLayout>
  );
};

export default DictionaryDetail;
