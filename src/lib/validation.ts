import { z } from 'zod';
import DOMPurify from 'dompurify';

// HTML sanitization config (matches RichTextEditor)
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'colspan', 'rowspan'],
};

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
};

// Auth validation schemas
export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'Email обов\'язковий' })
  .email({ message: 'Невірний формат email' })
  .max(255, { message: 'Email занадто довгий' });

export const passwordSchema = z
  .string()
  .min(8, { message: 'Пароль повинен містити мінімум 8 символів' })
  .max(72, { message: 'Пароль занадто довгий' })
  .regex(/[A-Z]/, { message: 'Пароль повинен містити велику літеру' })
  .regex(/[a-z]/, { message: 'Пароль повинен містити малу літеру' })
  .regex(/[0-9]/, { message: 'Пароль повинен містити цифру' })
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, { message: 'Пароль повинен містити спецсимвол (!@#$%^&* тощо)' });

export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Article validation schemas
export const articleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Заголовок обов\'язковий' })
    .max(200, { message: 'Заголовок занадто довгий (макс. 200 символів)' }),
  description: z
    .string()
    .trim()
    .max(1000, { message: 'Опис занадто довгий (макс. 1000 символів)' })
    .optional()
    .nullable()
    .or(z.literal('')),
  content: z
    .string()
    .max(100000, { message: 'Контент занадто довгий' })
    .optional()
    .nullable()
    .or(z.literal('')),
  image_url: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
  category_id: z
    .string()
    .nullable()
    .optional()
    .or(z.literal('')),
  published: z.boolean().default(false),
  tags: z
    .array(z.string().trim().min(1).max(40))
    .max(15, { message: 'Максимум 15 тегів' })
    .optional(),
  canonical_url_uk: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
  canonical_url_en: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
  original_source_url: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
  show_test_button: z.boolean().optional().nullable(),
  showTestButton: z.boolean().optional().nullable(),
});

// Dictionary entry validation schema (strictly text-focused, no image requirements)
export const dictionaryEntrySchema = z.object({
  type: z.literal("dictionary").default("dictionary"),
  slug: z.string().trim().max(120).optional().nullable().or(z.literal("")),
  title_uk: z
    .string()
    .trim()
    .min(1, { message: "Назва терміну (UK) обов'язкова" })
    .max(200, { message: "Назва занадто довга (макс. 200 символів)" }),
  title_en: z
    .string()
    .trim()
    .max(200, { message: "Title is too long (max 200 chars)" })
    .optional()
    .nullable()
    .or(z.literal("")),
  description_uk: z
    .string()
    .trim()
    .min(1, { message: "Коротке визначення (UK) обов'язкове" })
    .max(2000, { message: "Визначення занадто довге (макс. 2000 символів)" }),
  description_en: z
    .string()
    .trim()
    .max(2000, { message: "Description is too long (max 2000 chars)" })
    .optional()
    .nullable()
    .or(z.literal("")),
  category_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  external_url: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  tags: z
    .array(z.string().trim().min(1).max(40))
    .max(15, { message: "Максимум 15 тегів" })
    .default([]),
  published: z.boolean().default(true),
  canonical_url_uk: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  canonical_url_en: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  blocks_uk: z.array(z.any()).default([]),
  blocks_en: z.array(z.any()).default([]),
});

export type DictionaryEntryFormValues = z.infer<typeof dictionaryEntrySchema>;

// Category validation schemas
export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Назва обов\'язкова' })
    .max(100, { message: 'Назва занадто довга (макс. 100 символів)' }),
  name_en: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable()
    .or(z.literal('')),
  mode: z
    .enum(['articles', 'news', 'resources', 'components', 'templates', 'research', 'palettes', 'resource', 'component', 'template', 'palette', 'dictionary', 'design', 'designs', 'editor'])
    .default('articles'),
  slug: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable()
    .or(z.literal('')),
  image_url: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
  sort_order: z.number().int().default(0).optional(),
});

export const subcategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Назва підкатегорії обов\'язкова' })
    .max(100, { message: 'Назва занадто довга' }),
  name_en: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable()
    .or(z.literal('')),
  category_id: z.string().min(1, { message: 'Категорія обов\'язкова' }),
  mode: z
    .string()
    .default('articles')
    .optional(),
  slug: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable()
    .or(z.literal('')),
  sort_order: z.number().int().default(0).optional(),
});

// URL sanitization
export const sanitizeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  
  // Only allow http/https URLs
  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return trimmed;
  } catch {
    return '';
  }
};

// Text sanitization (prevents basic XSS)
export const sanitizeText = (text: string): string => {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validation helper
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map((err) => err.message);
  return { success: false, errors };
};
