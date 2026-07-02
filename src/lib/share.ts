import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const incrementShareCount = async (articleId: string) => {
  try {
    const { error } = await supabase.rpc("increment_article_shares" as any, {
      p_article_id: articleId,
    } as any);
    if (error) throw error;
  } catch (err) {
    console.error("Failed to increment share count:", err);
  }
};

export const shareArticle = async (
  articleId: string,
  title: string,
  url?: string
): Promise<boolean> => {
  const shareUrl = url ?? `${window.location.origin}/article/${articleId}`;

  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: shareUrl });
        await incrementShareCount(articleId);
        return true;
      } catch (err: any) {
        // User cancelled — do not count or fall back
        if (err?.name === "AbortError") return false;
        // Otherwise fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(shareUrl);
    toast.success("Посилання скопійовано!");
    await incrementShareCount(articleId);
    return true;
  } catch (err) {
    console.error("Share failed:", err);
    toast.error("Не вдалося поділитися");
    return false;
  }
};
