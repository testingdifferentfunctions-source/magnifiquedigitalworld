import React, { useState, useEffect, useMemo } from "react";
import {
  Code,
  Sparkles,
  Eye,
  FileCode,
  Layers,
  Wand2,
  Copy,
  Check,
  RotateCcw,
  Palette,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BlockEditor from "@/components/BlockEditor";
import type { ContentBlock } from "@/lib/blocks";
import { toast } from "sonner";

export interface DesignSnippets {
  html: string;
  css: string;
  scss: string;
  tailwind: string;
  previewHtml?: string;
}

interface DesignEntryEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  titleUk?: string;
  descriptionUk?: string;
  imageUrl?: string;
  onImageUrlChange?: (url: string) => void;
  locale?: "uk" | "en";
}

const PRESET_PREVIEWS = [
  { id: "custom", label: "Користувацький HTML/CSS або Зображення" },
  { id: "aurora", label: "Aurora Mesh Gradient (Світіння)" },
  { id: "glass", label: "Frosted Glassmorphism (Матове скло)" },
  { id: "neon", label: "Cyber Neon Glow Button (Неон)" },
  { id: "sphere", label: "3D Gradient Sphere (Сфера)" },
  { id: "bento", label: "Bento Analytics Stat (Дашборд)" },
  { id: "toggle", label: "Segmented Pill Component (Перемикач)" },
];

export const DesignEntryEditor: React.FC<DesignEntryEditorProps> = ({
  blocks = [],
  onChange,
  titleUk = "",
  descriptionUk = "",
  imageUrl = "",
  onImageUrlChange,
  locale = "uk",
}) => {
  // Parse blocks on initial load or change
  const parsedData = useMemo(() => {
    let promptText = "";
    const extractedSnippets: DesignSnippets = {
      html: "",
      css: "",
      scss: "",
      tailwind: "",
      previewHtml: "",
    };
    const extras: ContentBlock[] = [];

    (blocks || []).forEach((b) => {
      if (!b) return;
      if (b.type === "paragraph" && !promptText && (!b.id || b.id.includes("prompt") || b.id.includes("para"))) {
        promptText = b.text || "";
      } else if (b.type === "code") {
        const lang = (b.language || "").toLowerCase();
        if (lang === "html" && !extractedSnippets.html) extractedSnippets.html = b.code || "";
        else if (lang === "css" && !extractedSnippets.css) extractedSnippets.css = b.code || "";
        else if (lang === "scss" && !extractedSnippets.scss) extractedSnippets.scss = b.code || "";
        else if ((lang === "tailwind" || lang === "tailwindcss") && !extractedSnippets.tailwind)
          extractedSnippets.tailwind = b.code || "";
        else if (lang === "preview") extractedSnippets.previewHtml = b.code || "";
        else extras.push(b);
      } else {
        extras.push(b);
      }
    });

    // Default starter template if completely empty
    if (!promptText && !extractedSnippets.html && !extractedSnippets.css && !extractedSnippets.tailwind) {
      promptText = `Create a futuristic dark UI component with base color #03001C, peach accent #FFBCBC, refined typography, and smooth hover elevation.`;
      extractedSnippets.html = `<div class="ui-design-container">\n  <div class="glow-orb"></div>\n  <h3 class="title">${titleUk || "Luminous Card"}</h3>\n  <p class="desc">${descriptionUk || "Modern UI element with peach accent #FFBCBC"}</p>\n  <button class="action-btn">Дізнатися більше</button>\n</div>`;
      extractedSnippets.css = `.ui-design-container {\n  position: relative;\n  background: #03001C;\n  border: 1px solid #3A3F53;\n  border-radius: 16px;\n  padding: 24px;\n  color: #FFFFFF;\n  overflow: hidden;\n}\n.glow-orb {\n  position: absolute;\n  top: -20px;\n  right: -20px;\n  width: 100px;\n  height: 100px;\n  background: #FFBCBC;\n  filter: blur(40px);\n  opacity: 0.3;\n}\n.title {\n  color: #FFBCBC;\n  font-size: 20px;\n  font-weight: 700;\n  margin-bottom: 8px;\n}\n.desc {\n  color: #A8ADC0;\n  font-size: 14px;\n  line-height: 1.6;\n}\n.action-btn {\n  margin-top: 16px;\n  background: #FFBCBC;\n  color: #03001C;\n  font-weight: 600;\n  padding: 8px 18px;\n  border-radius: 8px;\n  border: none;\n  cursor: pointer;\n}`;
      extractedSnippets.scss = `$bg: #03001C;\n$accent: #FFBCBC;\n$border: #3A3F53;\n\n.ui-design-container {\n  position: relative;\n  background: $bg;\n  border: 1px solid $border;\n  border-radius: 1rem;\n  padding: 1.5rem;\n  color: #fff;\n  overflow: hidden;\n\n  .title {\n    color: $accent;\n    font-size: 1.25rem;\n    font-weight: 700;\n  }\n\n  .desc {\n    color: #A8ADC0;\n    font-size: 0.875rem;\n  }\n}`;
      extractedSnippets.tailwind = `<div className="relative overflow-hidden rounded-2xl bg-[#03001C] border border-[#3A3F53] p-6 text-white shadow-2xl">\n  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#FFBCBC]/30 blur-2xl pointer-events-none" />\n  <h3 className="text-xl font-bold text-[#FFBCBC] mb-2">${titleUk || "Luminous Card"}</h3>\n  <p className="text-sm text-slate-300 mb-4">${descriptionUk || "Modern UI element with peach accent #FFBCBC"}</p>\n  <button className="px-4 py-2 rounded-lg bg-[#FFBCBC] text-[#03001C] font-semibold text-xs tracking-wider shadow hover:opacity-90 transition-opacity">\n    Дізнатися більше\n  </button>\n</div>`;
    }

    return { prompt: promptText, snippets: extractedSnippets, extraBlocks: extras };
  }, [blocks, descriptionUk, titleUk]);

  const [prompt, setPrompt] = useState<string>(parsedData.prompt);
  const [snippets, setSnippets] = useState<DesignSnippets>(parsedData.snippets);
  const [extraBlocks, setExtraBlocks] = useState<ContentBlock[]>(parsedData.extraBlocks);
  const [activeCodeTab, setActiveCodeTab] = useState<"html" | "css" | "scss" | "tailwind" | "preview">("html");
  const [previewPreset, setPreviewPreset] = useState<string>("custom");
  const [showBlockEditor, setShowBlockEditor] = useState<boolean>(false);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // Sync back to blocks array whenever internal state changes
  const syncBlocks = (
    newPrompt: string,
    newSnippets: DesignSnippets,
    newExtras: ContentBlock[]
  ) => {
    const generatedBlocks: ContentBlock[] = [];

    // 1. Prompt paragraph block
    if (newPrompt.trim()) {
      generatedBlocks.push({
        id: "design-prompt",
        type: "paragraph",
        text: newPrompt.trim(),
      });
    }

    // 2. Code snippet blocks
    if (newSnippets.html.trim()) {
      generatedBlocks.push({
        id: "snippet-html",
        type: "code",
        language: "html",
        code: newSnippets.html.trim(),
      });
    }

    if (newSnippets.css.trim()) {
      generatedBlocks.push({
        id: "snippet-css",
        type: "code",
        language: "css",
        code: newSnippets.css.trim(),
      });
    }

    if (newSnippets.scss.trim()) {
      generatedBlocks.push({
        id: "snippet-scss",
        type: "code",
        language: "scss",
        code: newSnippets.scss.trim(),
      });
    }

    if (newSnippets.tailwind.trim()) {
      generatedBlocks.push({
        id: "snippet-tailwind",
        type: "code",
        language: "tailwind",
        code: newSnippets.tailwind.trim(),
      });
    }

    if (newSnippets.previewHtml && newSnippets.previewHtml.trim()) {
      generatedBlocks.push({
        id: "preview-html",
        type: "code",
        language: "preview",
        code: newSnippets.previewHtml.trim(),
      });
    }

    // 3. Any additional blocks
    generatedBlocks.push(...newExtras);

    onChange(generatedBlocks);
  };

  const handlePromptChange = (val: string) => {
    setPrompt(val);
    syncBlocks(val, snippets, extraBlocks);
  };

  const handleSnippetChange = (key: keyof DesignSnippets, val: string) => {
    const updated = { ...snippets, [key]: val };
    setSnippets(updated);
    syncBlocks(prompt, updated, extraBlocks);
  };

  const handleExtraBlocksChange = (newExtras: ContentBlock[]) => {
    setExtraBlocks(newExtras);
    syncBlocks(prompt, snippets, newExtras);
  };

  const handleGenerateStarter = () => {
    const starterPrompt = `Design a high-contrast dark mode component for "${titleUk || "Modern UI"}". Use background #03001C, peach highlight #FFBCBC, sleek borders (#3A3F53), subtle blurred ambient glows, and clean typography.`;
    const starterHtml = `<div class="design-card">\n  <div class="ambient-glow"></div>\n  <h4 class="card-title">${titleUk || "UI Component"}</h4>\n  <p class="card-desc">${descriptionUk || "High performance aesthetic UI element"}</p>\n  <div class="badge">PRO DESIGN</div>\n</div>`;
    const starterCss = `.design-card {\n  position: relative;\n  background: #03001C;\n  border: 1px solid #3A3F53;\n  border-radius: 16px;\n  padding: 24px;\n  color: #fff;\n  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);\n}\n.ambient-glow {\n  position: absolute;\n  top: 0;\n  right: 0;\n  width: 120px;\n  height: 120px;\n  background: #FFBCBC;\n  opacity: 0.25;\n  filter: blur(50px);\n}\n.card-title {\n  color: #FFBCBC;\n  font-size: 18px;\n  font-weight: 700;\n}\n.card-desc {\n  color: #94a3b8;\n  font-size: 13px;\n  margin-top: 6px;\n}\n.badge {\n  display: inline-block;\n  margin-top: 14px;\n  font-size: 11px;\n  font-weight: bold;\n  padding: 4px 10px;\n  border-radius: 9999px;\n  background: #FFBCBC;\n  color: #03001C;\n}`;
    const starterScss = `$bg: #03001C;\n$accent: #FFBCBC;\n$border: #3A3F53;\n\n.design-card {\n  background: $bg;\n  border: 1px solid $border;\n  border-radius: 1rem;\n  padding: 1.5rem;\n  color: #fff;\n\n  .card-title {\n    color: $accent;\n    font-weight: bold;\n  }\n}`;
    const starterTailwind = `<div className="relative rounded-2xl bg-[#03001C] border border-[#3A3F53] p-6 text-white shadow-2xl">\n  <div className="absolute top-0 right-0 w-28 h-28 bg-[#FFBCBC]/25 blur-3xl pointer-events-none" />\n  <h4 className="text-lg font-bold text-[#FFBCBC]">${titleUk || "UI Component"}</h4>\n  <p className="text-xs text-slate-400 mt-1.5">${descriptionUk || "High performance aesthetic UI element"}</p>\n  <span className="inline-block mt-4 text-[11px] font-bold px-3 py-1 rounded-full bg-[#FFBCBC] text-[#03001C]">\n    PRO DESIGN\n  </span>\n</div>`;

    setPrompt(starterPrompt);
    const updatedSnippets: DesignSnippets = {
      html: starterHtml,
      css: starterCss,
      scss: starterScss,
      tailwind: starterTailwind,
      previewHtml: snippets.previewHtml || "",
    };
    setSnippets(updatedSnippets);
    syncBlocks(starterPrompt, updatedSnippets, extraBlocks);
    toast.success("Шаблони коду та промпт згенеровано!");
  };

  const handleCopy = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    toast.success(`${tabName.toUpperCase()} скопійовано!`);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Prompt Section */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FFBCBC]/15 text-[#FFBCBC]">
                <Wand2 className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-semibold">
                1. Промпт дизайну (Design Prompt)
              </CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateStarter}
              className="text-xs border-[#FFBCBC]/30 text-[#FFBCBC] hover:bg-[#FFBCBC]/10"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Згенерувати приклад
            </Button>
          </div>
          <CardDescription className="text-xs">
            Текстовий опис концепції, візуального стилю, колірних акцентів (#03001C, #FFBCBC) або AI-промпт для генерації.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={4}
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Введіть промпт або концепцію дизайну, наприклад: 'Design a modern dark UI card with ultra-dark background #03001C, peach accent #FFBCBC, subtle glowing aura and clean responsive typography...'"
            className="font-mono text-sm leading-relaxed bg-muted/20 border-border resize-y"
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Символів: {prompt.length}</span>
            {prompt && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleCopy(prompt, "Промпт")}
              >
                {copiedTab === "Промпт" ? (
                  <Check className="w-3.5 h-3.5 mr-1 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 mr-1" />
                )}
                Копіювати промпт
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Visual Preview Component Configuration */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FFBCBC]/15 text-[#FFBCBC]">
              <Eye className="w-4 h-4" />
            </div>
            <CardTitle className="text-base font-semibold">
              2. Прев'ю компонента (Visual Preview)
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Виберіть або налаштуйте візуальний вигляд картки для галереї (50/50 розбивка) та детальної сторінки.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Пресет візуалізації картки</Label>
              <Select
                value={previewPreset}
                onValueChange={(val) => {
                  setPreviewPreset(val);
                  if (val === "aurora" && !snippets.previewHtml) {
                    handleSnippetChange(
                      "previewHtml",
                      `<div class="relative w-full h-full min-h-[220px] bg-[#03001C] p-6 flex flex-col justify-between overflow-hidden">\n  <div class="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#FFBCBC]/30 blur-3xl pointer-events-none animate-pulse"></div>\n  <div class="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-violet-600/30 blur-3xl pointer-events-none"></div>\n  <span class="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-[#FFBCBC] text-[#03001C] w-fit">AURORA MESH</span>\n  <div class="space-y-2 max-w-[180px]">\n    <div class="h-2.5 w-24 rounded bg-white/40"></div>\n    <div class="h-2 w-32 rounded bg-white/20"></div>\n  </div>\n</div>`
                    );
                  }
                }}
              >
                <SelectTrigger className="bg-muted/20 border-border">
                  <SelectValue placeholder="Оберіть стиль прев'ю" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_PREVIEWS.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Зображення прев'ю (URL або завантаження)
              </Label>
              <Input
                placeholder="https://images.unsplash.com/... або залиште порожнім для коду"
                value={imageUrl || ""}
                onChange={(e) => onImageUrlChange?.(e.target.value)}
                className="bg-muted/20 border-border text-xs"
              />
            </div>
          </div>

          {/* Custom HTML Preview Snippet if desired */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                HTML / SVG код прев'ю (необов'язково, для індивідуального рендеру)
              </Label>
              {snippets.previewHtml && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-destructive"
                  onClick={() => handleSnippetChange("previewHtml", "")}
                >
                  Очистити
                </Button>
              )}
            </div>
            <Textarea
              rows={3}
              value={snippets.previewHtml || ""}
              onChange={(e) => handleSnippetChange("previewHtml", e.target.value)}
              placeholder="<div class='custom-preview'>...</div> (Якщо вказано, рендериться всередині правої половини картки)"
              className="font-mono text-xs bg-muted/20 border-border"
            />
          </div>

          {/* Interactive Card Preview Box (50/50 Layout) */}
          <div className="pt-2">
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
              Прев'ю відображення картки в стрічці (50/50 Split):
            </Label>
            <div className="w-full rounded-2xl border border-[#3A3F53] bg-[#03001C] overflow-hidden flex flex-col sm:flex-row min-h-[220px] shadow-2xl">
              {/* Left 50% */}
              <div className="w-full sm:w-1/2 p-6 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-[#3A3F53]/60 bg-[#03001C]">
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white tracking-tight">
                    {titleUk || "Назва дизайну"}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {descriptionUk || "Короткий опис компонента та його ключові візуальні особливості."}
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-2">
                  <div className="h-10 px-5 rounded-lg bg-[#FFBCBC] text-[#03001C] font-bold text-xs flex items-center justify-center shadow-md">
                    Переглянути
                  </div>
                  <div className="h-10 w-10 rounded-lg border border-[#3A3F53] bg-white/5 flex items-center justify-center text-slate-300">
                    ♡
                  </div>
                </div>
              </div>

              {/* Right 50% Visual Preview */}
              <div className="w-full sm:w-1/2 min-h-[180px] sm:min-h-full flex items-center justify-center relative overflow-hidden bg-[#08051E]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : snippets.previewHtml ? (
                  <div
                    className="w-full h-full min-h-[180px] overflow-hidden flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: snippets.previewHtml }}
                  />
                ) : (
                  <div className="relative w-full h-full min-h-[180px] p-6 flex flex-col justify-between bg-gradient-to-br from-[#03001C] via-[#1a0f3c] to-[#2c1328]">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#FFBCBC]/30 blur-2xl pointer-events-none animate-pulse" />
                    <div className="relative z-10 flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFBCBC] text-[#03001C]">
                        UI PREVIEW
                      </span>
                      <Sparkles className="w-4 h-4 text-[#FFBCBC]" />
                    </div>
                    <div className="relative z-10 text-xs font-mono text-slate-300">
                      50/50 Flush Canvas
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Code Snippets Section (HTML, CSS, SCSS, Tailwind) */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FFBCBC]/15 text-[#FFBCBC]">
                <FileCode className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-semibold">
                3. Фрагменти коду (Code Snippets)
              </CardTitle>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() =>
                  handleCopy(
                    snippets[activeCodeTab as keyof DesignSnippets] || "",
                    activeCodeTab
                  )
                }
              >
                {copiedTab === activeCodeTab ? (
                  <Check className="w-3.5 h-3.5 mr-1 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 mr-1" />
                )}
                Копіювати {activeCodeTab.toUpperCase()}
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            Заповніть готові до копіювання фрагменти для кожної з вкладок на детальній сторінці дизайну.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={activeCodeTab}
            onValueChange={(v) => setActiveCodeTab(v as any)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full bg-muted/40 p-1">
              <TabsTrigger value="html" className="text-xs font-semibold">
                HTML {snippets.html ? "✓" : ""}
              </TabsTrigger>
              <TabsTrigger value="css" className="text-xs font-semibold">
                CSS {snippets.css ? "✓" : ""}
              </TabsTrigger>
              <TabsTrigger value="scss" className="text-xs font-semibold">
                SCSS {snippets.scss ? "✓" : ""}
              </TabsTrigger>
              <TabsTrigger value="tailwind" className="text-xs font-semibold">
                Tailwind {snippets.tailwind ? "✓" : ""}
              </TabsTrigger>
            </TabsList>

            {/* HTML Tab */}
            <TabsContent value="html" className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-mono text-muted-foreground">
                  HTML розмітка компонента
                </Label>
                <span className="text-xs text-muted-foreground">
                  {snippets.html.split("\n").length} рядків
                </span>
              </div>
              <Textarea
                rows={10}
                value={snippets.html}
                onChange={(e) => handleSnippetChange("html", e.target.value)}
                placeholder="<div class='my-component'>\n  ...\n</div>"
                className="font-mono text-xs bg-[#03001C] text-slate-100 border-[#3A3F53] leading-relaxed resize-y"
              />
            </TabsContent>

            {/* CSS Tab */}
            <TabsContent value="css" className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-mono text-muted-foreground">
                  CSS стилі компонента
                </Label>
                <span className="text-xs text-muted-foreground">
                  {snippets.css.split("\n").length} рядків
                </span>
              </div>
              <Textarea
                rows={10}
                value={snippets.css}
                onChange={(e) => handleSnippetChange("css", e.target.value)}
                placeholder=".my-component {\n  background: #03001C;\n  ...\n}"
                className="font-mono text-xs bg-[#03001C] text-slate-100 border-[#3A3F53] leading-relaxed resize-y"
              />
            </TabsContent>

            {/* SCSS Tab */}
            <TabsContent value="scss" className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-mono text-muted-foreground">
                  SCSS стилі & змінні
                </Label>
                <span className="text-xs text-muted-foreground">
                  {snippets.scss.split("\n").length} рядків
                </span>
              </div>
              <Textarea
                rows={10}
                value={snippets.scss}
                onChange={(e) => handleSnippetChange("scss", e.target.value)}
                placeholder="$bg: #03001C;\n$accent: #FFBCBC;\n\n.my-component {\n  ...\n}"
                className="font-mono text-xs bg-[#03001C] text-slate-100 border-[#3A3F53] leading-relaxed resize-y"
              />
            </TabsContent>

            {/* Tailwind Tab */}
            <TabsContent value="tailwind" className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-mono text-muted-foreground">
                  Tailwind CSS JSX / HTML
                </Label>
                <span className="text-xs text-muted-foreground">
                  {snippets.tailwind.split("\n").length} рядків
                </span>
              </div>
              <Textarea
                rows={10}
                value={snippets.tailwind}
                onChange={(e) => handleSnippetChange("tailwind", e.target.value)}
                placeholder="<div className='rounded-2xl bg-[#03001C] border border-[#3A3F53] p-6 text-white'>\n  ...\n</div>"
                className="font-mono text-xs bg-[#03001C] text-slate-100 border-[#3A3F53] leading-relaxed resize-y"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 4. Optional Additional Block Editor */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader
          className="cursor-pointer select-none pb-3"
          onClick={() => setShowBlockEditor(!showBlockEditor)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  4. Додаткові інформаційні блоки (Optional Blocks)
                </CardTitle>
                <CardDescription className="text-xs">
                  {extraBlocks.length > 0
                    ? `Додано додаткових блоків: ${extraBlocks.length}`
                    : "Додайте додаткові абзаци, списки або пояснення для детальної сторінки"}
                </CardDescription>
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
              {showBlockEditor ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {showBlockEditor && (
          <CardContent className="space-y-4 pt-0">
            <BlockEditor
              value={extraBlocks}
              onChange={handleExtraBlocksChange}
              label="Додаткові блоки контенту"
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DesignEntryEditor;
