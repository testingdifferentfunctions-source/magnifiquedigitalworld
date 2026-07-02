import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useSocialLinks = () => {
  return useQuery({
    queryKey: ['social_links'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as SocialLink[];
    },
  });
};

export const useCreateSocialLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (link: { platform: string; url: string; sort_order?: number }) => {
      const { data, error } = await (supabase as any)
        .from('social_links')
        .insert(link)
        .select()
        .single();
      if (error) throw error;
      return data as SocialLink;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social_links'] }),
  });
};

export const useUpdateSocialLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<SocialLink> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('social_links')
        .update(rest)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as SocialLink;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social_links'] }),
  });
};

export const useDeleteSocialLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('social_links').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social_links'] }),
  });
};
