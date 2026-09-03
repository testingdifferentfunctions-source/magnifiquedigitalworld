import { supabase } from "@/integrations/supabase/client";

/**
 * Returns a fully qualified public URL for images stored in Supabase storage ('article-images'),
 * handling raw filenames, relative paths, legacy domain URLs, and external URLs.
 */
export function getStoragePublicUrl(urlOrPath: string | null | undefined): string {
  if (!urlOrPath || typeof urlOrPath !== "string") {
    return "";
  }

  const trimmed = urlOrPath.trim();
  if (!trimmed) {
    return "";
  }

  // Data URLs and Blobs can be returned as is
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // If already an absolute HTTP/HTTPS URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const marker = "/storage/v1/object/public/article-images/";
    // If it points to an 'article-images' bucket (even on another Supabase domain/project),
    // extract path and query the active Supabase client to ensure correct project endpoint
    if (trimmed.includes(marker)) {
      const relativePart = trimmed.substring(trimmed.indexOf(marker) + marker.length);
      const cleanRelative = decodeURIComponent(relativePart.split("?")[0]);
      if (cleanRelative) {
        const { data } = supabase.storage.from("article-images").getPublicUrl(cleanRelative);
        if (data?.publicUrl) return data.publicUrl;
      }
    }
    return trimmed;
  }

  // Handle bare filenames or relative paths (e.g., '123e4567.jpg', 'article-images/123.png', '/article-images/123.png')
  let cleanPath = trimmed;
  if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.slice(1);
  }
  if (cleanPath.startsWith("article-images/")) {
    cleanPath = cleanPath.replace(/^article-images\//, "");
  }

  const { data } = supabase.storage.from("article-images").getPublicUrl(cleanPath);
  return data?.publicUrl || trimmed;
}

/**
 * Strips trailing empty paragraphs, empty linebreaks, and non-breaking spaces
 * appended by rich text editors at the end of article content.
 */
export function stripTrailingEmptyHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  let cleaned = html.trim();
  const trailingEmptyRegex = /(?:<(?:p|div|span)[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/(?:p|div|span)>|<br\s*\/?>|\s|&nbsp;)+$/gi;

  let prev = "";
  while (cleaned !== prev) {
    prev = cleaned;
    cleaned = cleaned.replace(trailingEmptyRegex, "").trim();
  }

  return cleaned;
}
