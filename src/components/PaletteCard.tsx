import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Heart, Share2, ImageIcon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { ColorSwatch } from "@/lib/colors";

export interface PaletteCardItem {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  likes?: number;
  url?: string | null;
  tags?: string[];
  colors?: string[] | ColorSwatch[];
}

interface PaletteCardProps {
  item: PaletteCardItem;
  index?: number;
  onColors?: () => void;
  onView?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
}

const PaletteCard = ({
  item,
  index = 0,
  onColors,
  onView,
  onLike,
  onShare,
  isLiked: initialLiked = false,
}: PaletteCardProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(item.likes ?? 0);

  const handleColors = () => {
    if (onColors) {
      onColors();
    } else {
      navigate(`/palette/${item.id}`);
    }
  };

  const handleView = () => {
    if (onView) {
      onView();
    } else if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else {
      navigate(`/palette/${item.id}`);
    }
  };

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikesCount((prev) => prev + (next ? 1 : -1));
    if (onLike) onLike();
  };

  return (
    <motion.article
      id={`palette-card-${item.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.08, 0.4) }}
      className="group w-full rounded-xl overflow-hidden bg-[#181717] border border-[#292626] shadow-md hover:border-[#8ABEB9]/60 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Top: Website preview image (clean without badge overlay) */}
      <div
        id={`palette-image-container-${item.id}`}
        className="relative w-full h-48 sm:h-56 bg-[#121111] overflow-hidden cursor-pointer shrink-0"
        onClick={handleColors}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transform transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#151414] text-neutral-500 gap-2">
            <ImageIcon className="w-12 h-12" aria-hidden="true" />
            <span className="text-xs font-mono">Прев'ю сайту</span>
          </div>
        )}
      </div>

      {/* Body: Title and short description */}
      <div id={`palette-body-${item.id}`} className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div className="flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2
              onClick={handleColors}
              className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100 group-hover:text-[#8ABEB9] transition-colors duration-200 cursor-pointer leading-snug"
            >
              {item.title}
            </h2>
          </div>

          <p className="mt-2 text-sm sm:text-base text-neutral-300 leading-relaxed line-clamp-3">
            {item.description}
          </p>
        </div>

        {/* Action Buttons: Horizontal flex row pinned to the bottom */}
        <div
          id={`palette-actions-${item.id}`}
          className="mt-auto pt-5 flex flex-row items-center gap-2"
        >
          {/* Button 1: "Кольори" (Colors) - text only */}
          <Button
            id={`palette-colors-btn-${item.id}`}
            type="button"
            onClick={handleColors}
            className="bg-[#8ABEB9] hover:bg-[#78aca7] text-[#0F0E0E] font-semibold px-3.5 py-2 rounded-lg transition-colors flex-1 sm:flex-none h-10 shadow-sm text-xs sm:text-sm"
          >
            {t('card.colors')}
          </Button>

          {/* Button 2: "Переглянути" (View) */}
          <Button
            id={`palette-view-btn-${item.id}`}
            type="button"
            variant="outline"
            onClick={handleView}
            className="bg-transparent hover:bg-[#8ABEB9]/10 text-[#8ABEB9] border-[#8ABEB9] hover:text-[#8ABEB9] font-medium px-3.5 py-2 rounded-lg transition-colors flex-1 sm:flex-none h-10 shadow-sm text-xs sm:text-sm"
          >
            {t('card.view')}
          </Button>

          {/* Button 3: "Like" */}
          <Button
            id={`palette-like-btn-${item.id}`}
            type="button"
            variant="secondary"
            size="icon"
            onClick={handleLike}
            aria-label={t('card.like')}
            aria-pressed={liked}
            className="bg-[#201E1E] hover:bg-[#2A2727] text-neutral-200 hover:text-[#8ABEB9] border border-[#322F2F] h-10 w-10 shrink-0 rounded-lg transition-colors ml-auto sm:ml-0"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                liked ? "fill-[#8ABEB9] text-[#8ABEB9]" : ""
              }`}
              aria-hidden="true"
            />
          </Button>

          {/* Button 4: "Share" */}
          <Button
            id={`palette-share-btn-${item.id}`}
            type="button"
            variant="secondary"
            size="icon"
            onClick={onShare}
            aria-label={t('card.share')}
            className="bg-[#201E1E] hover:bg-[#2A2727] text-neutral-200 hover:text-[#8ABEB9] border border-[#322F2F] h-10 w-10 shrink-0 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </motion.article>
  );
};

export default PaletteCard;
