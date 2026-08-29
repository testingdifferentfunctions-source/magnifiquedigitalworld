import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Heart, Share2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

export interface ComponentItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  likes?: number;
  tags?: string[];
}

interface ComponentCardProps {
  item: ComponentItem;
  index?: number;
  onView?: (item: ComponentItem) => void;
  onLike?: (item: ComponentItem) => void;
  onShare?: (item: ComponentItem) => void;
  isLiked?: boolean;
}

const ComponentCard = ({
  item,
  index = 0,
  onView,
  onLike,
  onShare,
  isLiked: initialLiked = false,
}: ComponentCardProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [liked, setLiked] = useState(initialLiked);
  const [, setLikesCount] = useState(item.likes ?? 0);

  const handleView = () => {
    if (onView) {
      onView(item);
    } else {
      navigate(`/component/${item.id}`);
    }
  };

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikesCount((prev) => prev + (next ? 1 : -1));
    if (onLike) onLike(item);
  };

  const handleShare = () => {
    if (onShare) {
      onShare(item);
    } else if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.origin + `/component/${item.id}`,
      }).catch(() => {});
    }
  };

  return (
    <motion.article
      id={`component-card-${item.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.08, 0.4) }}
      className="group w-full rounded-xl overflow-hidden bg-[#181818] border border-[#2B2B2B] shadow-md hover:border-neutral-400/60 hover:shadow-xl transition-all duration-300 flex flex-col h-full p-5 sm:p-6 justify-between"
    >
      <div className="flex-1 flex flex-col">
        {/* Title */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2
            onClick={handleView}
            className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100 group-hover:text-white transition-colors duration-200 leading-snug cursor-pointer"
          >
            {item.title}
          </h2>
          <ArrowUpRight
            className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors shrink-0 cursor-pointer"
            onClick={handleView}
            aria-hidden="true"
          />
        </div>

        {/* Short Description */}
        <p className="mt-2 text-sm sm:text-base text-neutral-300 leading-relaxed line-clamp-3">
          {item.description}
        </p>
      </div>

      {/* Action Buttons Footer: Single horizontal row with View, Like, and Share */}
      <footer
        id={`component-footer-${item.id}`}
        className="mt-auto pt-4 border-t border-[#2B2B2B] flex flex-row items-center gap-2"
      >
        {/* Button 1: "Переглянути" (View) */}
        <Button
          id={`component-view-btn-${item.id}`}
          type="button"
          onClick={handleView}
          className="bg-white hover:bg-neutral-200 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex-1 sm:flex-none h-10 shadow-sm text-xs sm:text-sm"
        >
          {t('card.view')}
        </Button>

        {/* Button 2: "Like" - strictly icon only */}
        <Button
          id={`component-like-btn-${item.id}`}
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleLike}
          aria-label={t('card.like')}
          aria-pressed={liked}
          className="bg-[#242424] hover:bg-[#303030] text-neutral-200 hover:text-white border border-[#383838] h-10 w-10 shrink-0 rounded-lg transition-colors ml-auto sm:ml-0"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              liked ? "fill-white text-white" : ""
            }`}
            aria-hidden="true"
          />
        </Button>

        {/* Button 3: "Share" - strictly icon only */}
        <Button
          id={`component-share-btn-${item.id}`}
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleShare}
          aria-label={t('card.share')}
          className="bg-[#242424] hover:bg-[#303030] text-neutral-200 hover:text-white border border-[#383838] h-10 w-10 shrink-0 rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" aria-hidden="true" />
        </Button>
      </footer>
    </motion.article>
  );
};

export default ComponentCard;
