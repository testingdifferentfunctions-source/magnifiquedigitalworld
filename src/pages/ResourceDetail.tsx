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
        <p className="text-muted-foreground py-12 text-center">Завантаження...</p>
      </PageLayout>
    );
  }

  if (!entry) {
    return (
      <PageLayout>
        <div className="py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold">Ресурс не знайдено</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад до директорії
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

  return (
    <PageLayout>
      <SEO
        title={`${loc.title} — Magnifique numérique`}
        description={loc.description || blocksToPlainText(loc.blocks).slice(0, 155)}
        path={`/resource/${entry.id}`}
        image={entry.image_url ?? undefined}
        type="article"
      />

      <article className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-8 -ml-2" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад до директорії
        </Button>

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-3">{loc.title}</h1>
          {loc.description && (
            <p className="text-lg text-muted-foreground leading-relaxed">{loc.description}</p>
          )}
        </header>

        <div className="flex flex-wrap items-center gap-3 mb-10">
          {entry.external_url && (
            <Button asChild>
              <a href={entry.external_url} target="_blank" rel="noopener noreferrer">
                Спробувати
                <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
              </a>
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={handleLike}
            aria-pressed={liked}
            aria-label="Вподобати"
          >
            <Heart
              className={`w-4 h-4 mr-2 ${liked ? "fill-primary text-primary" : ""}`}
              aria-hidden="true"
            />
            {likes}
          </Button>
          <Button
            variant="secondary"
            onClick={() => shareEntry(entry.id, loc.title, `/resource/${entry.id}`)}
          >
            <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
            Поділитися
          </Button>
        </div>

        <figure className="mb-10">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted flex items-center justify-center">
            {entry.image_url ? (
              <img
                src={entry.image_url}
                alt={loc.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          {entry.image_source_url && (
            <figcaption className="mt-2">
              <a
                href={entry.image_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground underline hover:text-primary"
              >
                Джерело зображення
              </a>
            </figcaption>
          )}
        </figure>

        <BlockRenderer blocks={loc.blocks} />
      </article>
    </PageLayout>
  );
};

export default ResourceDetail;
