import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from './useLanguage';

export const useCategoriesTranslations = (categoryIds: string[]) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['categories-translations', categoryIds.sort().join(','), language],
    queryFn: async () => {
      if (language === 'uk') return {};

      // Try cache first
      const { data: cached } = await supabase
        .from('category_translations')
        .select('category_id, name')
        .eq('language', language)
        .in('category_id', categoryIds);

      const map: Record<string, string> = {};
      cached?.forEach((t: any) => {
        map[t.category_id] = t.name;
      });

      // If all cached, return
      if (Object.keys(map).length === categoryIds.length) {
        return map;
      }

      // Request translation for all (edge function handles caching internally)
      const { data, error } = await supabase.functions.invoke('translate-article', {
        body: { type: 'categories', categoryIds, language },
      });

      if (error) throw error;
      return (data as Record<string, string>) || map;
    },
    enabled: categoryIds.length > 0 && language !== 'uk',
    staleTime: Infinity,
    retry: 2,
    retryDelay: 1000,
  });
};
