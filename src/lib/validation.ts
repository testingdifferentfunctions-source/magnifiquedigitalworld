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
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, { message: 'Пароль повинен містити спецсимвол (!@#$%^&* тощо)' });

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
    .min(1, { message: 'Опис обов\'язковий' })
    .max(500, { message: 'Опис занадто довгий (макс. 500 символів)' }),
  content: z
    .string()
    .max(50000, { message: 'Контент занадто довгий' }),
  image_url: z
    .string()
    .url({ message: 'Невірний URL зображення' })
    .optional()
    .or(z.literal('')),
  category_id: z
    .string()
    .uuid({ message: 'Невірний ID категорії' })
    .nullable()
    .optional(),
  published: z.boolean(),
  tags: z
    .array(z.string().trim().min(1).max(40))
    .max(5, { message: 'Максимум 5 тегів' })
    .optional(),
});

// Category validation schemas
export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Назва обов\'язкова' })
    .max(100, { message: 'Назва занадто довга (макс. 100 символів)' }),
  image_url: z
    .string()
    .url({ message: 'Невірний URL зображення' })
    .optional()
    .or(z.literal('')),
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
