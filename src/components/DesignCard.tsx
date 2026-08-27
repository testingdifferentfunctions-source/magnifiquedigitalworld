import { useState } from "react";
import { Heart, Share2, ArrowUpRight, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface DesignItem {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  likes?: number;
  url?: string | null;
  image_url?: string | null;
  blocks?: any[];
}

interface DesignCardProps {
  item: DesignItem;
  index: number;
  isLiked?: boolean;
  onView: () => void;
  onLike: () => void;
  onShare: () => void;
}

export const DesignCard = ({
  item,
  index,
  isLiked = false,
  onView,
  onLike,
  onShare,
}: DesignCardProps) => {
  const [copied, setCopied] = useState(false);

  // Render dynamic visual preview matching the design type - flush with container edges
  const renderVisualPreview = () => {
    // 1. If an image is provided
    const img = item.image_url || (item.url && (item.url.startsWith("http") || item.url.startsWith("/")) ? item.url : null);
    if (img && (img.endsWith(".png") || img.endsWith(".jpg") || img.endsWith(".jpeg") || img.endsWith(".webp") || img.endsWith(".svg") || img.includes("images.unsplash") || img.includes("supabase.co"))) {
      return (
        <div className="relative w-full h-full min-h-[240px] md:min-h-[340px] overflow-hidden bg-[#03001C]">
          <img
            src={img}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      );
    }

    // 2. If a custom preview code block is provided in blocks
    const previewBlock = item.blocks?.find((b: any) => b && b.type === "code" && b.language?.toLowerCase() === "preview");
    if (previewBlock?.code) {
      return (
        <div
          className="relative w-full h-full min-h-[240px] md:min-h-[340px] overflow-hidden flex items-center justify-center bg-[#08051E]"
          dangerouslySetInnerHTML={{ __html: previewBlock.code }}
        />
      );
    }

    const id = item.id.toLowerCase();

    if (id.includes("aurora")) {
      return (
        <div className="relative w-full h-full min-h-[240px] md:min-h-[340px] overflow-hidden bg-[#03001C] p-6 flex flex-col justify-between">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#FFBCBC]/30 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-violet-600/30 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-[#FFBCBC]/20 pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-md bg-[#FFBCBC] text-[#03001C] shadow-sm">
              AURORA MESH
            </span>
            <Sparkles className="w-5 h-5 text-[#FFBCBC]" />
          </div>

          <div className="relative z-10 space-y-2 max-w-[200px]">
            <div className="h-2.5 w-24 rounded bg-white/40" />
            <div className="h-2 w-36 rounded bg-white/20" />
            <div className="h-2 w-28 rounded bg-white/15" />
          </div>
        </div>
      );
    }

    if (id.includes("glass")) {
      return (
        <div className="relative w-full h-full min-h-[240px] md:min-h-[340px] overflow-hidden bg-gradient-to-br from-[#0c0827] via-[#170e30] to-[#03001C] p-6 flex items-center justify-center">
          <div className="absolute top-6 left-8 w-28 h-28 rounded-full bg-[#FFBCBC]/25 blur-2xl pointer-events-none" />
          <div className="absolute bottom-6 right-8 w-32 h-32 rounded-full bg-indigo-600/25 blur-2xl pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-[260px] rounded-2xl bg-white/[0.06] backdrop-blur-xl p-5 border border-white/20 shadow-2xl group-hover:border-[#FFBCBC]/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-[#FFBCBC] font-semibold">BLUR 24PX</span>
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBCBC] shadow-sm shadow-[#FFBCBC]" />
            </div>
            <div className="h-2.5 w-20 rounded bg-white/50 mb-2" />
            <div className="h-2 w-32 rounded bg-white/25 mb-1.5" />
            <div className="h-1.5 w-24 rounded bg-white/15" />
          </div>
        </div>
      );
    }

    if (id.includes("neon") || id.includes("button")) {
      return (
        <div className="relative w-full h-full min-h-[240px] md:min-h-[340px] overflow-hidden bg-[#06041a] p-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#FFBCBC_0%,transparent_65%)] opacity-10" />
          <div className="relative p-[2px] rounded-full overflow-hidden shadow-2xl group-hover:shadow-[#FFBCBC]/40 transition-shadow">
            <div className="absolute -inset-[200%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,#FFBCBC,#8B5CF6,#FFBCBC)]" />
            <div className="relative flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#03001C] text-[#FFBCBC] font-bold text-xs tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#FFBCBC] animate-ping" />
              CYBER NEON UI
            </div>
          </div>
        </div>
      );
    }

    if (id.includes("sphere") || id.includes("sunset")) {
      return (
        <div className="relative w-full h-full min-h-[240px] md:min-h-[340px] overflow-hidden bg-[#08051E] p-6 flex flex-col items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFF0F0_0%,#FFBCBC_35%,#9E4770_70%,#03001C_100%)] shadow-2xl shadow-[#FFBCBC]/25 transform group-hover:scale-110 transition-transform duration-500" />
          <div className="w-24 h-3 rounded-full bg-black/70 blur-md mt-4" />
        </div>
      );
    }

    if (id.includes("bento") || id.includes("stat")) {
      return (
        <div className="relative w-full h-full min-h-[240px] md:min-h-[340px] overflow-hidden bg-[#0a0624] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Bento Analytics</span>
            <span className="text-xs font-bold text-[#FFBCBC] bg-[#FFBCBC]/10 px-2 py-0.5 rounded-full border border-[#FFBCBC]/20">+34.8%</span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-white tracking-tight">
              2,840 <span className="text-xs font-normal text-[#FFBCBC]">active</span>
            </div>
            <div className="text-xs text-muted-foreground">Real-time rendering node</div>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 via-pink-400 to-[#FFBCBC] w-[80%]" />
          </div>
        </div>
      );
    }

    if (id.includes("toggle") || id.includes("pill")) {
      return (
        <div className="relative w-full h-full min-h-[240px] md:min-h-[340px] overflow-hidden bg-[#08051E] p-6 flex items-center justify-center">
          <div className="inline-flex bg-[#03001C] border border-[#3A3F53] p-1.5 rounded-full gap-1.5 shadow-xl">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#FFBCBC] text-[#03001C] shadow-md">
              Дизайн
            </span>
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#A8ADC0]">
              Код
            </span>
          </div>
        </div>
      );
    }

    // Default aesthetic gradient fallback
    return (
      <div className="relative w-full h-full min-h-[240px] md:min-h-[340px] overflow-hidden bg-gradient-to-br from-[#03001C] via-[#1a0f3c] to-[#2c1328] p-6 flex flex-col justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#FFBCBC_20%,transparent_60%)] opacity-40" />
        <div className="relative z-10 flex justify-end">
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-[#FFBCBC]/15 text-[#FFBCBC] border border-[#FFBCBC]/30">
            UI GRADIENT
          </span>
        </div>
        <div className="relative z-10 space-y-2">
          <div className="h-2.5 w-32 rounded bg-[#FFBCBC]/40" />
          <div className="h-2 w-48 rounded bg-white/20" />
        </div>
      </div>
    );
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare();
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike();
  };

  return (
    <div
      id={`design-card-${item.id}`}
      onClick={onView}
      className="cursor-pointer group flex flex-col md:flex-row items-stretch justify-between p-0 rounded-2xl bg-[#090040] border border-[#1b1458] hover:border-[#FFBCBC] transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-[#FFBCBC]/10 relative overflow-hidden min-h-[340px] md:min-h-[350px]"
    >
      {/* Left Content Section (Strict 50%) */}
      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between min-w-0 bg-[#090040]">
        <div className="space-y-3.5">
          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-[#FFBCBC] transition-colors leading-snug">
            {item.title}
          </h3>

          {/* Short Description */}
          <p className="text-sm text-neutral-300 leading-relaxed line-clamp-4">
            {item.description}
          </p>

          {/* Moved Like and Share Buttons: Positioned directly underneath short description */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeClick}
              className={`h-9 px-3 rounded-lg text-xs gap-1.5 transition-colors ${
                isLiked
                  ? "text-[#FFBCBC] bg-[#FFBCBC]/15 hover:bg-[#FFBCBC]/25"
                  : "text-neutral-400 hover:text-[#FFBCBC] hover:bg-[#FFBCBC]/10"
              }`}
              aria-label="Вподобати"
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{(item.likes ?? 0) + (isLiked ? 1 : 0)}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareClick}
              className="h-9 px-3 rounded-lg text-xs gap-1.5 text-neutral-400 hover:text-[#FFBCBC] hover:bg-[#FFBCBC]/10 transition-colors"
              aria-label="Поділитися"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Action Bar (View button separated in its primary position at bottom) */}
        <div className="flex items-center gap-2.5 pt-5 mt-6 border-t border-[#1b1458]">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="h-11 px-5 rounded-xl text-sm font-semibold bg-[#FFBCBC] text-[#030008] hover:bg-[#FFBCBC]/90 shadow-sm transition-all gap-1.5 border-0 cursor-pointer"
          >
            <span>Переглянути</span>
            <ArrowUpRight className="w-4 h-4 text-[#030008]" />
          </Button>
        </div>
      </div>

      {/* Right Preview Section (Strict 50%, Borderless, Flush) */}
      <div className="w-full md:w-1/2 p-0 border-none h-full min-h-[240px] md:min-h-[350px] overflow-hidden flex items-stretch">
        {renderVisualPreview()}
      </div>
    </div>
  );
};

export default DesignCard;
