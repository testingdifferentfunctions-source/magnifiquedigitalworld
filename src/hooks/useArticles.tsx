import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  title_uk: string | null;
  title_en: string | null;
  description_uk: string | null;
  description_en: string | null;
  content_uk: string | null;
  content_en: string | null;
  image_url: string;
  category_id: string | null;
  reads: number;
  likes: number;
  impressions: number;
  share_count: number;
  published: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const useArticles = (publishedOnly = true) => {
  return useQuery({
    queryKey: ['articles', publishedOnly],
    queryFn: async () => {
      let query = supabase.from('articles').select('*');
      if (publishedOnly) {
        query = query.eq('published', true);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Article[];
    }
  });
};

export const useTopArticlesByReads = (limit = 10) => {
  return useQuery({
    queryKey: ['articles', 'top-reads', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('reads', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as Article[];
    }
  });
};

export const useTopArticlesByLikes = (limit = 10) => {
  return useQuery({
    queryKey: ['articles', 'top-likes', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('likes', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as Article[];
    }
  });
};

export const useArticle = (id: string) => {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Article | null;
    },
    enabled: !!id
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (article: Omit<Article, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('articles')
        .insert(article)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...article }: Partial<Article> & { id: string }) => {
      const { data, error } = await supabase
        .from('articles')
        .update(article)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });
};

// Track article view with unique viewer tracking
export const useTrackArticleView = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (articleId: string) => {
      let viewerId = localStorage.getItem('viewer_id');
      if (!viewerId) {
        viewerId = crypto.randomUUID();
        localStorage.setItem('viewer_id', viewerId);
      }
      const { error } = await supabase.rpc('track_article_view', { 
        p_article_id: articleId,
        p_viewer_id: viewerId
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });
};

// Increment impressions for articles shown in feed
export const useIncrementImpressions = () => {
  return useMutation({
    mutationFn: async (articleIds: string[]) => {
      if (articleIds.length === 0) return;
      const { error } = await supabase.rpc('increment_article_impressions', { 
        p_article_ids: articleIds 
      } as any);
      if (error) throw error;
    }
  });
};

// Anonymous like toggle (no auth required)
export const useToggleArticleLikeAnonymous = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId, isLiking }: { articleId: string; isLiking: boolean }) => {
      const { error } = await supabase.rpc('toggle_article_like_anonymous', { 
        p_article_id: articleId,
        p_is_liking: isLiking
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article'] });
    }
  });
};

// Get unique views count for an article (admin)
export const useArticleUniqueViews = (articleId: string) => {
  return useQuery({
    queryKey: ['article-unique-views', articleId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_article_unique_views', { 
        p_article_id: articleId 
      } as any);
      if (error) throw error;
      return (data as number) || 0;
    },
    enabled: !!articleId
  });
};

