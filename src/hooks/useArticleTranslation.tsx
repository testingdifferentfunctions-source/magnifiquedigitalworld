import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from './useLanguage';

interface ArticleTranslation {
  title: string;
  description: string;
  content: string;
}

export const useArticleTranslation = (articleId: string) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['article-translation', articleId, language],
    queryFn: async (): Promise<ArticleTranslation | null> => {
      if (language === 'uk') return null;

      // Check cache first
      const { data: cached } = await supabase
        .from('article_translations')
        .select('title, description, content')
        .eq('article_id', articleId)
        .eq('language', language)
        .maybeSingle();

      if (cached) return cached;

      // Request translation from edge function
      const { data, error } = await supabase.functions.invoke('translate-article', {
        body: { articleId, language },
      });

      if (error) throw error;
      return data as ArticleTranslation;
    },
    enabled: !!articleId && language !== 'uk',
    staleTime: Infinity, // Translations don't change
    retry: 1,
  });
};

export const useArticlesTranslations = (articleIds: string[]) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['articles-translations', articleIds.sort().join(','), language],
    queryFn: async () => {
      if (language === 'uk') return {};

      // Fetch cached translations
      const { data } = await supabase
        .from('article_translations')
        .select('article_id, title, description')
        .eq('language', language)
        .in('article_id', articleIds);

      const map: Record<string, { title: string; description: string }> = {};
      data?.forEach((t) => {
        map[t.article_id] = { title: t.title, description: t.description };
      });

      // Find articles without cached translations and translate them
      const missingIds = articleIds.filter((id) => !map[id]);
      if (missingIds.length > 0) {
        await Promise.allSettled(
          missingIds.map(async (articleId) => {
            const { data: result, error } = await supabase.functions.invoke('translate-article', {
              body: { articleId, language },
            });
            if (!error && result) {
              map[articleId] = { title: result.title, description: result.description };
            }
          })
        );
      }

      // Only cache forever if all articles are translated
      // Otherwise, allow retry on next render
      if (missingIds.length > 0 && Object.keys(map).length < articleIds.length) {
        throw new Error('Some translations failed');
      }

      return map;
    },
    enabled: articleIds.length > 0 && language !== 'uk',
    staleTime: Infinity,
    retry: 2,
    retryDelay: 1000,
  });
};
