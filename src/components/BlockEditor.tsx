import React, { useState } from "react";
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
  Code2,
  Heading,
  List as ListIcon,
  Pilcrow,
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
  Quote,
  Info,
  Upload,
  Link2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  BLOCK_LABELS,
  createBlock,
  type BlockType,
  type ContentBlock,
} from "@/lib/blocks";

interface BlockEditorProps {
  value: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  /** Shown above the block list */
  label?: string;
}

const BLOCK_ICONS: Record<BlockType, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  header: Heading,
  paragraph: Pilcrow,
  image: ImageIcon,
  list: ListIcon,
  code: Code2,
  quote: Quote,
  callout: Info,
  sources: BookOpen,
};

const BLOCK_ORDER: BlockType[] = ["header", "paragraph", "image", "list", "code", "quote", "callout", "sources"];

/**
 * Block-style visual editor (similar to Notion / Editor.js) for articles,
 * research reports with graphs/visual data, code snippets, and structured content.
 */
const BlockEditor = ({ value, onChange, label }: BlockEditorProps) => {
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<ContentBlock>) =>
    onChange(value.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const add = (type: BlockType) => onChange([...value, createBlock(type)]);

  const remove = (id: string) => onChange(value.filter((b) => b.id !== id));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const handleImageUpload = async (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Будь ласка, оберіть файл зображення");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Розмір файлу не повинен перевищувати 10 МБ");
      return;
    }

    setUploadingBlockId(blockId);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `block-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `blocks/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("article-images").getPublicUrl(filePath);
      update(blockId, { image_url: data.publicUrl });
      toast.success("Зображення завантажено успішно");
    } catch (err: any) {
      console.error("Upload error:", err);
      // If Supabase storage is not configured, fall back to Data URL for instant live preview
      const reader = new FileReader();
      reader.onload = () => {
        update(blockId, { image_url: reader.result as string });
        toast.info("Зображення збережено локально");
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingBlockId(null);
    }
  };

  return (
    <div className="space-y-4">
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">{label}</Label>
          <span className="text-xs text-muted-foreground">Блоків: {value.length}</span>
        </div>
      )}

      <div className="space-y-3.5">
        {value.map((block, index) => {
          const Icon = BLOCK_ICONS[block.type] || Pilcrow;
          return (
            <div
              key={block.id}
              className="rounded-xl border border-border bg-card/80 p-4 space-y-3 shadow-sm transition-all hover:border-primary/40"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-primary/10 text-primary">
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  {BLOCK_LABELS[block.type]}
                  <span className="text-[10px] text-muted-foreground/60 font-mono">#{index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    aria-label="Пересунути вгору"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    aria-label="Пересунути вниз"
                    disabled={index === value.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    aria-label="Видалити блок"
                    onClick={() => remove(block.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* 1. HEADER BLOCK */}
              {block.type === "header" && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={String(block.level ?? 2)}
                    onValueChange={(v) => update(block.id, { level: Number(v) as 2 | 3 | 4 })}
                  >
                    <SelectTrigger className="w-full sm:w-[110px] bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">H2 (Секція)</SelectItem>
                      <SelectItem value="3">H3 (Підрозділ)</SelectItem>
                      <SelectItem value="4">H4 (Дрібний)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={block.text ?? ""}
                    onChange={(e) => update(block.id, { text: e.target.value })}
                    placeholder="Текст заголовка (наприклад: Архітектура бенчмарку)..."
                    className="bg-background border-border font-semibold text-base"
                  />
                </div>
              )}

              {/* 2. PARAGRAPH BLOCK */}
              {block.type === "paragraph" && (
                <Textarea
                  value={block.text ?? ""}
                  onChange={(e) => update(block.id, { text: e.target.value })}
                  placeholder="Введіть текст аналітики або роз'яснення..."
                  rows={4}
                  className="bg-background border-border leading-relaxed"
                />
              )}

              {/* 3. IMAGE / GRAPH BLOCK (CRITICAL FOR RESEARCH MODE) */}
              {block.type === "image" && (
                <div className="space-y-3 bg-muted/20 p-3 rounded-lg border border-border/80">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={block.image_url ?? ""}
                        onChange={(e) => update(block.id, { image_url: e.target.value })}
                        placeholder="URL зображення, графіка або діаграми (https://...)"
                        className="pl-8 bg-background border-border font-mono text-xs"
                      />
                    </div>
                    <label className="cursor-pointer shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingBlockId === block.id}
                        className="pointer-events-none gap-1.5"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingBlockId === block.id ? "Завантаження..." : "Завантажити файл"}
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(block.id, e)}
                        disabled={uploadingBlockId === block.id}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={block.caption ?? ""}
                      onChange={(e) => update(block.id, { caption: e.target.value })}
                      placeholder="Підпис до графіка (наприклад: Рис. 1 — Порівняння затримки)"
                      className="bg-background border-border text-xs"
                    />
                    <Input
                      value={block.alt ?? ""}
                      onChange={(e) => update(block.id, { alt: e.target.value })}
                      placeholder="Alt-текст для доступності"
                      className="bg-background border-border text-xs"
                    />
                  </div>

                  {block.image_url ? (
                    <div className="relative rounded-lg overflow-hidden border border-border/70 bg-black/40 p-2 flex items-center justify-center max-h-56">
                      <img
                        src={block.image_url}
                        alt={block.alt || "Прев'ю"}
                        className="max-h-48 max-w-full object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-5 border border-dashed border-border rounded-lg bg-background/50 text-xs text-muted-foreground">
                      Вставте посилання на графік або завантажте файл зображення
                    </div>
                  )}
                </div>
              )}

              {/* 4. LIST BLOCK */}
              {block.type === "list" && (
                <div className="space-y-2">
                  {(block.items ?? []).map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <span className="text-primary font-bold">•</span>
                      <Input
                        value={item}
                        onChange={(e) => {
                          const items = [...(block.items ?? [])];
                          items[itemIndex] = e.target.value;
                          update(block.id, { items });
                        }}
                        placeholder="Пункт списку..."
                        className="bg-background border-border text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label="Видалити пункт"
                        onClick={() =>
                          update(block.id, {
                            items: (block.items ?? []).filter((_, i) => i !== itemIndex),
                          })
                        }
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={() => update(block.id, { items: [...(block.items ?? []), ""] })}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Додати пункт
                  </Button>
                </div>
              )}

              {/* 5. CODE BLOCK */}
              {block.type === "code" && (
                <div className="space-y-2">
                  <Input
                    value={block.language ?? ""}
                    onChange={(e) => update(block.id, { language: e.target.value })}
                    placeholder="Мова програмування (python, typescript, sql, rust…)"
                    className="bg-background border-border sm:max-w-[240px] text-xs"
                  />
                  <Textarea
                    value={block.code ?? ""}
                    onChange={(e) => update(block.id, { code: e.target.value })}
                    placeholder="// Вставте код або конфігурацію сюди..."
                    rows={6}
                    spellCheck={false}
                    dir="ltr"
                    className="bg-background border-border font-mono text-xs"
                  />
                </div>
              )}

              {/* 6. QUOTE BLOCK */}
              {block.type === "quote" && (
                <div className="space-y-2 bg-muted/10 p-3 rounded-lg border-l-4 border-primary">
                  <Textarea
                    value={block.text ?? ""}
                    onChange={(e) => update(block.id, { text: e.target.value })}
                    placeholder="Текст цитати або ключового висновку..."
                    rows={3}
                    className="bg-background border-border italic text-sm"
                  />
                  <Input
                    value={block.caption ?? ""}
                    onChange={(e) => update(block.id, { caption: e.target.value })}
                    placeholder="Автор / Джерело (наприклад: State of JS Report 2026)"
                    className="bg-background border-border text-xs"
                  />
                </div>
              )}

              {/* 7. CALLOUT / INFO BLOCK */}
              {block.type === "callout" && (
                <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                    <Info className="w-3.5 h-3.5" />
                    <span>Важливий висновок / Інсайт</span>
                  </div>
                  <Textarea
                    value={block.text ?? ""}
                    onChange={(e) => update(block.id, { text: e.target.value })}
                    placeholder="Введіть ключовий факт або практичну рекомендацію..."
                    rows={3}
                    className="bg-background border-border text-sm"
                  />
                </div>
              )}

              {/* 8. SOURCES / REFERENCES BLOCK */}
              {block.type === "sources" && (
                <div className="space-y-3 bg-muted/15 p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>Використані джерела (Used Sources / References)</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(block.sources ?? []).length} посилань
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(block.sources ?? []).map((srcItem, srcIdx) => (
                      <div
                        key={srcIdx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-lg bg-background border border-border/70"
                      >
                        <div className="flex-1">
                          <Input
                            value={srcItem.title ?? ""}
                            onChange={(e) => {
                              const newSources = [...(block.sources ?? [])];
                              newSources[srcIdx] = {
                                ...newSources[srcIdx],
                                title: e.target.value,
                              };
                              update(block.id, { sources: newSources });
                            }}
                            placeholder="Назва джерела (напр. State of JS 2026)..."
                            className="bg-card border-border text-xs h-9"
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            value={srcItem.url ?? ""}
                            onChange={(e) => {
                              const newSources = [...(block.sources ?? [])];
                              newSources[srcIdx] = {
                                ...newSources[srcIdx],
                                url: e.target.value,
                              };
                              update(block.id, { sources: newSources });
                            }}
                            placeholder="URL (https://example.com/research)..."
                            className="bg-card border-border text-xs h-9 font-mono"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0 self-end sm:self-auto"
                          aria-label="Видалити джерело"
                          onClick={() => {
                            const newSources = (block.sources ?? []).filter((_, i) => i !== srcIdx);
                            update(block.id, { sources: newSources });
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs bg-card hover:bg-primary/10 hover:border-primary/50"
                    onClick={() => {
                      const newSources = [...(block.sources ?? []), { title: "", url: "" }];
                      update(block.id, { sources: newSources });
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Додати джерело
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {value.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-8 px-4 text-center bg-muted/10 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Полотно статті пусте
          </p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Оберіть один із блоків нижче, щоб додати текст, заголовки, списки, код або візуальні графіки
          </p>
        </div>
      )}

      <div className="space-y-2 pt-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Додати новий блок
        </Label>
        <div className="flex flex-wrap gap-2">
          {BLOCK_ORDER.map((type) => {
            const Icon = BLOCK_ICONS[type] || Pilcrow;
            return (
              <Button
                key={type}
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 bg-card hover:bg-primary/10 hover:border-primary/50 transition-colors"
                onClick={() => add(type)}
              >
                <Icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span>{BLOCK_LABELS[type]}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BlockEditor;
