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
} from "lucide-react";
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

const BLOCK_ICONS: Record<BlockType, typeof Pilcrow> = {
  header: Heading,
  paragraph: Pilcrow,
  list: ListIcon,
  code: Code2,
};

const BLOCK_ORDER: BlockType[] = ["header", "paragraph", "list", "code"];

/**
 * Custom block editor: content is authored block by block and persisted as a
 * structured array (no HTML), so it can be rendered safely on detail pages.
 */
const BlockEditor = ({ value, onChange, label }: BlockEditorProps) => {
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

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}

      <div className="space-y-3">
        {value.map((block, index) => {
          const Icon = BLOCK_ICONS[block.type];
          return (
            <div key={block.id} className="rounded-lg border border-border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {BLOCK_LABELS[block.type]}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
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
                    aria-label="Видалити блок"
                    onClick={() => remove(block.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {block.type === "header" && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={String(block.level ?? 2)}
                    onValueChange={(v) => update(block.id, { level: Number(v) as 2 | 3 | 4 })}
                  >
                    <SelectTrigger className="w-full sm:w-[110px] bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">H2</SelectItem>
                      <SelectItem value="3">H3</SelectItem>
                      <SelectItem value="4">H4</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={block.text ?? ""}
                    onChange={(e) => update(block.id, { text: e.target.value })}
                    placeholder="Текст заголовка"
                    className="bg-card border-border"
                  />
                </div>
              )}

              {block.type === "paragraph" && (
                <Textarea
                  value={block.text ?? ""}
                  onChange={(e) => update(block.id, { text: e.target.value })}
                  placeholder="Текст абзацу"
                  rows={4}
                  className="bg-card border-border"
                />
              )}

              {block.type === "list" && (
                <div className="space-y-2">
                  {(block.items ?? []).map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <span className="text-muted-foreground">•</span>
                      <Input
                        value={item}
                        onChange={(e) => {
                          const items = [...(block.items ?? [])];
                          items[itemIndex] = e.target.value;
                          update(block.id, { items });
                        }}
                        placeholder="Пункт списку"
                        className="bg-card border-border"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
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
                    onClick={() => update(block.id, { items: [...(block.items ?? []), ""] })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Пункт
                  </Button>
                </div>
              )}

              {block.type === "code" && (
                <div className="space-y-2">
                  <Input
                    value={block.language ?? ""}
                    onChange={(e) => update(block.id, { language: e.target.value })}
                    placeholder="Мова (python, bash…)"
                    className="bg-card border-border sm:max-w-[220px]"
                  />
                  <Textarea
                    value={block.code ?? ""}
                    onChange={(e) => update(block.id, { code: e.target.value })}
                    placeholder="Код"
                    rows={8}
                    spellCheck={false}
                    dir="ltr"
                    className="bg-card border-border font-mono text-sm"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {value.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Ще немає блоків — додайте перший нижче.
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {BLOCK_ORDER.map((type) => {
          const Icon = BLOCK_ICONS[type];
          return (
            <Button key={type} type="button" variant="outline" size="sm" onClick={() => add(type)}>
              <Icon className="w-4 h-4 mr-1.5" aria-hidden="true" />
              {BLOCK_LABELS[type]}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BlockEditor;
