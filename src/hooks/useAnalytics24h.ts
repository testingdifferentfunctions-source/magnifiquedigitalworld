import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getLocalAnalytics24h } from "@/lib/analytics";

export interface Analytics24hData {
  views_24h: number;
  likes_24h: number;
  shares_24h: number;
}

export const use24hAnalytics = () => {
  return useQuery<Analytics24hData>({
    queryKey: ["analytics-24h"],
    queryFn: async () => {
      const localStats = getLocalAnalytics24h();
      const last24hISO = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      try {
        // 1. Attempt to execute the dedicated RPC function
        const { data: rpcData, error: rpcError } = await supabase.rpc("get_24h_analytics");

        if (!rpcError && rpcData && rpcData.length > 0) {
          const row = rpcData[0];
          return {
            views_24h: Math.max(Number(row.views_24h || 0), localStats.views_24h),
            likes_24h: Math.max(Number(row.likes_24h || 0), localStats.likes_24h),
            shares_24h: Math.max(Number(row.shares_24h || 0), localStats.shares_24h),
          };
        }

        // 2. Fallback: Query analytics_events directly in the last 24h
        const [eventsRes, articleViewsRes, articleLikesRes] = await Promise.allSettled([
          supabase
            .from("analytics_events")
            .select("event_type")
            .gte("created_at", last24hISO),
          supabase
            .from("article_views")
            .select("id")
            .gte("created_at", last24hISO),
          supabase
            .from("user_article_likes")
            .select("article_id")
            .gte("created_at", last24hISO),
        ]);

        let views = 0;
        let likes = 0;
        let shares = 0;

        if (eventsRes.status === "fulfilled" && eventsRes.value.data) {
          for (const ev of eventsRes.value.data) {
            if (ev.event_type === "view") views++;
            else if (ev.event_type === "like") likes++;
            else if (ev.event_type === "share") shares++;
          }
        }

        if (articleViewsRes.status === "fulfilled" && articleViewsRes.value.data) {
          views += articleViewsRes.value.data.length;
        }

        if (articleLikesRes.status === "fulfilled" && articleLikesRes.value.data) {
          likes += articleLikesRes.value.data.length;
        }

        return {
          views_24h: Math.max(views, localStats.views_24h),
          likes_24h: Math.max(likes, localStats.likes_24h),
          shares_24h: Math.max(shares, localStats.shares_24h),
        };
      } catch (err) {
        console.warn("Falling back to local 24h analytics:", err);
        return localStats;
      }
    },
    refetchInterval: 30000, // Refresh every 30s for live statistics
    staleTime: 10000,
  });
};
