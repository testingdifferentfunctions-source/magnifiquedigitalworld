import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Sparkles,
  Palette as PaletteIcon,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  parseColor,
  generateColorSnippets,
  type ColorDetailBlock,
} from "@/lib/colors";
import { toast } from "sonner";

interface PaletteColorEditorProps {
  blocks: any[];
  onChange: (blocks: any[]) => void;
  label?: string;
}

function generateBlockId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `color-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const PaletteColorEditor: React.FC<PaletteColorEditorProps> = ({
  blocks,
  onChange,
  label = "Блоки кольорів (Color Detail Blocks)",
}) => {
  // Normalize color blocks and ensure stable IDs
  const colorBlocks: ColorDetailBlock[] = (Array.isArray(blocks) ? blocks : [])
    .filter((b) => b && (b.type === "color_detail" || b.type === "color-detail"))
    .map((b, idx) => ({
      id: b.id || `color-block-${idx}-${b.hex || "def"}`,
      type: "color_detail",
      badge: b.badge !== undefined && b.badge !== "" ? b.badge : String(idx + 1),
      subtitle: b.subtitle || b.role || `Color ${idx + 1}`,
      title: b.title || b.name || `Колір ${idx + 1}`,
      description:
        b.description || "Клікніть на значення нижче для швидкого копіювання",
      hex: b.hex || "#8ABEB9",
      rgb: b.rgb || "",
      hsl: b.hsl || "",
      oklch: b.oklch || "",
      css_snippet: b.css_snippet || "",
      scss_snippet: b.scss_snippet || "",
      tailwind_snippet: b.tailwind_snippet || "",
    }));

  const [expandedId, setExpandedId] = useState<string | null>(
    colorBlocks.length > 0 ? colorBlocks[0].id || null : null
  );

  const updateBlock = (id: string, updatedFields: Partial<ColorDetailBlock>) => {
    const next = colorBlocks.map((b) =>
      b.id === id ? { ...b, ...updatedFields } : b
    );
    onChange(next);
  };

  const handleHexChange = (id: string, newHex: string) => {
    const blockIndex = colorBlocks.findIndex((b) => b.id === id);
    if (blockIndex === -1) return;
    const current = colorBlocks[blockIndex];
    const cleaned = newHex.trim();
    const parsed = parseColor(cleaned, current.title, current.subtitle);
    const snippets = generateColorSnippets(parsed, blockIndex);

    updateBlock(id, {
      hex: newHex,
      rgb: parsed.rgb,
      hsl: parsed.hsl,
      oklch: parsed.oklch,
      css_snippet: current.css_snippet || snippets.css,
      scss_snippet: current.scss_snippet || snippets.scss,
      tailwind_snippet: current.tailwind_snippet || snippets.tailwind,
    });
  };

  const handleAutoCalculate = (id: string) => {
    const blockIndex = colorBlocks.findIndex((b) => b.id === id);
    if (blockIndex === -1) return;
    const current = colorBlocks[blockIndex];
    const parsed = parseColor(current.hex || "#8ABEB9", current.title, current.subtitle);
    const snippets = generateColorSnippets(parsed, blockIndex);

    updateBlock(id, {
      hex: parsed.hex,
      rgb: parsed.rgb,
      hsl: parsed.hsl,
      oklch: parsed.oklch,
      css_snippet: snippets.css,
      scss_snippet: snippets.scss,
      tailwind_snippet: snippets.tailwind,
    });
    toast.success(`Значення та фрагменти коду для "${current.title}" розраховано`);
  };

  const handleAddColor = () => {
    const newIndex = colorBlocks.length;
    const defaultHex = ["#8ABEB9", "#262626", "#F4A261", "#E76F51", "#2A9D8F"][
      newIndex % 5
    ];
    const parsed = parseColor(defaultHex, `Колір ${newIndex + 1}`, `Color ${newIndex + 1}`);
    const snippets = generateColorSnippets(parsed, newIndex);
    const newId = generateBlockId();

    const newBlock: ColorDetailBlock = {
      id: newId,
      type: "color_detail",
      badge: String(newIndex + 1),
      subtitle: `Color ${newIndex + 1}`,
      title: `Колір ${newIndex + 1}`,
      description: "Клікніть на значення нижче для швидкого копіювання",
      hex: defaultHex,
      rgb: parsed.rgb,
      hsl: parsed.hsl,
      oklch: parsed.oklch,
      css_snippet: snippets.css,
      scss_snippet: snippets.scss,
      tailwind_snippet: snippets.tailwind,
    };

    const next = [...colorBlocks, newBlock];
    onChange(next);
    setExpandedId(newId);
    toast.success("Новий колір додано");
  };

  const handleDuplicate = (id: string) => {
    const blockIndex = colorBlocks.findIndex((b) => b.id === id);
    if (blockIndex === -1) return;
    const item = colorBlocks[blockIndex];
    const nextBadge = colorBlocks.length + 1;
    const newId = generateBlockId();

    const duplicated: ColorDetailBlock = {
      ...item,
      id: newId,
      badge: String(nextBadge),
      subtitle: `${item.subtitle || "Color"} (Копія)`,
      title: `${item.title || "Колір"} (Копія)`,
    };

    const next = [
      ...colorBlocks.slice(0, blockIndex + 1),
      duplicated,
      ...colorBlocks.slice(blockIndex + 1),
    ];
    onChange(next);
    setExpandedId(newId);
    toast.success("Колір продубльовано");
  };

  const handleRemove = (id: string) => {
    const targetBlock = colorBlocks.find((b) => b.id === id);
    const title = targetBlock?.title || "Колір";
    const next = colorBlocks.filter((b) => b.id !== id);
    onChange(next);

    if (expandedId === id) {
      setExpandedId(next.length > 0 ? next[0].id || null : null);
    }
    toast.success(`"${title}" успішно видалено`);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= colorBlocks.length) return;

    const next = [...colorBlocks];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <PaletteIcon className="w-4 h-4 text-[#8ABEB9]" />
            {label}
          </h3>
          <p className="text-xs text-muted-foreground">
            Структуровані блоки кольорів з конвертацією значень та фрагментами коду
          </p>
        </div>
        <Button
          type="button"
          onClick={handleAddColor}
          size="sm"
          className="bg-[#8ABEB9] hover:bg-[#78aca7] text-[#0F0E0E] font-medium"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Додати новий колір
        </Button>
      </div>

      {colorBlocks.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-xl p-6 bg-muted/10 space-y-3">
          <PaletteIcon className="w-10 h-10 mx-auto text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            У цій палітрі ще немає доданих блоків кольорів.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddColor}
            className="border-[#8ABEB9] text-[#8ABEB9] hover:bg-[#8ABEB9]/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Додати перший колір
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {colorBlocks.map((block, index) => {
            const blockId = block.id || `color-block-${index}`;
            const isExpanded = expandedId === blockId;
            const previewHex = block.hex.startsWith("#") ? block.hex : `#${block.hex}`;

            return (
              <Card
                key={blockId}
                className={`border transition-all duration-200 ${
                  isExpanded
                    ? "border-[#8ABEB9]/60 shadow-md bg-card"
                    : "border-border bg-card/60 hover:border-border/80"
                }`}
              >
                {/* Header Row */}
                <CardHeader className="p-3.5 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => setExpandedId(isExpanded ? null : blockId)}
                    >
                      {/* Color Preview Swatch with Badge */}
                      <div
                        className="w-10 h-10 rounded-lg border border-white/20 shadow-inner flex items-end justify-end p-1 shrink-0 relative overflow-hidden"
                        style={{ backgroundColor: previewHex }}
                      >
                        <span className="bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                          {block.badge || index + 1}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-muted font-medium text-muted-foreground">
                            {block.subtitle || `Color ${index + 1}`}
                          </span>
                          <h4 className="text-sm font-bold truncate text-foreground">
                            {block.title || `Колір ${index + 1}`}
                          </h4>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground truncate mt-0.5">
                          {block.hex} • {block.rgb || "rgb(...)"} • {block.hsl || "hsl(...)"}
                        </p>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${
                          isExpanded ? "rotate-90 text-[#8ABEB9]" : ""
                        }`}
                      />
                    </div>

                    {/* Action Toolbar */}
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        disabled={index === 0}
                        onClick={() => handleMove(index, "up")}
                        title="Перемістити вище"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        disabled={index === colorBlocks.length - 1}
                        onClick={() => handleMove(index, "down")}
                        title="Перемістити нижче"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleDuplicate(blockId)}
                        title="Дублювати колір"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(blockId)}
                        title="Видалити колір"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Card Body */}
                {isExpanded && (
                  <CardContent className="p-4 pt-0 space-y-5 border-t border-border mt-2">
                    {/* Top Row: Meta Titles & Badge */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3">
                      {/* 1. Color Number / Badge */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <Label htmlFor={`badge-${blockId}`} className="text-xs font-semibold">
                          1. Номер / Бейдж
                        </Label>
                        <Input
                          id={`badge-${blockId}`}
                          value={block.badge ?? ""}
                          onChange={(e) => updateBlock(blockId, { badge: e.target.value })}
                          placeholder="e.g. 4"
                          className="font-mono text-sm"
                        />
                        <p className="text-[10px] text-muted-foreground">Бейдж на зразку</p>
                      </div>

                      {/* 2. Subtitle */}
                      <div className="sm:col-span-4 space-y-1.5">
                        <Label htmlFor={`subtitle-${blockId}`} className="text-xs font-semibold">
                          2. Підзаголовок (Subtitle)
                        </Label>
                        <Input
                          id={`subtitle-${blockId}`}
                          value={block.subtitle ?? ""}
                          onChange={(e) => updateBlock(blockId, { subtitle: e.target.value })}
                          placeholder="e.g. Color 4, Primary Accent"
                        />
                        <p className="text-[10px] text-muted-foreground">Роль або підзаголовок</p>
                      </div>

                      {/* 3. Main Title */}
                      <div className="sm:col-span-6 space-y-1.5">
                        <Label htmlFor={`title-${blockId}`} className="text-xs font-semibold">
                          3. Головна назва (Main Title)
                        </Label>
                        <Input
                          id={`title-${blockId}`}
                          value={block.title ?? ""}
                          onChange={(e) => updateBlock(blockId, { title: e.target.value })}
                          placeholder="e.g. Колір 4, Ocean Blue"
                        />
                        <p className="text-[10px] text-muted-foreground">Основна назва кольору</p>
                      </div>
                    </div>

                    {/* 4. Description */}
                    <div className="space-y-1.5">
                      <Label htmlFor={`desc-${blockId}`} className="text-xs font-semibold">
                        4. Опис (Description)
                      </Label>
                      <Input
                        id={`desc-${blockId}`}
                        value={block.description ?? ""}
                        onChange={(e) => updateBlock(blockId, { description: e.target.value })}
                        placeholder="Клікніть на значення нижче для швидкого копіювання..."
                      />
                    </div>

                    {/* 5. Color Values (HEX, RGB, HSL, OKLCH) */}
                    <div className="space-y-2 rounded-lg border border-border p-3.5 bg-muted/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <PaletteIcon className="w-3.5 h-3.5 text-[#8ABEB9]" />
                          5. Значення кольору (Color Values)
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAutoCalculate(blockId)}
                          className="h-7 text-xs gap-1 border-[#8ABEB9]/40 text-[#8ABEB9] hover:bg-[#8ABEB9]/10"
                        >
                          <Sparkles className="w-3 h-3" />
                          Авторозрахунок з HEX
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* HEX */}
                        <div className="space-y-1">
                          <Label htmlFor={`hex-${blockId}`} className="text-xs">
                            HEX Value
                          </Label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={previewHex.length === 7 ? previewHex : "#8ABEB9"}
                              onChange={(e) => handleHexChange(blockId, e.target.value.toUpperCase())}
                              className="w-8 h-9 rounded cursor-pointer border border-border bg-transparent p-0.5 shrink-0"
                            />
                            <Input
                              id={`hex-${blockId}`}
                              value={block.hex}
                              onChange={(e) => handleHexChange(blockId, e.target.value)}
                              placeholder="#8ABEB9"
                              className="font-mono text-xs uppercase"
                            />
                          </div>
                        </div>

                        {/* RGB */}
                        <div className="space-y-1">
                          <Label htmlFor={`rgb-${blockId}`} className="text-xs">
                            RGB Value
                          </Label>
                          <Input
                            id={`rgb-${blockId}`}
                            value={block.rgb ?? ""}
                            onChange={(e) => updateBlock(blockId, { rgb: e.target.value })}
                            placeholder="rgb(138, 190, 185)"
                            className="font-mono text-xs"
                          />
                        </div>

                        {/* HSL */}
                        <div className="space-y-1">
                          <Label htmlFor={`hsl-${blockId}`} className="text-xs">
                            HSL Value
                          </Label>
                          <Input
                            id={`hsl-${blockId}`}
                            value={block.hsl ?? ""}
                            onChange={(e) => updateBlock(blockId, { hsl: e.target.value })}
                            placeholder="hsl(174, 30%, 64%)"
                            className="font-mono text-xs"
                          />
                        </div>

                        {/* OKLCH */}
                        <div className="space-y-1">
                          <Label htmlFor={`oklch-${blockId}`} className="text-xs">
                            OKLCH Value
                          </Label>
                          <Input
                            id={`oklch-${blockId}`}
                            value={block.oklch ?? ""}
                            onChange={(e) => updateBlock(blockId, { oklch: e.target.value })}
                            placeholder="oklch(76.2% 0.053 194.2)"
                            className="font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 6. Code Integration Snippets (CSS, SCSS, Tailwind) */}
                    <div className="space-y-2 rounded-lg border border-border p-3.5 bg-muted/20">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                        6. Фрагменти коду для інтеграції (Code Snippets)
                      </span>

                      <Tabs defaultValue="css" className="w-full">
                        <TabsList className="grid grid-cols-3 mb-3">
                          <TabsTrigger value="css">CSS Snippet</TabsTrigger>
                          <TabsTrigger value="scss">SCSS Snippet</TabsTrigger>
                          <TabsTrigger value="tailwind">Tailwind Snippet</TabsTrigger>
                        </TabsList>

                        <TabsContent value="css" className="space-y-1.5">
                          <Label htmlFor={`css-${blockId}`} className="text-xs text-muted-foreground">
                            CSS Variables / Classes
                          </Label>
                          <Textarea
                            id={`css-${blockId}`}
                            rows={5}
                            value={block.css_snippet ?? ""}
                            onChange={(e) => updateBlock(blockId, { css_snippet: e.target.value })}
                            placeholder="/* CSS Variables */\n:root {\n  --color: #8ABEB9;\n}"
                            className="font-mono text-xs bg-background"
                          />
                        </TabsContent>

                        <TabsContent value="scss" className="space-y-1.5">
                          <Label htmlFor={`scss-${blockId}`} className="text-xs text-muted-foreground">
                            SCSS Variables / Mixin
                          </Label>
                          <Textarea
                            id={`scss-${blockId}`}
                            rows={5}
                            value={block.scss_snippet ?? ""}
                            onChange={(e) => updateBlock(blockId, { scss_snippet: e.target.value })}
                            placeholder="// SCSS Variables\n$color: #8ABEB9;"
                            className="font-mono text-xs bg-background"
                          />
                        </TabsContent>

                        <TabsContent value="tailwind" className="space-y-1.5">
                          <Label htmlFor={`tw-${blockId}`} className="text-xs text-muted-foreground">
                            Tailwind Config & Classes
                          </Label>
                          <Textarea
                            id={`tw-${blockId}`}
                            rows={5}
                            value={block.tailwind_snippet ?? ""}
                            onChange={(e) => updateBlock(blockId, { tailwind_snippet: e.target.value })}
                            placeholder="// Tailwind usage\n<div className='bg-[#8ABEB9]'>"
                            className="font-mono text-xs bg-background"
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaletteColorEditor;
