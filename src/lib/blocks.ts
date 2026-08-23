/**
 * Block-structured content used by the "Ресурси" / "Компоненти" / "Шаблони коду"
 * modes. Stored in Postgres as a jsonb array (mode_entries.blocks_uk / blocks_en).
 */
export type BlockType = "header" | "paragraph" | "list" | "code";

export interface ContentBlock {
  id: string;
  type: BlockType;
  /** header + paragraph */
  text?: string;
  /** header only: 2 | 3 | 4 */
  level?: 2 | 3 | 4;
  /** list only */
  items?: string[];
  /** code only */
  code?: string;
  language?: string;
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  header: "Заголовок",
  paragraph: "Абзац",
  list: "Список",
  code: "Код",
};

export const createBlock = (type: BlockType): ContentBlock => {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  switch (type) {
    case "header":
      return { id, type, text: "", level: 2 };
    case "list":
      return { id, type, items: [""] };
    case "code":
      return { id, type, code: "", language: "python" };
    default:
      return { id, type: "paragraph", text: "" };
  }
};

/** Defensive parse: the jsonb column is untyped, so drop anything unexpected. */
export const parseBlocks = (value: unknown): ContentBlock[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const b = raw as Record<string, unknown>;
    const type = b.type;
    if (type !== "header" && type !== "paragraph" && type !== "list" && type !== "code") {
      return [];
    }
    const block: ContentBlock = {
      id: typeof b.id === "string" ? b.id : `${Math.random().toString(16).slice(2)}`,
      type,
    };
    if (typeof b.text === "string") block.text = b.text;
    if (b.level === 2 || b.level === 3 || b.level === 4) block.level = b.level;
    if (Array.isArray(b.items)) block.items = b.items.filter((i): i is string => typeof i === "string");
    if (typeof b.code === "string") block.code = b.code;
    if (typeof b.language === "string") block.language = b.language;
    return [block];
  });
};

/** Plain-text preview used for meta descriptions and search. */
export const blocksToPlainText = (blocks: ContentBlock[]): string =>
  blocks
    .map((b) => {
      if (b.type === "list") return (b.items ?? []).join(", ");
      if (b.type === "code") return b.code ?? "";
      return b.text ?? "";
    })
    .filter(Boolean)
    .join("\n");

/** Sections (header blocks) used to build the table of contents. */
export const slugifyHeading = (text: string, index: number) => {
  const base = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${base}-${index}` : `section-${index}`;
};

export const extractHeadings = (blocks: ContentBlock[]) =>
  blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.type === "header" && (block.text ?? "").trim())
    .map(({ block, index }) => ({
      id: slugifyHeading(block.text ?? "", index),
      text: (block.text ?? "").trim(),
      level: block.level ?? 2,
    }));
