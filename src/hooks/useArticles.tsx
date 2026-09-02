import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logAnalyticsEvent } from '@/lib/analytics';

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
  original_source_url: string | null;
  canonical_url_uk?: string | null;
  canonical_url_en?: string | null;
  show_test_button?: boolean | null;
  showTestButton?: boolean | null;
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

// Validate UUID helper for schema integrity
const isValidUUID = (str?: string | null): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
};

/**
 * Ensures payload strictly adheres to PostgreSQL public.articles schema columns.
 * Filters out deprecated/non-existent frontend fields (canonical_url_uk/en, original_source_url, show_test_button)
 * and verifies all NOT NULL constraints and correct column types.
 */
export const sanitizeArticlePayload = (article: Partial<Article>): Record<string, any> => {
  const allowedColumns = [
    'title',
    'description',
    'content',
    'title_uk',
    'title_en',
    'description_uk',
    'description_en',
    'content_uk',
    'content_en',
    'image_url',
    'category_id',
    'reads',
    'likes',
    'impressions',
    'share_count',
    'published',
    'tags',
    'embedding',
  ];

  const payload: Record<string, any> = {};
  for (const col of allowedColumns) {
    if (col in article && (article as any)[col] !== undefined) {
      payload[col] = (article as any)[col];
    }
  }

  // Ensure NOT NULL fields have valid values
  const titleUk = typeof payload.title_uk === 'string' ? payload.title_uk.trim() : '';
  const titleEn = typeof payload.title_en === 'string' ? payload.title_en.trim() : '';
  const titleFallback = typeof payload.title === 'string' ? payload.title.trim() : '';
  payload.title = titleUk || titleFallback || titleEn || 'Без назви';

  const descUk = typeof payload.description_uk === 'string' ? payload.description_uk.trim() : '';
  const descEn = typeof payload.description_en === 'string' ? payload.description_en.trim() : '';
  const descFallback = typeof payload.description === 'string' ? payload.description.trim() : '';
  payload.description = descUk || descFallback || descEn || '';

  const contentUk = typeof payload.content_uk === 'string' ? payload.content_uk : '';
  const contentEn = typeof payload.content_en === 'string' ? payload.content_en : '';
  const contentFallback = typeof payload.content === 'string' ? payload.content : '';
  payload.content = contentUk || contentFallback || contentEn || '';

  // Per-language nullable fields
  payload.title_uk = titleUk || payload.title;
  payload.description_uk = descUk || payload.description;
  payload.content_uk = contentUk || payload.content;
  payload.title_en = titleEn || null;
  payload.description_en = descEn || null;
  payload.content_en = contentEn || null;

  // Image URL NOT NULL constraint
  if (!payload.image_url || typeof payload.image_url !== 'string' || !payload.image_url.trim()) {
    payload.image_url = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop';
  }

  // Category ID must be valid UUID or null (never empty string)
  if (payload.category_id !== undefined) {
    payload.category_id = isValidUUID(payload.category_id) ? payload.category_id : null;
  }

  // Default numeric & array columns
  payload.reads = typeof payload.reads === 'number' && !isNaN(payload.reads) ? Math.max(0, Math.floor(payload.reads)) : 0;
  payload.likes = typeof payload.likes === 'number' && !isNaN(payload.likes) ? Math.max(0, Math.floor(payload.likes)) : 0;
  payload.impressions = typeof payload.impressions === 'number' && !isNaN(payload.impressions) ? Math.max(0, Math.floor(payload.impressions)) : 0;
  payload.share_count = typeof payload.share_count === 'number' && !isNaN(payload.share_count) ? Math.max(0, Math.floor(payload.share_count)) : 0;
  payload.published = Boolean(payload.published);
  payload.tags = Array.isArray(payload.tags) ? payload.tags.filter((t) => typeof t === 'string' && t.trim().length > 0) : [];

  return payload;
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (article: Omit<Article, 'id' | 'created_at' | 'updated_at'>) => {
      const sanitized = sanitizeArticlePayload(article);
      console.log('[useCreateArticle] Submitting payload to Supabase articles table:', sanitized);

      const { data, error } = await supabase
        .from('articles')
        .insert(sanitized as any)
        .select()
        .single();

      if (error) {
        console.error('[useCreateArticle] Supabase insert error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          errorObject: error,
          attemptedPayload: sanitized,
        });
        throw new Error(error.message || `Помилка збереження статті (${error.code || '400'})`);
      }

      console.log('[useCreateArticle] Successfully created article:', data);
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
      const sanitized = sanitizeArticlePayload(article);
      console.log('[useUpdateArticle] Submitting payload to Supabase articles table for ID', id, ':', sanitized);

      const { data, error } = await supabase
        .from('articles')
        .update(sanitized as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[useUpdateArticle] Supabase update error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          errorObject: error,
          attemptedPayload: sanitized,
        });
        throw new Error(error.message || `Помилка оновлення статті (${error.code || '400'})`);
      }

      console.log('[useUpdateArticle] Successfully updated article:', data);
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
      console.log('[useDeleteArticle] Deleting article with ID:', id);
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) {
        console.error('[useDeleteArticle] Supabase delete error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          errorObject: error,
        });
        throw new Error(error.message || `Помилка видалення статті (${error.code})`);
      }
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
      logAnalyticsEvent("view", "articles", articleId, { viewer_id: viewerId });
      const { error } = await supabase.rpc('track_article_view', { 
        p_article_id: articleId,
        p_viewer_id: viewerId
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-24h'] });
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
      if (isLiking) {
        logAnalyticsEvent("like", "articles", articleId);
      }
      const { error } = await supabase.rpc('toggle_article_like_anonymous', { 
        p_article_id: articleId,
        p_is_liking: isLiking
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-24h'] });
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
