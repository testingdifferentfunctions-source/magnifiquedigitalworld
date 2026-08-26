import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { parseBlocks, type ContentBlock } from "@/lib/blocks";
import type { Lang } from "@/lib/localize";
import { getFallbackEntries, getFallbackEntryById } from "@/data/modeItems";
import type { AppMode } from "@/hooks/useMode";
import type { Article } from "@/hooks/useArticles";
import { generateEntryEmbedding } from "@/lib/semanticSearch";

export type ModeEntryType = "news" | "resource" | "component" | "template" | "palette" | "dictionary" | "design";

export interface ModeEntry {
  id: string;
  type: ModeEntryType;
  slug: string | null;
  title_uk: string;
  title_en: string | null;
  description_uk: string;
  description_en: string | null;
  blocks_uk: ContentBlock[];
  blocks_en: ContentBlock[];
  tags: string[];
  image_url: string | null;
  image_source_url: string | null;
  external_url: string | null;
  likes: number;
  share_count: number;
  published: boolean;
  sort_order?: number;
  canonical_url_uk?: string | null;
  canonical_url_en?: string | null;
  created_at: string;
  updated_at: string;
}

export type ModeEntryInput = Omit<
  ModeEntry,
  "id" | "created_at" | "updated_at" | "likes" | "share_count"
>;

const mapRow = (row: any): ModeEntry => ({
  ...row,
  blocks_uk: parseBlocks(row.blocks_uk),
  blocks_en: parseBlocks(row.blocks_en),
  tags: row.tags ?? [],
});

/** Localized view of an entry, falling back to Ukrainian. */
export const localizeEntry = (entry: ModeEntry, language: Lang) => {
  const pick = (en: string | null | undefined, uk: string) =>
    language === "en" ? en?.trim() || uk : uk;
  const blocks =
    language === "en" && entry.blocks_en && entry.blocks_en.length > 0 ? entry.blocks_en : entry.blocks_uk;

  return {
    title: pick(entry.title_en, entry.title_uk),
    description: pick(entry.description_en, entry.description_uk),
    blocks: blocks || [],
  };
};

export const useModeEntries = (type: ModeEntryType, publishedOnly = true) =>
  useQuery({
    queryKey: ["mode-entries", type, publishedOnly],
    queryFn: async () => {
      try {
        let query = supabase.from("mode_entries").select("*").eq("type", type);
        if (publishedOnly) query = query.eq("published", true);
        const { data, error } = await query
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return (data ?? []).map(mapRow);
        }
      } catch (err) {
        console.warn("Failed to fetch mode entries from Supabase, using fallback:", err);
      }
      return getFallbackEntries(type);
    },
  });

export const useAllModeEntries = (publishedOnly = false) =>
  useQuery({
    queryKey: ["mode-entries", "all", publishedOnly],
    queryFn: async () => {
      try {
        let query = supabase.from("mode_entries").select("*");
        if (publishedOnly) query = query.eq("published", true);
        const { data, error } = await query.order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return (data ?? []).map(mapRow);
        }
      } catch (err) {
        console.warn("Failed to fetch all mode entries from Supabase:", err);
      }
      return [
        ...getFallbackEntries("news"),
        ...getFallbackEntries("resource"),
        ...getFallbackEntries("component"),
        ...getFallbackEntries("template"),
        ...getFallbackEntries("palette"),
        ...getFallbackEntries("dictionary"),
        ...getFallbackEntries("design"),
      ];
    },
  });

export const useModeEntry = (id: string) =>
  useQuery({
    queryKey: ["mode-entry", id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("mode_entries")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (!error && data) return mapRow(data);
      } catch (err) {
        console.warn("Failed to fetch mode entry from Supabase, using fallback:", err);
      }
      return getFallbackEntryById(id);
    },
    enabled: !!id,
  });

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["mode-entries"] });
  queryClient.invalidateQueries({ queryKey: ["mode-entry"] });
};

export const useCreateModeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: ModeEntryInput) => {
      const embedding = generateEntryEmbedding({
        title_uk: entry.title_uk,
        title_en: entry.title_en,
        description_uk: entry.description_uk,
        description_en: entry.description_en,
        tags: entry.tags,
        blocks_uk: entry.blocks_uk,
        blocks_en: entry.blocks_en,
      });

      const { data, error } = await supabase
        .from("mode_entries")
        .insert({
          ...entry,
          embedding: embedding as any,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return mapRow(data);
    },
    onSuccess: () => invalidate(queryClient),
  });
};

export const useUpdateModeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...entry }: Partial<ModeEntryInput> & { id: string }) => {
      const payload: Record<string, any> = { ...entry };

      // Re-generate vector embedding if title, description, tags or blocks are being updated
      if (
        entry.title_uk !== undefined ||
        entry.description_uk !== undefined ||
        entry.tags !== undefined ||
        entry.blocks_uk !== undefined
      ) {
        payload.embedding = generateEntryEmbedding({
          title_uk: entry.title_uk || "",
          title_en: entry.title_en,
          description_uk: entry.description_uk || "",
          description_en: entry.description_en,
          tags: entry.tags,
          blocks_uk: entry.blocks_uk,
          blocks_en: entry.blocks_en,
        });
      }

      const { data, error } = await supabase
        .from("mode_entries")
        .update(payload as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return mapRow(data);
    },
    onSuccess: () => invalidate(queryClient),
  });
};

export const useDeleteModeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mode_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(queryClient),
  });
};

/** Anonymous like toggle (mirrors the article like flow, localStorage-backed). */
export const useToggleModeEntryLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entryId, isLiking }: { entryId: string; isLiking: boolean }) => {
      const { error } = await supabase.rpc("toggle_mode_entry_like", {
        p_entry_id: entryId,
        p_is_liking: isLiking,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => invalidate(queryClient),
  });
};

export const incrementModeEntryShares = async (entryId: string) => {
  try {
    const { error } = await supabase.rpc("increment_mode_entry_shares", {
      p_entry_id: entryId,
    } as any);
    if (error) throw error;
  } catch (err) {
    console.error("Failed to increment entry share count:", err);
  }
};

/**
 * Universal hook to fetch most popular entries strictly based on activeMode.
 * Uses exact dynamic table and ordering (reads/views for articles, share_count/likes for mode entries).
 */
export const usePopularEntriesByMode = (mode: AppMode | string, limit = 10) => {
  return useQuery({
    queryKey: ["popular-entries", mode, limit],
    queryFn: async () => {
      let normalized = (mode || "articles").toLowerCase();
      if (normalized === "editor" || normalized === "редактор") {
        normalized = "articles";
      }
      if (normalized === "articles" || normalized === "article") {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("published", true)
          .order("reads", { ascending: false })
          .limit(limit);
        if (error) {
          console.warn("Failed to fetch popular articles:", error);
          return [];
        }
        return (data || []) as Article[];
      }

      let type: ModeEntryType = "news";
      if (normalized === "resources" || normalized === "resource") type = "resource";
      else if (normalized === "components" || normalized === "component") type = "component";
      else if (
        normalized === "templates" ||
        normalized === "template" ||
        normalized === "snippets" ||
        normalized === "snippet"
      )
        type = "template";
      else if (normalized === "palettes" || normalized === "palette") type = "palette";
      else if (normalized === "dictionary" || normalized === "terms") type = "dictionary";
      else if (normalized === "design" || normalized === "дизайн") type = "design";
      else if (normalized === "news") type = "news";

      try {
        const { data, error } = await supabase
          .from("mode_entries")
          .select("*")
          .eq("type", type)
          .eq("published", true)
          .order("share_count", { ascending: false })
          .order("likes", { ascending: false })
          .limit(limit);

        if (!error && data && data.length > 0) {
          return (data ?? []).map(mapRow);
        }
      } catch (err) {
        console.warn("Failed to fetch popular mode entries from Supabase, using fallback:", err);
      }

      const fallbacks = getFallbackEntries(type);
      return [...fallbacks]
        .sort((a, b) => ((b.share_count || 0) + (b.likes || 0)) - ((a.share_count || 0) + (a.likes || 0)))
        .slice(0, limit);
    },
  });
};

/**
 * Universal hook to fetch most liked entries strictly based on activeMode.
 * Uses exact dynamic table and ordering (likes descending).
 */
export const useLikedEntriesByMode = (mode: AppMode | string, limit = 10) => {
  return useQuery({
    queryKey: ["liked-entries", mode, limit],
    queryFn: async () => {
      let normalized = (mode || "articles").toLowerCase();
      if (normalized === "editor" || normalized === "редактор") {
        normalized = "articles";
      }
      if (normalized === "articles" || normalized === "article") {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("published", true)
          .order("likes", { ascending: false })
          .limit(limit);
        if (error) {
          console.warn("Failed to fetch liked articles:", error);
          return [];
        }
        return (data || []) as Article[];
      }

      let type: ModeEntryType = "news";
      if (normalized === "resources" || normalized === "resource") type = "resource";
      else if (normalized === "components" || normalized === "component") type = "component";
      else if (
        normalized === "templates" ||
        normalized === "template" ||
        normalized === "snippets" ||
        normalized === "snippet"
      )
        type = "template";
      else if (normalized === "palettes" || normalized === "palette") type = "palette";
      else if (normalized === "dictionary" || normalized === "terms") type = "dictionary";
      else if (normalized === "design" || normalized === "дизайн") type = "design";
      else if (normalized === "news") type = "news";

      try {
        const { data, error } = await supabase
          .from("mode_entries")
          .select("*")
          .eq("type", type)
          .eq("published", true)
          .order("likes", { ascending: false })
          .limit(limit);

        if (!error && data && data.length > 0) {
          return (data ?? []).map(mapRow);
        }
      } catch (err) {
        console.warn("Failed to fetch liked mode entries from Supabase, using fallback:", err);
      }

      const fallbacks = getFallbackEntries(type);
      return [...fallbacks].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, limit);
    },
  });
};
