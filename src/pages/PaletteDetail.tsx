import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Heart,
  ImageIcon,
  Share2,
  Tag,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { localizeEntry, useModeEntry, useToggleModeEntryLike } from "@/hooks/useModeEntries";
import { blocksToPlainText } from "@/lib/blocks";
import { getLikedEntries, setEntryLiked, shareEntry } from "@/lib/shareEntry";
import {
  extractColorsFromEntry,
  generateColorSnippets,
  type ColorSwatch,
} from "@/lib/colors";

const PaletteDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: entry, isLoading } = useModeEntry(id);
  const toggleLike = useToggleModeEntryLike();

  const [liked, setLiked] = useState(false);
  const [likeOffset, setLikeOffset] = useState(0);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<Record<string, "css" | "scss" | "tailwind">>({});

  useEffect(() => {
    setLiked(getLikedEntries().includes(id));
    setLikeOffset(0);
  }, [id]);

  const loc = entry ? localizeEntry(entry, language) : null;

  const swatches: ColorSwatch[] = useMemo(() => {
    if (!entry) return [];
    return extractColorsFromEntry(entry);
  }, [entry]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    toast.success(`Скопійовано ${label}: ${text}`);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Завантаження палітри...</p>
        </div>
      </PageLayout>
    );
  }

  if (!entry || !loc) {
    return (
      <PageLayout>
        <div className="py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold">Палітру не знайдено</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад до палітр
          </Button>
        </div>
      </PageLayout>
    );
  }

  const likes = Math.max(0, (entry.likes ?? 0) + likeOffset);

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikeOffset((prev) => prev + (next ? 1 : -1));
    setEntryLiked(entry.id, next);
    toggleLike.mutate({ entryId: entry.id, isLiking: next });
  };

  const canonicalUrl = language === "en"
    ? (entry.canonical_url_en || entry.canonical_url_uk || undefined)
    : (entry.canonical_url_uk || entry.canonical_url_en || undefined);

  return (
    <PageLayout>
      <SEO
        title={`${loc.title} — Палітра кольорів`}
        description={loc.description || blocksToPlainText(loc.blocks).slice(0, 155)}
        path={`/palette/${entry.id}`}
        image={entry.image_url ?? undefined}
        type="article"
        canonicalUrl={canonicalUrl}
      />

      <article className="max-w-5xl mx-auto pb-20">
        {/* Top Bar: Back Button */}
        <div id="palette-top-bar" className="mb-6 flex items-center justify-between">
          <Button
            id="palette-back-btn"
            variant="ghost"
            className="-ml-2 text-neutral-300 hover:text-black inline-flex items-center text-sm font-medium"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>

        {/* Header Section: Title, Meta, Actions & Website Preview */}
        <header className="mb-12">
          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#2F2F2F] text-[#8ABEB9] border border-[#454545]"
                >
                  <Tag className="w-3 h-3 text-[#8ABEB9]" aria-hidden="true" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mb-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-100 leading-tight">
              {loc.title}
            </h1>
          </div>

          {loc.description && (
            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-3xl">
              {loc.description}
            </p>
          )}

          {/* Action Buttons Row directly below the short description */}
          <div
            id="palette-header-actions"
            className="flex flex-row items-center gap-3 mt-6 mb-8"
          >
            {entry.external_url && (
              <Button
                asChild
                className="bg-[#8ABEB9] hover:bg-[#78aca7] text-[#141414] font-semibold h-10 px-5 gap-2 shrink-0 shadow-md"
              >
                <a href={entry.external_url} target="_blank" rel="noopener noreferrer">
                  Переглянути сайт
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              </Button>
            )}

            <Button
              variant="secondary"
              onClick={handleLike}
              aria-pressed={liked}
              aria-label="Вподобати"
              className="bg-[#201E1E] hover:bg-[#2A2727] text-neutral-200 hover:text-[#8ABEB9] border border-[#322F2F] h-10 px-4 text-xs sm:text-sm font-medium rounded-lg transition-colors"
            >
              <Heart
                className={`w-4 h-4 mr-2 transition-colors ${
                  liked ? "fill-[#8ABEB9] text-[#8ABEB9]" : ""
                }`}
                aria-hidden="true"
              />
              {likes}
            </Button>

            <Button
              variant="secondary"
              onClick={() => shareEntry(entry.id, loc.title, `/palette/${entry.id}`)}
              aria-label="Поділитися"
              className="bg-[#201E1E] hover:bg-[#2A2727] text-neutral-200 hover:text-[#8ABEB9] border border-[#322F2F] h-10 px-4 text-xs sm:text-sm font-medium rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
              Поділитися
            </Button>
          </div>

          {/* Website Preview Image */}
          <figure id="palette-preview-media" className="relative w-full rounded-2xl overflow-hidden bg-[#1E1E1E] border border-[#3E3E3E] shadow-2xl">
            <div className="aspect-[16/9] sm:aspect-[21/9] w-full flex items-center justify-center">
              {entry.image_url ? (
                <img
                  src={entry.image_url}
                  alt={loc.title}
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#242424] text-neutral-500 gap-3">
                  <ImageIcon className="w-16 h-16" aria-hidden="true" />
                  <span className="text-sm">Прев'ю інтерфейсу сайту</span>
                </div>
              )}
            </div>

            {entry.image_source_url && (
              <figcaption className="p-2.5 bg-[#1F1F1F]/90 text-right pr-4 border-t border-[#333]">
                <a
                  href={entry.image_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-400 underline hover:text-[#8ABEB9] transition-colors"
                >
                  Джерело знімку сайту
                </a>
              </figcaption>
            )}
          </figure>
        </header>

        {/* Main "Color Palette" Section */}
        <section id="color-palette-section" className="mb-14">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-100 tracking-tight flex items-center gap-3">
              <span className="w-2 h-6 bg-[#8ABEB9] rounded-full inline-block" />
              Палітра кольорів (Color Palette)
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Детальні характеристики кожного кольору з конвертацією значень та готовими фрагментами коду для розробки.
            </p>
          </div>

          {/* List of individual color cards */}
          <div className="space-y-8">
            {swatches.map((swatch, index) => {
              const defaultSnippets = generateColorSnippets(swatch, index);
              const snippets = {
                css: swatch.css_snippet || defaultSnippets.css,
                scss: swatch.scss_snippet || defaultSnippets.scss,
                tailwind: swatch.tailwind_snippet || defaultSnippets.tailwind,
              };
              const currentFormat = selectedFormat[swatch.hex] || "css";
              const badgeLabel = swatch.badge !== undefined && swatch.badge !== "" ? swatch.badge : index + 1;

              return (
                <div
                  key={`${swatch.hex}-${index}`}
                  id={`color-swatch-card-${index}`}
                  className="rounded-2xl bg-[#181717] border border-[#292626] p-6 sm:p-7 shadow-lg transition-all hover:border-[#8ABEB9]/50"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Visual Color Swatch & Value Converters */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        {/* 1. Visual Color Swatch Box */}
                        <div
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-[#3A3737] shadow-md relative overflow-hidden shrink-0 flex items-end justify-end p-2 cursor-pointer transition-transform hover:scale-105"
                          style={{ backgroundColor: swatch.hex }}
                          onClick={() => handleCopy(swatch.hex, "HEX")}
                          title="Клікніть, щоб скопіювати HEX"
                        >
                          <span className="bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                            {badgeLabel}
                          </span>
                        </div>

                        {/* Swatch Title & Role */}
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#222020] text-[#8ABEB9] border border-[#322F2F] mb-1.5">
                            {swatch.subtitle || swatch.role || `Color ${index + 1}`}
                          </span>
                          <h3 className="text-xl font-bold text-neutral-100 leading-tight">
                            {swatch.name || swatch.hex}
                          </h3>
                          <p className="text-xs text-neutral-400 mt-1">
                            {swatch.description || "Клікніть на значення нижче для швидкого копіювання"}
                          </p>
                        </div>
                      </div>

                      {/* 2. Color Values Converted into multiple formats (HEX, RGB, HSL) */}
                      <div className="space-y-2 pt-2 border-t border-[#292626]">
                        {/* HEX */}
                        <div className="flex items-center justify-between bg-[#121111] hover:bg-[#151414] px-3.5 py-2.5 rounded-lg border border-[#262424] transition-colors">
                          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            HEX
                          </span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-[#8ABEB9] font-bold">
                              {swatch.hex}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-neutral-400 hover:text-white"
                              onClick={() => handleCopy(swatch.hex, "HEX")}
                              title="Копіювати HEX"
                            >
                              {copiedValue === swatch.hex ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* RGB */}
                        <div className="flex items-center justify-between bg-[#121111] hover:bg-[#151414] px-3.5 py-2.5 rounded-lg border border-[#262424] transition-colors">
                          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            RGB
                          </span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-neutral-200">
                              {swatch.rgb}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-neutral-400 hover:text-white"
                              onClick={() => handleCopy(swatch.rgb, "RGB")}
                              title="Копіювати RGB"
                            >
                              {copiedValue === swatch.rgb ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* HSL */}
                        <div className="flex items-center justify-between bg-[#121111] hover:bg-[#151414] px-3.5 py-2.5 rounded-lg border border-[#262424] transition-colors">
                          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            HSL
                          </span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-neutral-200">
                              {swatch.hsl}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-neutral-400 hover:text-white"
                              onClick={() => handleCopy(swatch.hsl, "HSL")}
                              title="Копіювати HSL"
                            >
                              {copiedValue === swatch.hsl ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* OKLCH */}
                        <div className="flex items-center justify-between bg-[#121111] hover:bg-[#151414] px-3.5 py-2.5 rounded-lg border border-[#262424] transition-colors">
                          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            OKLCH
                          </span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-neutral-200">
                              {swatch.oklch}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-neutral-400 hover:text-white"
                              onClick={() => handleCopy(swatch.oklch, "OKLCH")}
                              title="Копіювати OKLCH"
                            >
                              {copiedValue === swatch.oklch ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: 3. Code Snippets (CSS, SCSS, Tailwind CSS, OKLCH) */}
                    <div className="lg:col-span-7 flex flex-col h-full">
                      <div className="bg-[#121111] rounded-xl border border-[#292626] p-4 flex flex-col h-full shadow-inner">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#262424]">
                          <div className="flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-[#8ABEB9]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                              Інтеграція в код
                            </span>
                          </div>

                          {/* Code format selector tabs */}
                          <div className="flex items-center gap-1 bg-[#0A0909] p-1 rounded-lg border border-[#222020]">
                            {(["css", "scss", "tailwind"] as const).map((fmt) => (
                              <button
                                key={fmt}
                                type="button"
                                onClick={() =>
                                  setSelectedFormat((prev) => ({ ...prev, [swatch.hex]: fmt }))
                                }
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors uppercase ${
                                  currentFormat === fmt
                                    ? "bg-[#8ABEB9] text-[#0F0E0E] shadow-sm"
                                    : "text-neutral-400 hover:text-white"
                                }`}
                              >
                                {fmt === "tailwind" ? "Tailwind" : fmt}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Code snippet display area */}
                        <div className="relative flex-1">
                          <pre className="p-3.5 rounded-lg bg-[#0A0909] border border-[#222020] text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed">
                            {currentFormat === "css" && snippets.css}
                            {currentFormat === "scss" && snippets.scss}
                            {currentFormat === "tailwind" && snippets.tailwind}
                          </pre>

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const snippetText =
                                currentFormat === "css"
                                  ? snippets.css
                                  : currentFormat === "scss"
                                  ? snippets.scss
                                  : snippets.tailwind;
                              handleCopy(
                                snippetText,
                                currentFormat === "tailwind"
                                  ? "Tailwind snippet"
                                  : `${currentFormat.toUpperCase()} snippet`
                              );
                            }}
                            className="absolute top-2.5 right-2.5 h-7 px-2.5 text-[11px] bg-[#1E1C1C] hover:bg-[#2A2727] text-neutral-200 border border-[#353232] shadow-sm gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            Копіювати код
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </article>
    </PageLayout>
  );
};

export default PaletteDetail;
