import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Copy,
  Heart,
  Share2,
  Sparkles,
  Code2,
  Terminal,
  Layers,
  Palette,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useMode } from "@/hooks/useMode";
import { localizeEntry, useModeEntry, useToggleModeEntryLike } from "@/hooks/useModeEntries";
import { blocksToPlainText } from "@/lib/blocks";
import { getLikedEntries, setEntryLiked, shareEntry } from "@/lib/shareEntry";
import { ItemTagsList } from "@/components/ItemTagBadge";

type CodeTab = "html" | "css" | "scss" | "tailwind";

export const DesignDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { setMode } = useMode();
  const { data: entry, isLoading } = useModeEntry(id);
  const toggleLike = useToggleModeEntryLike();

  const [liked, setLiked] = useState(false);
  const [likeOffset, setLikeOffset] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<CodeTab>("html");

  // Enforce Design mode and design tokens (#FFBCBC on #030008)
  useEffect(() => {
    setMode("design");
  }, [setMode]);

  useEffect(() => {
    setLiked(getLikedEntries().includes(id));
    setLikeOffset(0);
  }, [id]);

  const loc = entry ? localizeEntry(entry, language) : null;

  // Extract prompt & code snippets from blocks
  const designData = useMemo(() => {
    if (!loc || !loc.blocks) {
      return {
        prompt: "",
        snippets: {
          html: "<!-- No HTML snippet available -->",
          css: "/* No CSS snippet available */",
          scss: "// No SCSS snippet available",
          tailwind: "<!-- No Tailwind snippet available -->",
        },
      };
    }

    let prompt = "";
    const snippets: Record<CodeTab, string> = {
      html: "",
      css: "",
      scss: "",
      tailwind: "",
    };

    loc.blocks.forEach((block: any) => {
      if (block.type === "paragraph" && !prompt) {
        prompt = block.text;
      } else if (block.type === "code") {
        const lang = (block.language || "").toLowerCase();
        if (lang === "html") snippets.html = block.code;
        else if (lang === "css") snippets.css = block.code;
        else if (lang === "scss") snippets.scss = block.code;
        else if (lang === "tailwind" || lang === "tailwindcss") snippets.tailwind = block.code;
      }
    });

    // Fallbacks if not explicitly provided
    if (!prompt) {
      prompt = `Design a modern dark UI component using base #1E212D with peach accent #FFBCBC, subtle glowing shadows, and high contrast typography for SaaS interfaces.`;
    }

    if (!snippets.html && !snippets.css && !snippets.tailwind) {
      snippets.html = `<div class="ui-design-container">\n  <h3 class="title">${loc.title}</h3>\n  <p class="desc">${loc.description}</p>\n</div>`;
      snippets.css = `.ui-design-container {\n  background: #1E212D;\n  border: 1px solid #3A3F53;\n  border-radius: 16px;\n  padding: 24px;\n  color: #FFFFFF;\n}\n.title {\n  color: #FFBCBC;\n  font-size: 20px;\n  font-weight: 700;\n}`;
      snippets.scss = `$bg: #1E212D;\n$accent: #FFBCBC;\n\n.ui-design-container {\n  background: $bg;\n  border: 1px solid #3A3F53;\n  border-radius: 1rem;\n  padding: 1.5rem;\n\n  .title {\n    color: $accent;\n  }\n}`;
      snippets.tailwind = `<div className="rounded-2xl bg-[#1E212D] border border-[#3A3F53] p-6 text-white shadow-xl hover:border-[#FFBCBC] transition-colors">\n  <h3 className="text-xl font-bold text-[#FFBCBC] mb-2">${loc.title}</h3>\n  <p className="text-sm text-slate-300">${loc.description}</p>\n</div>`;
    }

    return { prompt, snippets };
  }, [loc]);

  const handleCopyCode = () => {
    const codeToCopy = designData.snippets[activeTab] || "";
    navigator.clipboard.writeText(codeToCopy);
    setCopiedCode(true);
    toast.success(language === "en" ? `Code (${activeTab.toUpperCase()}) copied!` : `Код (${activeTab.toUpperCase()}) скопійовано!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(designData.prompt);
    setCopiedPrompt(true);
    toast.success(language === "en" ? "Design prompt copied to clipboard!" : "Промпт дизайну скопійовано в буфер!");
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleLike = () => {
    if (!entry) return;
    const next = !liked;
    setLiked(next);
    setLikeOffset((prev) => prev + (next ? 1 : -1));
    setEntryLiked(entry.id, next);
    toggleLike.mutate({ entryId: entry.id, isLiking: next });
  };

  const handleShare = () => {
    if (!entry || !loc) return;
    shareEntry(entry.id, loc.title, `/design/${entry.id}`);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">{language === "en" ? "Loading design..." : "Завантаження дизайну..."}</p>
        </div>
      </PageLayout>
    );
  }

  if (!entry || !loc) {
    return (
      <PageLayout>
        <div className="py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold">{language === "en" ? "Design not found" : "Дизайн не знайдено"}</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('detail.back')}
          </Button>
        </div>
      </PageLayout>
    );
  }

  const likes = Math.max(0, (entry.likes ?? 0) + likeOffset);

  // Large Visual Preview Render
  const renderLargeVisual = () => {
    // 1. If custom image provided
    if (entry.image_url) {
      return (
        <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden bg-[#03001C] border border-[#3A3F53] shadow-2xl flex items-center justify-center">
          <img
            src={entry.image_url}
            alt={loc?.title || "Design preview"}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    // 2. If custom preview code block provided
    const previewBlock = loc?.blocks?.find(
      (b: any) => b && b.type === "code" && b.language?.toLowerCase() === "preview"
    );
    if (previewBlock?.code) {
      return (
        <div
          className="relative w-full min-h-[280px] sm:min-h-[340px] rounded-2xl overflow-hidden bg-[#08051E] border border-[#3A3F53] shadow-2xl p-6 flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: previewBlock.code }}
        />
      );
    }

    const entryId = (entry.id || "").toLowerCase();

    if (entryId.includes("aurora")) {
      return (
        <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden bg-[#1E212D] p-8 flex flex-col justify-between border border-[#3A3F53] shadow-2xl">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#FFBCBC]/45 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-10 -left-8 w-56 h-56 rounded-full bg-violet-600/40 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider text-[#1E212D] bg-[#FFBCBC] shadow-lg shadow-[#FFBCBC]/20">
              <Sparkles className="w-3.5 h-3.5" />
              AURORA MESH GRADIENT
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBCBC] animate-ping" />
              <span className="text-xs font-mono text-slate-300">60 FPS Render</span>
            </div>
          </div>

          <div className="relative z-10 max-w-md space-y-2 bg-[#1E212D]/60 backdrop-blur-md p-5 rounded-xl border border-white/10">
            <h4 className="text-lg font-bold text-white">Luminous Generative Mesh</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Multi-stop radial color dispersion designed specifically for high-contrast dark workspaces.
            </p>
          </div>
        </div>
      );
    }

    if (entryId.includes("glass")) {
      return (
        <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1E212D] via-[#2A202A] to-[#1E212D] p-8 flex items-center justify-center border border-[#3A3F53] shadow-2xl">
          <div className="absolute top-8 left-12 w-36 h-36 rounded-full bg-[#FFBCBC]/30 blur-2xl pointer-events-none" />
          <div className="absolute bottom-8 right-12 w-32 h-32 rounded-full bg-violet-500/25 blur-2xl pointer-events-none" />

          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white/[0.07] backdrop-blur-xl p-6 border border-[#FFBCBC]/40 shadow-2xl space-y-4 hover:border-[#FFBCBC]/80 transition-all duration-300 hover:shadow-[#FFBCBC]/10">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-[#FFBCBC] bg-[#FFBCBC]/15 border border-[#FFBCBC]/30">
                FROSTED GLASS 24PX
              </span>
              <span className="text-xs font-mono text-[#FFBCBC]">CSS Backdrop</span>
            </div>
            <h4 className="text-base font-bold text-white">Refractive Glass Panel</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hardware-accelerated blurred backdrop with 1px translucent gradient boundary.
            </p>
          </div>
        </div>
      );
    }

    if (entryId.includes("neon") || entryId.includes("button")) {
      return (
        <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden bg-[#161922] p-8 flex flex-col items-center justify-center border border-[#3A3F53] shadow-2xl gap-6">
          <div className="relative p-[3px] rounded-full overflow-hidden shadow-2xl shadow-[#FFBCBC]/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer">
            <div className="absolute -inset-[200%] animate-[spin_3.5s_linear_infinite] bg-[conic-gradient(from_0deg,#FFBCBC,#8B5CF6,#FFBCBC)]" />
            <div className="relative flex items-center gap-3 px-8 py-4 rounded-full bg-[#1E212D] text-[#FFBCBC] font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBCBC] animate-pulse" />
              CYBER NEON ACTION BUTTON
            </div>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Hover & Click to test interactive scale & conic glow
          </p>
        </div>
      );
    }

    if (entryId.includes("sphere") || entryId.includes("sunset")) {
      return (
        <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden bg-[#161922] p-8 flex flex-col items-center justify-center border border-[#3A3F53] shadow-2xl">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFF0F0_0%,#FFBCBC_35%,#9E4770_70%,#1E212D_100%)] shadow-2xl shadow-[#FFBCBC]/30 animate-bounce duration-1000" />
          <div className="w-32 h-4 rounded-full bg-black/60 blur-md mt-6" />
        </div>
      );
    }

    if (entryId.includes("bento") || entryId.includes("stat")) {
      return (
        <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden bg-[#242836] p-8 flex flex-col justify-between border border-[#3A3F53] shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A8ADC0] tracking-wider uppercase">Cluster Performance</span>
            <span className="text-xs font-bold text-[#FFBCBC] bg-[#FFBCBC]/15 px-2.5 py-1 rounded-full border border-[#FFBCBC]/20">
              +24.8% Active
            </span>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              1,482 <span className="text-lg font-medium text-[#FFBCBC]">live pods</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Real-time distributed node telemetry</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Capacity utilization</span>
              <span className="text-[#FFBCBC] font-mono">78.4%</span>
            </div>
            <div className="w-full h-2.5 bg-[#313647] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 via-[#FFBCBC] to-[#FFBCBC] rounded-full w-[78%]" />
            </div>
          </div>
        </div>
      );
    }

    if (entryId.includes("toggle") || entryId.includes("pill")) {
      return (
        <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden bg-[#161922] p-8 flex flex-col items-center justify-center border border-[#3A3F53] shadow-2xl gap-4">
          <div className="inline-flex bg-[#1E212D] border border-[#3A3F53] p-1.5 rounded-full gap-1.5 shadow-2xl shadow-black/60">
            <button className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#FFBCBC] text-[#1E212D] shadow-lg shadow-[#FFBCBC]/25">
              {language === "en" ? "Design" : "Дизайн"}
            </button>
            <button className="px-6 py-2.5 rounded-full text-xs font-semibold text-[#A8ADC0] hover:text-white transition-colors">
              {language === "en" ? "Code" : "Код"}
            </button>
            <button className="px-6 py-2.5 rounded-full text-xs font-semibold text-[#A8ADC0] hover:text-white transition-colors">
              {language === "en" ? "Styles" : "Стилі"}
            </button>
          </div>
          <span className="text-xs text-slate-400 font-mono">Interactive Segmented Pill Component</span>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1E212D] via-[#2A2E3D] to-[#3B2C35] p-8 flex flex-col justify-between border border-[#3A3F53] shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#FFBCBC_20%,transparent_60%)] opacity-50" />
        <div className="relative z-10 flex justify-between items-center">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFBCBC] text-[#1E212D]">
            UI SHOWCASE
          </span>
          <Sparkles className="w-5 h-5 text-[#FFBCBC]" />
        </div>
        <div className="relative z-10 space-y-2">
          <h4 className="text-2xl font-bold text-white">{loc.title}</h4>
          <p className="text-sm text-slate-300">{loc.description}</p>
        </div>
      </div>
    );
  };

  const tabs: { key: CodeTab; label: string }[] = [
    { key: "html", label: "HTML" },
    { key: "css", label: "CSS" },
    { key: "scss", label: "SCSS" },
    { key: "tailwind", label: "Tailwind CSS" },
  ];

  return (
    <PageLayout>
      <SEO
        title={`${loc.title} — ${language === "en" ? "Design" : "Дизайн та UI-Елементи"}`}
        description={loc.description || blocksToPlainText(loc.blocks).slice(0, 155)}
        path={`/design/${entry.id}`}
        image={entry.image_url ?? undefined}
        type="article"
      />

      <div className="max-w-6xl mx-auto pb-16 space-y-10">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
          <Button
            onClick={() => navigate("/")}
            className="h-10 px-4 rounded-xl text-sm font-semibold bg-transparent text-[#94A3B8] hover:bg-[#FFBCBC] hover:text-black [&:hover>svg]:text-black border-0 shadow-none inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-[#94A3B8] transition-colors" />
            <span>{t('detail.back')}</span>
          </Button>
        </div>

        {/* ================= HEADER SECTION ================= */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3 flex-1">
              {entry.tags && entry.tags.length > 0 && (
                <div className="mb-2">
                  <ItemTagsList tags={entry.tags} mode="design" />
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {loc.title}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
                {loc.description}
              </p>
            </div>

            {/* Action Buttons: Like & Share styled with #FFBCBC */}
            <div className="flex items-center gap-3 shrink-0 pt-2">
              <Button
                variant="outline"
                size="default"
                onClick={handleLike}
                aria-label={t('detail.like')}
                className={`gap-2 border-[#FFBCBC]/30 transition-all ${
                  liked
                    ? "bg-[#FFBCBC] text-[#030008] hover:bg-[#FFBCBC]/90 font-bold border-[#FFBCBC]"
                    : "bg-[#FFBCBC]/10 text-[#FFBCBC] hover:bg-[#FFBCBC] hover:text-[#030008]"
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                <span>{likes}</span>
              </Button>

              <Button
                variant="outline"
                size="default"
                onClick={handleShare}
                aria-label={t('detail.share')}
                className="gap-2 border-[#FFBCBC]/30 bg-[#FFBCBC]/10 text-[#FFBCBC] hover:bg-[#FFBCBC] hover:text-[#030008] transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>{t('detail.share')}</span>
              </Button>
            </div>
          </div>

          {/* Large Visual Preview Box */}
          <div className="w-full">
            {renderLargeVisual()}
          </div>
        </div>

        {/* ================= BODY SECTION (TWO COLUMNS) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Block: Prompt & Instructions */}
          <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                <Sparkles className="w-5 h-5 text-[#FFBCBC]" />
                <h3>{language === "en" ? "Prompt & Instructions" : "Промпт та Інструкції"}</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
                className="h-8 px-3 text-xs gap-1.5 border-[#FFBCBC]/30 bg-[#FFBCBC]/10 text-[#FFBCBC] hover:bg-[#FFBCBC] hover:text-[#030008] transition-all font-semibold"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? (language === "en" ? "Copied" : "Скопійовано") : (language === "en" ? "Copy Prompt" : "Скопіювати промпт")}</span>
              </Button>
            </div>

            {/* Prompt text display */}
            <div className="rounded-xl bg-[#161922] p-5 border border-[#3A3F53]/70">
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                "{designData.prompt}"
              </p>
            </div>

            {/* Design Spec Details */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {language === "en" ? "Parameters & Color Tokens" : "Параметри та Кольорові Токени"}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#161922] border border-[#3A3F53]/60 space-y-1">
                  <span className="text-muted-foreground block text-[11px]">{language === "en" ? "Background" : "Основний фон"}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#030008] border border-white/20" />
                    <span className="font-mono text-white font-bold">#030008</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#161922] border border-[#3A3F53]/60 space-y-1">
                  <span className="text-muted-foreground block text-[11px]">{language === "en" ? "Accent Color" : "Акцентний колір"}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FFBCBC]" />
                    <span className="font-mono text-[#FFBCBC] font-bold">#FFBCBC</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#161922] border border-[#3A3F53]/60 space-y-1">
                  <span className="text-muted-foreground block text-[11px]">{language === "en" ? "Border Color" : "Колір бордерів"}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3A3F53]" />
                    <span className="font-mono text-white font-bold">#3A3F53</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block: Tabbed Code Viewer */}
          <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/70">
              <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                <Code2 className="w-5 h-5 text-[#FFBCBC]" />
                <h3>{language === "en" ? "Source Code" : "Вихідний Код"}</h3>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="h-8 px-3 text-xs gap-1.5 border-[#FFBCBC]/30 bg-[#FFBCBC]/10 text-[#FFBCBC] hover:bg-[#FFBCBC] hover:text-[#03001C] transition-all font-semibold"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? (language === "en" ? "Copied" : "Скопійовано") : `${language === "en" ? "Copy" : "Скопіювати"} ${activeTab.toUpperCase()}`}</span>
              </Button>
            </div>

            {/* Interactive Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#161922] border border-[#3A3F53]/70">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.key
                      ? "bg-[#FFBCBC] text-[#03001C] shadow-md shadow-[#FFBCBC]/20"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code Block Container */}
            <div className="relative rounded-xl bg-[#161922] border border-[#3A3F53]/70 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-[#12141c] border-b border-[#3A3F53]/50 text-[11px] font-mono text-muted-foreground">
                <span>{activeTab.toUpperCase()} SNIPPET</span>
                <span className="text-[#FFBCBC]">UTF-8</span>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[380px] leading-relaxed whitespace-pre selection:bg-[#FFBCBC] selection:text-[#03001C]">
                <code>{designData.snippets[activeTab] || `// No snippet available for ${activeTab}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DesignDetail;
