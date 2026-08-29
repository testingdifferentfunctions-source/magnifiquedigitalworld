import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Heart, Share2, ImageIcon, Sparkles } from "lucide-react";

export interface ResearchCardItem {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  likes?: number;
  url?: string | null;
  tags?: string[];
  date?: string;
}

interface ResearchCardProps {
  item: ResearchCardItem;
  index?: number;
  onRead?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
}

const ResearchCard = ({
  item,
  index = 0,
  onRead,
  onLike,
  onShare,
  isLiked: initialLiked = false,
}: ResearchCardProps) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(item.likes ?? 0);

  const handleRead = () => {
    if (onRead) {
      onRead();
    } else {
      navigate(`/research/${item.id}`);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    setLikesCount((prev) => prev + (next ? 1 : -1));
    if (onLike) onLike();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) onShare();
  };

  return (
    <motion.article
      id={`research-card-${item.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.08, 0.4) }}
      className="group w-full h-full rounded-xl overflow-hidden bg-[#141718] border border-[#222B2C] shadow-md hover:border-[#F78D60]/60 hover:shadow-[0_8px_30px_rgba(247,141,96,0.15)] transition-all duration-300 flex flex-col justify-between"
    >
      {/* Top: Preview Image cover */}
      <div
        id={`research-image-container-${item.id}`}
        className="relative w-full h-48 sm:h-56 bg-[#0B0D0E] overflow-hidden cursor-pointer shrink-0"
        onClick={handleRead}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transform transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0C1011] text-neutral-500 gap-2">
            <ImageIcon className="w-10 h-10 text-[#F78D60]/60" aria-hidden="true" />
            <span className="text-xs text-neutral-400 font-mono">Дослідження</span>
          </div>
        )}
      </div>

      {/* Body: Title and short description */}
      <div id={`research-body-${item.id}`} className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <h2
            onClick={handleRead}
            className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100 group-hover:text-[#F78D60] transition-colors duration-200 cursor-pointer leading-snug"
          >
            {item.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-300 leading-relaxed line-clamp-3">
            {item.description}
          </p>
        </div>

        {/* Footer: Read button on the left, Like and Share grouped together on the right */}
        <footer
          id={`research-footer-${item.id}`}
          className="mt-6 pt-4 border-t border-[#222B2C] flex items-center justify-between gap-3"
        >
          {/* Left: "Прочитати" (Read) button with #F78D60 accent */}
          <Button
            id={`research-read-btn-${item.id}`}
            type="button"
            onClick={handleRead}
            className="bg-[#F78D60] hover:bg-[#e67c4e] active:bg-[#d56d40] text-[#0F0F0F] font-bold px-5 py-2 rounded-lg transition-colors h-10 shadow-sm flex items-center gap-2 border border-[#F78D60]/50"
          >
            Прочитати
          </Button>

          {/* Right: Grouped Like and Share buttons */}
          <div className="flex items-center gap-2">
            {/* Button: "Like" (Heart icon) */}
            <Button
              id={`research-like-btn-${item.id}`}
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleLike}
              aria-label="Вподобати"
              aria-pressed={liked}
              className={`bg-[#192224] hover:bg-[#222F33] text-neutral-200 hover:text-[#F78D60] border border-[#253538] hover:border-[#F78D60]/40 h-10 w-10 shrink-0 rounded-lg transition-colors ${
                liked ? "text-[#F78D60] border-[#F78D60]/50" : ""
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  liked ? "fill-[#F78D60] text-[#F78D60]" : ""
                }`}
                aria-hidden="true"
              />
            </Button>

            {/* Button: "Share" (Share2 icon) */}
            <Button
              id={`research-share-btn-${item.id}`}
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleShare}
              aria-label="Поділитися"
              className="bg-[#192224] hover:bg-[#222F33] text-neutral-200 hover:text-[#F78D60] border border-[#253538] hover:border-[#F78D60]/40 h-10 w-10 shrink-0 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </footer>
      </div>
    </motion.article>
  );
};

export default ResearchCard;
