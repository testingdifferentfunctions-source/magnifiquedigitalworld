import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts relative storage file path from various Supabase URL formats or bare paths.
 */
export function extractStoragePath(urlOrPath: string | null | undefined): string {
  if (!urlOrPath || typeof urlOrPath !== "string") return "";
  const trimmed = urlOrPath.trim();
  if (!trimmed) return "";

  const markers = [
    "/storage/v1/object/public/article-images/",
    "/storage/v1/object/sign/article-images/",
    "/storage/v1/object/authenticated/article-images/",
  ];

  for (const marker of markers) {
    if (trimmed.includes(marker)) {
      const part = trimmed.substring(trimmed.indexOf(marker) + marker.length);
      return decodeURIComponent(part.split("?")[0]);
    }
  }

  const clean = trimmed.replace(/^\/?(article-images\/)?/, "");
  if (!clean.startsWith("http://") && !clean.startsWith("https://") && !clean.startsWith("data:") && !clean.startsWith("blob:")) {
    return clean;
  }
  return "";
}

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Generates and caches a signed storage URL for images in 'article-images'.
 * Enables seamless rendering even when Supabase storage buckets require signed authorization.
 */
export async function getSignedStorageUrl(urlOrPath: string | null | undefined): Promise<string | null> {
  const cleanPath = extractStoragePath(urlOrPath);
  if (!cleanPath) return null;

  const cached = signedUrlCache.get(cleanPath);
  const now = Date.now();
  if (cached && cached.expiresAt > now + 60000) {
    return cached.url;
  }

  try {
    const { data, error } = await supabase.storage
      .from("article-images")
      .createSignedUrl(cleanPath, 60 * 60 * 24 * 365); // 1 year expiry

    if (!error && data?.signedUrl) {
      signedUrlCache.set(cleanPath, {
        url: data.signedUrl,
        expiresAt: now + 365 * 24 * 60 * 60 * 1000,
      });
      return data.signedUrl;
    }
  } catch (err) {
    console.warn("Could not create signed storage URL:", err);
  }

  return null;
}

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
