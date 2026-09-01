import { supabase } from "@/integrations/supabase/client";

export type AnalyticsEventType = "view" | "like" | "share";

const LOCAL_EVENT_STORAGE_KEY = "local_analytics_events_24h";

export interface StoredAnalyticsEvent {
  id?: string;
  event_type: AnalyticsEventType;
  mode: string;
  target_id: string;
  viewer_id?: string | null;
  created_at: string;
}

/** Get or initialize anonymous persistent viewer id */
export const getViewerId = (): string => {
  try {
    let viewerId = localStorage.getItem("viewer_id");
    if (!viewerId) {
      viewerId = crypto.randomUUID();
      localStorage.setItem("viewer_id", viewerId);
    }
    return viewerId;
  } catch {
    return "anonymous_viewer";
  }
};

/** Log local fallback event for seamless local stats */
const saveLocalAnalyticsEvent = (event: StoredAnalyticsEvent) => {
  try {
    const raw = localStorage.getItem(LOCAL_EVENT_STORAGE_KEY);
    const events: StoredAnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    
    // Filter out events older than 24h to keep localStorage light
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const filtered = events.filter((e) => new Date(e.created_at).getTime() >= cutoff);
    
    filtered.push(event);
    localStorage.setItem(LOCAL_EVENT_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore localStorage errors
  }
};

/** Get local analytics events in the last 24h */
export const getLocalAnalytics24h = (): {
  views_24h: number;
  likes_24h: number;
  shares_24h: number;
} => {
  try {
    const raw = localStorage.getItem(LOCAL_EVENT_STORAGE_KEY);
    const events: StoredAnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const valid = events.filter((e) => new Date(e.created_at).getTime() >= cutoff);

    let views = 0;
    let likes = 0;
    let shares = 0;

    for (const ev of valid) {
      if (ev.event_type === "view") views++;
      else if (ev.event_type === "like") likes++;
      else if (ev.event_type === "share") shares++;
    }

    return {
      views_24h: views,
      likes_24h: likes,
      shares_24h: shares,
    };
  } catch {
    return { views_24h: 0, likes_24h: 0, shares_24h: 0 };
  }
};

/**
 * Universal function to log view, like, or share event to Supabase & local cache.
 */
export const logAnalyticsEvent = async (
  eventType: AnalyticsEventType,
  mode: string,
  targetId: string,
  metadata: Record<string, any> = {}
) => {
  const viewerId = getViewerId();
  const now = new Date().toISOString();

  // Save to local cache first for instant feedback & resilience
  saveLocalAnalyticsEvent({
    event_type: eventType,
    mode,
    target_id: targetId,
    viewer_id: viewerId,
    created_at: now,
  });

  try {
    // 1. Try dedicated RPC
    const { error: rpcError } = await supabase.rpc("log_analytics_event", {
      p_event_type: eventType,
      p_mode: mode,
      p_target_id: targetId,
      p_viewer_id: viewerId,
      p_metadata: metadata,
    });

    if (rpcError) {
      // 2. Fallback to direct table insert
      const { error: insertError } = await supabase.from("analytics_events").insert({
        event_type: eventType,
        mode,
        target_id: targetId,
        viewer_id: viewerId,
        metadata,
        created_at: now,
      });

      if (insertError) {
        console.warn("Could not persist analytics event to Supabase:", insertError.message);
      }
    }
  } catch (err) {
    console.warn("Analytics event logging skipped:", err);
  }
};
