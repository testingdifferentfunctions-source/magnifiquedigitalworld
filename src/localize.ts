import type { Article } from "@/hooks/useArticles";

export type Lang = "uk" | "en";

/**
 * Return the localized title/description/content for an article.
 * Falls back to Ukrainian, then to the legacy single-language column.
 */
export const localizeArticle = (
  article: Pick<
    Article,
    | "title"
    | "description"
    | "content"
    | "title_uk"
    | "title_en"
    | "description_uk"
    | "description_en"
    | "content_uk"
    | "content_en"
  >,
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
  };
};
