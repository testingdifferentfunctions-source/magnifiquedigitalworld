import { toast } from "sonner";
import { incrementModeEntryShares } from "@/hooks/useModeEntries";
import { logAnalyticsEvent } from "@/lib/analytics";

/** Share a Resource / Component / Template entry (Web Share API + clipboard fallback). */
export const shareEntry = async (entryId: string, title: string, path: string) => {
  const shareUrl = `${window.location.origin}${path}`;
  const mode = path.split("/")[1] || "mode_entry";

  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: shareUrl });
        logAnalyticsEvent("share", mode, entryId, { title, path });
        await incrementModeEntryShares(entryId);
        return true;
      } catch (err: any) {
        if (err?.name === "AbortError") return false;
      }
    }

    await navigator.clipboard.writeText(shareUrl);
    toast.success("Посилання скопійовано!");
    logAnalyticsEvent("share", mode, entryId, { title, path });
    await incrementModeEntryShares(entryId);
    return true;
  } catch (err) {
    console.error("Share failed:", err);
    toast.error("Не вдалося поділитися");
    return false;
  }
};

const LIKED_KEY = "liked_mode_entries";

export const getLikedEntries = (): string[] => {
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
};

export const setEntryLiked = (entryId: string, liked: boolean) => {
  const current = new Set(getLikedEntries());
  if (liked) current.add(entryId);
  else current.delete(entryId);
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...current]));
  } catch {
    /* ignore */
  }
};
