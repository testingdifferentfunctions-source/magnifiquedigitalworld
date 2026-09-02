import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { parseBlocks, type ContentBlock } from "@/lib/blocks";
import type { Lang } from "@/lib/localize";
import { getFallbackEntries, getFallbackEntryById } from "@/data/modeItems";
import type { AppMode } from "@/hooks/useMode";
import type { Article } from "@/hooks/useArticles";
import { generateEntryEmbedding } from "@/lib/semanticSearch";
import { logAnalyticsEvent } from "@/lib/analytics";

export type ModeEntryType = "news" | "resource" | "component" | "template" | "palette" | "dictionary" | "design" | "research";

export interface SourceItem {
  id?: string;
  title: string;
  url: string;
}

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
  sources?: SourceItem[] | null;
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

const mapRow = (row: any): ModeEntry => {
  let parsedSources: SourceItem[] = [];
  if (Array.isArray(row.sources)) {
    parsedSources = row.sources;
  } else if (typeof row.sources === "string" && row.sources.trim().length > 0) {
    try {
      parsedSources = JSON.parse(row.sources);
    } catch {
      parsedSources = [];
    }
  }

  return {
    ...row,
    blocks_uk: parseBlocks(row.blocks_uk),
    blocks_en: parseBlocks(row.blocks_en),
    tags: row.tags ?? [],
    sources: parsedSources,
  };
};

/** Localized view of an entry, falling back to Ukrainian. */
export const localizeEntry = (entry: ModeEntry, language: Lang) => {
  const pick = (en: string | null | undefined, uk: string) =>
    language === "en" ? en?.trim() || uk : uk;
  const blocks =
    language === "en" && entry.blocks_en && entry.blocks_en.length > 0 ? entry.blocks_en : entry.blocks_uk;

  const resolvedSources =
    entry.sources && entry.sources.length > 0
      ? entry.sources
      : entry.external_url
      ? [{ title: language === "en" ? "Primary Source" : "Офіційне джерело", url: entry.external_url }]
      : [];

  return {
    title: pick(entry.title_en, entry.title_uk),
    description: pick(entry.description_en, entry.description_uk),
    blocks: blocks || [],
    sources: resolvedSources,
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
        ...getFallbackEntries("research"),
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

// UUID validator helper
const isValidUUID = (str?: string | null): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
};

/**
 * Sanitizes mode entries payload ensuring it strictly matches PostgreSQL mode_entries columns.
 * Removes virtual fields like 'sources' that are not columns on public.mode_entries table.
 */
export const sanitizeModeEntryPayload = (entry: Record<string, any>): Record<string, any> => {
  const allowedColumns = [
    'type',
    'slug',
    'title_uk',
    'title_en',
    'description_uk',
    'description_en',
    'blocks_uk',
    'blocks_en',
    'tags',
    'image_url',
    'image_source_url',
    'external_url',
    'category_id',
    'published',
    'sort_order',
    'canonical_url_uk',
    'canonical_url_en',
    'embedding',
  ];

  const payload: Record<string, any> = {};
  for (const col of allowedColumns) {
    if (col in entry && entry[col] !== undefined) {
      payload[col] = entry[col];
    }
  }

  // Ensure title_uk & description_uk NOT NULL requirements
  if (payload.title_uk !== undefined) {
    payload.title_uk = typeof payload.title_uk === 'string' ? payload.title_uk.trim() : (payload.title_en || 'Без назви');
  }
  if (payload.description_uk !== undefined) {
    payload.description_uk = typeof payload.description_uk === 'string' ? payload.description_uk.trim() : '';
  }
  
  if (payload.title_en !== undefined) {
    payload.title_en = typeof payload.title_en === 'string' && payload.title_en.trim() ? payload.title_en.trim() : null;
  }
  if (payload.description_en !== undefined) {
    payload.description_en = typeof payload.description_en === 'string' && payload.description_en.trim() ? payload.description_en.trim() : null;
  }
  if (payload.slug !== undefined) {
    payload.slug = typeof payload.slug === 'string' && payload.slug.trim() ? payload.slug.trim() : null;
  }

  // Category ID must be valid UUID or null
  if (payload.category_id !== undefined) {
    payload.category_id = isValidUUID(payload.category_id) ? payload.category_id : null;
  }

  if (payload.published !== undefined) {
    payload.published = Boolean(payload.published);
  }
  if (payload.tags !== undefined) {
    payload.tags = Array.isArray(payload.tags) ? payload.tags : [];
  }
  if (payload.blocks_uk !== undefined) {
    payload.blocks_uk = Array.isArray(payload.blocks_uk) ? payload.blocks_uk : [];
  }
  if (payload.blocks_en !== undefined) {
    payload.blocks_en = Array.isArray(payload.blocks_en) ? payload.blocks_en : [];
  }

  return payload;
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

      const sanitized = sanitizeModeEntryPayload({
        ...entry,
        embedding,
      });

      console.log('[useCreateModeEntry] Submitting payload to Supabase mode_entries:', sanitized);

      const { data, error } = await supabase
        .from("mode_entries")
        .insert(sanitized as any)
        .select()
        .single();

      if (error) {
        console.error('[useCreateModeEntry] Supabase insert error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          errorObject: error,
          attemptedPayload: sanitized,
        });
        throw new Error(error.message || `Помилка створення запису (${error.code || '400'})`);
      }

      console.log('[useCreateModeEntry] Successfully created mode entry:', data);
      return mapRow(data);
    },
    onSuccess: () => invalidate(queryClient),
  });
};

export const useUpdateModeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...entry }: Partial<ModeEntryInput> & { id: string }) => {
      const sanitized = sanitizeModeEntryPayload(entry);

      // Re-generate vector embedding if title, description, tags or blocks are being updated
      if (
        entry.title_uk !== undefined ||
        entry.description_uk !== undefined ||
        entry.tags !== undefined ||
        entry.blocks_uk !== undefined
      ) {
        sanitized.embedding = generateEntryEmbedding({
          title_uk: entry.title_uk || "",
          title_en: entry.title_en,
          description_uk: entry.description_uk || "",
          description_en: entry.description_en,
          tags: entry.tags,
          blocks_uk: entry.blocks_uk,
          blocks_en: entry.blocks_en,
        });
      }

      console.log('[useUpdateModeEntry] Submitting update to Supabase mode_entries for ID', id, ':', sanitized);

      const { data, error } = await supabase
        .from("mode_entries")
        .update(sanitized as any)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error('[useUpdateModeEntry] Supabase update error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          errorObject: error,
          attemptedPayload: sanitized,
        });
        throw new Error(error.message || `Помилка оновлення запису (${error.code || '400'})`);
      }

      console.log('[useUpdateModeEntry] Successfully updated mode entry:', data);
      return mapRow(data);
    },
    onSuccess: () => invalidate(queryClient),
  });
};

export const useDeleteModeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      console.log('[useDeleteModeEntry] Deleting mode entry with ID:', id);
      const { error } = await supabase.from("mode_entries").delete().eq("id", id);
      if (error) {
        console.error('[useDeleteModeEntry] Supabase delete error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          errorObject: error,
        });
        throw new Error(error.message || `Помилка видалення запису (${error.code})`);
      }
    },
    onSuccess: () => invalidate(queryClient),
  });
};

/** Anonymous like toggle (mirrors the article like flow, localStorage-backed). */
export const useToggleModeEntryLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entryId, isLiking, mode = "mode_entry" }: { entryId: string; isLiking: boolean; mode?: string }) => {
      if (isLiking) {
        logAnalyticsEvent("like", mode, entryId);
      }
      const { error } = await supabase.rpc("toggle_mode_entry_like", {
        p_entry_id: entryId,
        p_is_liking: isLiking,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate(queryClient);
      queryClient.invalidateQueries({ queryKey: ["analytics-24h"] });
    },
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
      if (normalized === "tools" || normalized === "editor" || normalized === "інструменти" || normalized === "редактор") {
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
      else if (normalized === "research" || normalized === "researches" || normalized === "дослідження")
        type = "research";
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
      if (normalized === "tools" || normalized === "editor" || normalized === "інструменти" || normalized === "редактор") {
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
      else if (normalized === "research" || normalized === "researches" || normalized === "дослідження")
        type = "research";
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
