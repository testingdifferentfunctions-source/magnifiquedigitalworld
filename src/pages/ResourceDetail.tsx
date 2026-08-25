import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import BlockRenderer from "@/components/BlockRenderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Heart, ImageIcon, Share2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { localizeEntry, useModeEntry, useToggleModeEntryLike } from "@/hooks/useModeEntries";
import { blocksToPlainText } from "@/lib/blocks";
import { getLikedEntries, setEntryLiked, shareEntry } from "@/lib/shareEntry";

const ResourceDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: entry, isLoading } = useModeEntry(id);
  const toggleLike = useToggleModeEntryLike();

  const [liked, setLiked] = useState(false);
  const [likeOffset, setLikeOffset] = useState(0);

  useEffect(() => {
    setLiked(getLikedEntries().includes(id));
    setLikeOffset(0);
  }, [id]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Завантаження...</p>
        </div>
      </PageLayout>
    );
  }

  if (!entry) {
    return (
      <PageLayout>
        <div className="py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold">Ресурс не знайдено</h1>
          <Button variant="outline" className="hover:text-black" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>
      </PageLayout>
    );
  }

  const loc = localizeEntry(entry, language);
  const likes = Math.max(0, entry.likes + likeOffset);

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikeOffset((prev) => prev + (next ? 1 : -1));
    setEntryLiked(entry.id, next);
    toggleLike.mutate({ entryId: entry.id, isLiking: next });
  };

  const canonicalUrl = language === "en"
    ? (entry.canonical_url_en || entry.canonical_url_uk || undefined)
    : (entry.canonical_url_uk || entry.canonical_url_en || undefined);

  return (
    <PageLayout>
      <SEO
        title={`${loc.title} — Ресурси — Magnifique numérique`}
        description={loc.description || blocksToPlainText(loc.blocks).slice(0, 155)}
        path={`/resource/${entry.id}`}
        image={entry.image_url ?? undefined}
        type="article"
        canonicalUrl={canonicalUrl}
      />

      <article className="max-w-4xl mx-auto pb-12">
        {/* Top Bar: Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="-ml-2 text-muted-foreground hover:text-black inline-flex items-center"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>

        {/* Header: Solid dark tag pills */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700/60 px-3.5 py-1 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Hero Section: Large title and description */}
        <header className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-foreground">
            {loc.title}
          </h1>
          {loc.description && (
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {loc.description}
            </p>
          )}
        </header>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {entry.external_url && (
            <Button
              asChild
              className="bg-[#5DA7DB] hover:bg-[#4b96cb] text-black font-semibold shadow-sm transition-colors"
            >
              <a href={entry.external_url} target="_blank" rel="noopener noreferrer">
                Спробувати
              </a>
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={handleLike}
            aria-pressed={liked}
            aria-label="Вподобати"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 font-medium"
          >
            <Heart
              className={`w-4 h-4 mr-2 transition-colors ${
                liked ? "fill-red-500 text-red-500" : ""
              }`}
              aria-hidden="true"
            />
            {likes}
          </Button>

          <Button
            variant="secondary"
            onClick={() => shareEntry(entry.id, loc.title, `/resource/${entry.id}`)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 font-medium"
          >
            <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
            Поділитися
          </Button>
        </div>

        {/* Media: Large full-width rounded cover image + source link */}
        <figure className="mb-10">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-zinc-900 border border-border flex items-center justify-center">
            {entry.image_url ? (
              <img
                src={entry.image_url}
                alt={loc.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-12 h-12 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          {entry.image_source_url && (
            <figcaption className="mt-2.5 pl-1">
              <a
                href={entry.image_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
              >
                Джерело зображення
              </a>
            </figcaption>
          )}
        </figure>

        {/* Content: Block-rendered content (headers, paragraphs, lists) */}
        <div className="prose prose-invert max-w-none">
          <BlockRenderer blocks={loc.blocks} />
        </div>
      </article>
    </PageLayout>
  );
};

export default ResourceDetail;
