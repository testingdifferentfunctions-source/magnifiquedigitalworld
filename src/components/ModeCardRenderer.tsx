import { useNavigate } from "react-router-dom";
import ArticleCard from "@/components/ArticleCard";
import ResourceCard, { ResourceItem } from "@/components/ResourceCard";
import ComponentCard, { ComponentItem } from "@/components/ComponentCard";
import NewsCard from "@/components/NewsCard";
import PaletteCard from "@/components/PaletteCard";
import SnippetCard from "@/components/SnippetCard";
import DictionaryCard from "@/components/DictionaryCard";
import DesignCard from "@/components/DesignCard";
import ResearchCard from "@/components/ResearchCard";
import { localizeArticle } from "@/lib/localize";
import { localizeEntry, useToggleModeEntryLike } from "@/hooks/useModeEntries";
import { shareEntry, getLikedEntries, setEntryLiked } from "@/lib/shareEntry";
import type { AppMode } from "@/hooks/useMode";
import type { Lang } from "@/lib/localize";

interface ModeCardRendererProps {
  item: any;
  index: number;
  mode: AppMode | string;
  language: Lang;
}

export const ModeCardRenderer = ({
  item,
  index,
  mode,
  language,
}: ModeCardRendererProps) => {
  const navigate = useNavigate();
  const toggleLike = useToggleModeEntryLike();

  const normalizedMode = (mode || "articles").toLowerCase();

  switch (normalizedMode) {
    case "articles":
    case "article": {
      const loc = localizeArticle(item, language);
      return (
        <ArticleCard
          key={item.id}
          article={{
            id: item.id,
            title: loc.title,
            description: loc.description,
            image: item.image_url || item.image || "",
            likes: item.likes || 0,
            reads: item.reads || 0,
            category: item.category_id || "",
          }}
          index={index}
        />
      );
    }

    case "resources":
    case "resource": {
      const loc = item.blocks_uk
        ? localizeEntry(item, language)
        : { title: item.title || "", description: item.description || "" };
      const resItem: ResourceItem = {
        id: item.id,
        title: loc.title,
        description: loc.description,
        image: item.image_url ?? undefined,
        likes: item.likes || 0,
        url: item.external_url ?? undefined,
      };
      return (
        <ResourceCard
          key={item.id}
          item={resItem}
          index={index}
          onDetails={() => navigate(`/resource/${item.id}`)}
          onTry={() => {
            if (item.external_url) {
              window.open(item.external_url, "_blank", "noopener,noreferrer");
            }
          }}
          onLike={() => {
            toggleLike.mutate({ entryId: item.id, isLiking: true });
          }}
          onShare={() => {
            shareEntry(item.id, loc.title, `/resource/${item.id}`);
          }}
        />
      );
    }

    case "templates":
    case "template":
    case "snippets":
    case "snippet": {
      const loc = item.blocks_uk
        ? localizeEntry(item, language)
        : { title: item.title || "", description: item.description || "", blocks: [] };
      const codeBlock = (loc.blocks || []).find((b: any) => b.type === "code") as
        | { code: string; language?: string }
        | undefined;
      return (
        <SnippetCard
          key={item.id}
          item={{
            id: item.id,
            title: loc.title,
            description: loc.description,
            code: codeBlock?.code,
            language: codeBlock?.language,
            tags: item.tags || [],
            likes: item.likes || 0,
            url: item.external_url,
          }}
          index={index}
          isLiked={getLikedEntries().includes(item.id)}
          onView={() => navigate(`/template/${item.id}`)}
          onLike={() => {
            const currentlyLiked = getLikedEntries().includes(item.id);
            setEntryLiked(item.id, !currentlyLiked);
            toggleLike.mutate({ entryId: item.id, isLiking: !currentlyLiked });
          }}
          onShare={() => shareEntry(item.id, loc.title, `/template/${item.id}`)}
        />
      );
    }

    case "components":
    case "component": {
      const loc = item.blocks_uk
        ? localizeEntry(item, language)
        : { title: item.title || "", description: item.description || "" };
      const compItem: ComponentItem = {
        id: item.id,
        title: loc.title,
        description: loc.description,
        url: item.external_url ?? undefined,
        likes: item.likes || 0,
        tags: item.tags || [],
      };
      return (
        <ComponentCard
          key={item.id}
          item={compItem}
          index={index}
          isLiked={getLikedEntries().includes(item.id)}
          onView={() => navigate(`/component/${item.id}`)}
          onLike={() => {
            const currentlyLiked = getLikedEntries().includes(item.id);
            setEntryLiked(item.id, !currentlyLiked);
            toggleLike.mutate({ entryId: item.id, isLiking: !currentlyLiked });
          }}
          onShare={() => shareEntry(item.id, loc.title, `/component/${item.id}`)}
        />
      );
    }

    case "news": {
      const loc = item.blocks_uk
        ? localizeEntry(item, language)
        : { title: item.title || "", description: item.description || "" };
      return (
        <NewsCard
          key={item.id}
          item={{
            id: item.id,
            title: loc.title,
            description: loc.description,
            image: item.image_url,
            likes: item.likes || 0,
            url: item.external_url,
            tags: item.tags || [],
          }}
          index={index}
          onRead={() => navigate(`/news/${item.id}`)}
          onLike={() => toggleLike.mutate({ entryId: item.id, isLiking: true })}
          onShare={() => shareEntry(item.id, loc.title, `/news/${item.id}`)}
        />
      );
    }

    case "research":
    case "researches":
    case "studies": {
      const loc = item.blocks_uk
        ? localizeEntry(item, language)
        : { title: item.title || "", description: item.description || "" };
      const currentlyLiked = getLikedEntries().includes(item.id);
      return (
        <ResearchCard
          key={item.id}
          item={{
            id: item.id,
            title: loc.title,
            description: loc.description,
            image: item.image_url,
            likes: item.likes || 0,
            url: item.external_url,
            tags: item.tags || [],
          }}
          index={index}
          isLiked={currentlyLiked}
          onRead={() => navigate(`/research/${item.id}`)}
          onLike={() => {
            const nextLiked = !currentlyLiked;
            setEntryLiked(item.id, nextLiked);
            toggleLike.mutate({ entryId: item.id, isLiking: nextLiked });
          }}
          onShare={() => shareEntry(item.id, loc.title, `/research/${item.id}`)}
        />
      );
    }

    case "palettes":
    case "palette": {
      const loc = item.blocks_uk
        ? localizeEntry(item, language)
        : { title: item.title || "", description: item.description || "" };
      return (
        <PaletteCard
          key={item.id}
          item={{
            id: item.id,
            title: loc.title,
            description: loc.description,
            image: item.image_url,
            likes: item.likes || 0,
            url: item.external_url,
            tags: item.tags || [],
          }}
          index={index}
          isLiked={getLikedEntries().includes(item.id)}
          onColors={() => navigate(`/palette/${item.id}`)}
          onView={() => {
            if (item.external_url) {
              window.open(item.external_url, "_blank", "noopener,noreferrer");
            }
          }}
          onLike={() => {
            const currentlyLiked = getLikedEntries().includes(item.id);
            setEntryLiked(item.id, !currentlyLiked);
            toggleLike.mutate({ entryId: item.id, isLiking: !currentlyLiked });
          }}
          onShare={() => shareEntry(item.id, loc.title, `/palette/${item.id}`)}
        />
      );
    }

    case "dictionary":
    case "словник":
    case "terms": {
      const loc = item.blocks_uk
        ? localizeEntry(item, language)
        : { title: item.title || "", description: item.description || "" };
      return (
        <DictionaryCard
          key={item.id}
          item={{
            id: item.id,
            title: loc.title,
            description: loc.description,
            likes: item.likes || 0,
            tags: item.tags || [],
            url: item.external_url,
          }}
          index={index}
          isLiked={getLikedEntries().includes(item.id)}
          onRead={() => navigate(`/dictionary/${item.id}`)}
          onLike={() => {
            const currentlyLiked = getLikedEntries().includes(item.id);
            setEntryLiked(item.id, !currentlyLiked);
            toggleLike.mutate({ entryId: item.id, isLiking: !currentlyLiked });
          }}
          onShare={() => shareEntry(item.id, loc.title, `/dictionary/${item.id}`)}
        />
      );
    }

    case "design":
    case "дизайн": {
      const loc = item.blocks_uk
        ? localizeEntry(item, language)
        : { title: item.title || "", description: item.description || "", blocks: [] };
      return (
        <DesignCard
          key={item.id}
          item={{
            id: item.id,
            title: loc.title,
            description: loc.description,
            likes: item.likes || 0,
            tags: item.tags || [],
            url: item.external_url,
            blocks: loc.blocks,
          }}
          index={index}
          isLiked={getLikedEntries().includes(item.id)}
          onView={() => navigate(`/design/${item.id}`)}
          onLike={() => {
            const currentlyLiked = getLikedEntries().includes(item.id);
            setEntryLiked(item.id, !currentlyLiked);
            toggleLike.mutate({ entryId: item.id, isLiking: !currentlyLiked });
          }}
          onShare={() => shareEntry(item.id, loc.title, `/design/${item.id}`)}
        />
      );
    }

    default: {
      const loc = localizeArticle(item, language);
      return (
        <ArticleCard
          key={item.id}
          article={{
            id: item.id,
            title: loc.title,
            description: loc.description,
            image: item.image_url || item.image || "",
            likes: item.likes || 0,
            reads: item.reads || 0,
            category: item.category_id || "",
          }}
          index={index}
        />
      );
    }
  }
};

export default ModeCardRenderer;
