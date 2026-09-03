import type { Article } from "@/hooks/useArticles";

export type Lang = "uk" | "en";

/**
 * Resolves localized image URL based on current language.
 * - If current site language is English ('en') and image_url_en is not null/empty, returns image_url_en.
 * - Otherwise, returns image_url_uk (as the default/fallback).
 * - Also checks legacy image_url and image fields as final fallback.
 */
export function getLocalizedImageUrl(
  item: {
    image_url_uk?: string | null;
    image_url_en?: string | null;
    image_url?: string | null;
    image?: string | null;
  } | null | undefined,
  language: Lang | string
): string | null {
  if (!item) return null;
  const isEn = language === "en";
  if (isEn && item.image_url_en && item.image_url_en.trim().length > 0) {
    return item.image_url_en.trim();
  }
  if (item.image_url_uk && item.image_url_uk.trim().length > 0) {
    return item.image_url_uk.trim();
  }
  // Fallback to legacy single image if dual images not set
  if (item.image_url && item.image_url.trim().length > 0) {
    return item.image_url.trim();
  }
  if (item.image && item.image.trim().length > 0) {
    return item.image.trim();
  }
  return null;
}

/**
 * Return the localized title/description/content for an article.
 * Falls back to Ukrainian, then to the legacy single-language column.
 */
export const localizeArticle = (
  article: Partial<Article>,
  language: Lang
) => {
  const pick = (
    en: string | null | undefined,
    uk: string | null | undefined,
    legacy: string | null | undefined
  ) => {
    if (language === "en") return en || uk || legacy || "";
    return uk || legacy || "";
  };

  return {
    title: pick(article.title_en, article.title_uk, article.title),
    description: pick(
      article.description_en,
      article.description_uk,
      article.description
    ),
    content: pick(article.content_en, article.content_uk, article.content),
    imageUrl: getLocalizedImageUrl(article, language),
  };
};
