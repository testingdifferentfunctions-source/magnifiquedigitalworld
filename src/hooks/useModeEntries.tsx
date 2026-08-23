import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { parseBlocks, type ContentBlock } from "@/lib/blocks";
import type { Lang } from "@/lib/localize";

export type ModeEntryType = "resource" | "component" | "template";

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
  sort_order: number;
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
    language === "en" && entry.blocks_en.length > 0 ? entry.blocks_en : entry.blocks_uk;

  return {
    title: pick(entry.title_en, entry.title_uk),
    description: pick(entry.description_en, entry.description_uk),
    blocks,
  };
};

export const useModeEntries = (type: ModeEntryType, publishedOnly = true) =>
  useQuery({
    queryKey: ["mode-entries", type, publishedOnly],
    queryFn: async () => {
      let query = supabase.from("mode_entries").select("*").eq("type", type);
      if (publishedOnly) query = query.eq("published", true);
      const { data, error } = await query
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });

export const useAllModeEntries = (publishedOnly = false) =>
  useQuery({
    queryKey: ["mode-entries", "all", publishedOnly],
    queryFn: async () => {
      let query = supabase.from("mode_entries").select("*");
      if (publishedOnly) query = query.eq("published", true);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });

export const useModeEntry = (id: string) =>
  useQuery({
    queryKey: ["mode-entry", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mode_entries")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapRow(data) : null;
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
      const { data, error } = await supabase
        .from("mode_entries")
        .insert(entry as any)
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
      const { data, error } = await supabase
        .from("mode_entries")
        .update(entry as any)
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
