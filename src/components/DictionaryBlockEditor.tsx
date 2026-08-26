import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDown,
  ArrowUp,
  Bold,
  Code2,
  Copy,
  Heading,
  Italic,
  Link as LinkIcon,
  List as ListIcon,
  Pilcrow,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  createBlock,
  type BlockType,
  type ContentBlock,
} from "@/lib/blocks";

interface DictionaryBlockEditorProps {
  value: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  /** Shown above the block list */
  label?: string;
}

// Strictly text-focused blocks only (NO image block)
const DICTIONARY_BLOCK_LABELS: Record<BlockType, string> = {
  header: "Заголовок",
  paragraph: "Текстовий абзац",
  list: "Список пунктів",
  code: "Приклад коду",
};

const DICTIONARY_BLOCK_ICONS: Record<BlockType, typeof Pilcrow> = {
  header: Heading,
  paragraph: Pilcrow,
  list: ListIcon,
  code: Code2,
};

const DICTIONARY_BLOCK_ORDER: BlockType[] = ["header", "paragraph", "list", "code"];

const PROGRAMMING_LANGUAGES = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "bash", label: "Bash / Shell" },
  { value: "json", label: "JSON" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
];

/**
 * Dedicated Block Editor for "Словник" (Dictionary) mode.
 * Strictly text-focused (Headings, Paragraphs, Lists, Code snippets).
 * Completely free of image blocks, uploads, or preview requirements.
 */
export const DictionaryBlockEditor = ({
  value,
  onChange,
  label,
}: DictionaryBlockEditorProps) => {
  const update = (id: string, patch: Partial<ContentBlock>) =>
    onChange(value.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const add = (type: BlockType) => onChange([...value, createBlock(type)]);

  const remove = (id: string) => onChange(value.filter((b) => b.id !== id));

  const duplicate = (block: ContentBlock) => {
    const newBlock: ContentBlock = {
      ...block,
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      items: block.items ? [...block.items] : undefined,
    };
    const index = value.findIndex((b) => b.id === block.id);
    if (index === -1) {
      onChange([...value, newBlock]);
    } else {
      const next = [...value];
      next.splice(index + 1, 0, newBlock);
      onChange(next);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  // Helper for applying quick markdown formatting to a paragraph
  const insertFormatting = (
    blockId: string,
    currentText: string,
    prefix: string,
    suffix: string,
    placeholder: string
  ) => {
    const updated = currentText
      ? `${currentText} ${prefix}${placeholder}${suffix}`
      : `${prefix}${placeholder}${suffix}`;
    update(blockId, { text: updated });
  };

  return (
    <div className="space-y-4">
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-neutral-200">{label}</Label>
          <span className="text-xs text-neutral-400">
            {value.length} {value.length === 1 ? "текстовий блок" : "текстових блоків"}
          </span>
        </div>
      )}

      {/* Block List */}
      <div className="space-y-3">
        {value.map((block, index) => {
          const Icon = DICTIONARY_BLOCK_ICONS[block.type] || Pilcrow;
          return (
            <div
              key={block.id}
              className="rounded-xl border border-neutral-800 bg-[#1A1A1A] p-4 sm:p-5 space-y-3.5 shadow-sm transition-all hover:border-neutral-700"
            >
              {/* Header bar of block */}
              <div className="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F3CD97]">
                  <Icon className="w-4 h-4 text-[#F3CD97]" aria-hidden="true" />
                  <span>{DICTIONARY_BLOCK_LABELS[block.type]}</span>
                  <span className="text-neutral-500 font-mono text-[11px]">#{index + 1}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                    aria-label="Пересунути вгору"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                    aria-label="Пересунути вниз"
                    disabled={index === value.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                    aria-label="Дублювати блок"
                    onClick={() => duplicate(block)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-400 hover:text-red-400 hover:bg-red-950/30"
                    aria-label="Видалити блок"
                    onClick={() => remove(block.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Block Type 1: Header */}
              {block.type === "header" && (
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Select
                    value={String(block.level ?? 2)}
                    onValueChange={(v) =>
                      update(block.id, { level: Number(v) as 2 | 3 | 4 })
                    }
                  >
                    <SelectTrigger className="w-full sm:w-[110px] bg-[#141414] border-neutral-800 text-neutral-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F1F1F] border-neutral-800">
                      <SelectItem value="2">H2 (Розділ)</SelectItem>
                      <SelectItem value="3">H3 (Підрозділ)</SelectItem>
                      <SelectItem value="4">H4 (Деталь)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={block.text ?? ""}
                    onChange={(e) => update(block.id, { text: e.target.value })}
                    placeholder="Текст заголовка розділу..."
                    className="bg-[#141414] border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus-visible:ring-[#F3CD97]"
                  />
                </div>
              )}

              {/* Block Type 2: Paragraph (with formatting helpers) */}
              {block.type === "paragraph" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 pb-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                      onClick={() =>
                        insertFormatting(block.id, block.text ?? "", "**", "**", "жирний текст")
                      }
                    >
                      <Bold className="w-3 h-3 mr-1" />
                      Жирний
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                      onClick={() =>
                        insertFormatting(block.id, block.text ?? "", "*", "*", "курсив")
                      }
                    >
                      <Italic className="w-3 h-3 mr-1" />
                      Курсив
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                      onClick={() =>
                        insertFormatting(block.id, block.text ?? "", "`", "`", "термін/код")
                      }
                    >
                      <Code2 className="w-3 h-3 mr-1" />
                      Код
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                      onClick={() =>
                        insertFormatting(block.id, block.text ?? "", "[", "](https://...)", "посилання")
                      }
                    >
                      <LinkIcon className="w-3 h-3 mr-1" />
                      Лінк
                    </Button>
                  </div>
                  <Textarea
                    value={block.text ?? ""}
                    onChange={(e) => update(block.id, { text: e.target.value })}
                    placeholder="Детальний опис, концепція або пояснення терміну..."
                    rows={4}
                    className="bg-[#141414] border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus-visible:ring-[#F3CD97] leading-relaxed"
                  />
                </div>
              )}

              {/* Block Type 3: List */}
              {block.type === "list" && (
                <div className="space-y-2.5">
                  {(block.items ?? []).map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <span className="text-[#F3CD97] font-bold text-sm px-1.5">•</span>
                      <Input
                        value={item}
                        onChange={(e) => {
                          const items = [...(block.items ?? [])];
                          items[itemIndex] = e.target.value;
                          update(block.id, { items });
                        }}
                        placeholder="Ключова характеристика, властивість або приклад..."
                        className="bg-[#141414] border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus-visible:ring-[#F3CD97]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-500 hover:text-neutral-300"
                        aria-label="Видалити пункт"
                        onClick={() =>
                          update(block.id, {
                            items: (block.items ?? []).filter((_, i) => i !== itemIndex),
                          })
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-neutral-800 bg-[#181818] text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800"
                    onClick={() =>
                      update(block.id, { items: [...(block.items ?? []), ""] })
                    }
                  >
                    <Plus className="w-3.5 h-3.5 mr-1 text-[#F3CD97]" />
                    Додати пункт списку
                  </Button>
                </div>
              )}

              {/* Block Type 4: Code */}
              {block.type === "code" && (
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                    <Select
                      value={block.language || "typescript"}
                      onValueChange={(v) => update(block.id, { language: v })}
                    >
                      <SelectTrigger className="w-full sm:w-[200px] bg-[#141414] border-neutral-800 text-neutral-200">
                        <SelectValue placeholder="Оберіть мову" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1F1F1F] border-neutral-800">
                        {PROGRAMMING_LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-neutral-500 font-mono">
                      {block.language || "code"} snippet
                    </span>
                  </div>
                  <Textarea
                    value={block.code ?? ""}
                    onChange={(e) => update(block.id, { code: e.target.value })}
                    placeholder="// Приклад коду, сигнатури функції або конфігурації..."
                    rows={7}
                    spellCheck={false}
                    dir="ltr"
                    className="bg-[#121212] border-neutral-800 font-mono text-sm text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-[#F3CD97]"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {value.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-800 bg-[#161616] p-8 text-center space-y-2">
          <p className="text-sm font-medium text-neutral-300">
            Ще немає блоків опису терміну
          </p>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Додайте заголовки, пояснювальні абзаци, списки властивостей або сніпети коду нижче.
          </p>
        </div>
      )}

      {/* Add Block Toolbar (NO image block) */}
      <div className="pt-2">
        <Label className="text-xs text-neutral-400 uppercase tracking-wider block mb-2 font-medium">
          Додати текстовий блок до словника:
        </Label>
        <div className="flex flex-wrap gap-2">
          {DICTIONARY_BLOCK_ORDER.map((type) => {
            const Icon = DICTIONARY_BLOCK_ICONS[type];
            return (
              <Button
                key={type}
                type="button"
                variant="outline"
                size="sm"
                className="border-neutral-800 bg-[#1A1A1A] hover:bg-[#242424] text-neutral-200 hover:text-white hover:border-[#F3CD97]/40 transition-colors"
                onClick={() => add(type)}
              >
                <Icon className="w-4 h-4 mr-1.5 text-[#F3CD97]" aria-hidden="true" />
                {DICTIONARY_BLOCK_LABELS[type]}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DictionaryBlockEditor;
