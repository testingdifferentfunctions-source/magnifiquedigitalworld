import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Heart, Share2, ImageIcon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export interface NewsCardItem {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  likes?: number;
  url?: string | null;
  date?: string;
  tags?: string[];
}

interface NewsCardProps {
  item: NewsCardItem;
  index?: number;
  onRead?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
}

const NewsCard = ({
  item,
  index = 0,
  onRead,
  onLike,
  onShare,
  isLiked: initialLiked = false,
}: NewsCardProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(item.likes ?? 0);

  const handleRead = () => {
    if (onRead) {
      onRead();
    } else {
      navigate(`/news/${item.id}`);
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
      id={`news-card-${item.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.08, 0.4) }}
      className="group w-full h-full rounded-xl overflow-hidden bg-[#091413] border border-[#182B28] shadow-md hover:border-[#A4B885]/60 hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      {/* Top: Shorter image preview cover */}
      <div
        id={`news-image-container-${item.id}`}
        className="relative w-full h-44 sm:h-52 bg-[#050C0B] overflow-hidden cursor-pointer shrink-0"
        onClick={handleRead}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transform transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#070F0E] text-neutral-500">
            <ImageIcon className="w-12 h-12" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Body: Title and short description text */}
      <div id={`news-body-${item.id}`} className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div className="flex-1 flex flex-col">
          <h2
            onClick={handleRead}
            className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100 group-hover:text-[#A4B885] transition-colors duration-200 cursor-pointer leading-snug"
          >
            {item.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-300 leading-relaxed line-clamp-3">
            {item.description}
          </p>
        </div>

        {/* Footer: A single horizontal row containing exactly 3 buttons */}
        <footer
          id={`news-footer-${item.id}`}
          className="mt-auto pt-4 border-t border-[#182B28] flex items-center gap-3"
        >
          {/* Button 1: "Прочитати" (Read) styled using #A4B885 accent */}
          <Button
            id={`news-read-btn-${item.id}`}
            type="button"
            onClick={handleRead}
            className="bg-[#A4B885] hover:bg-[#93a774] text-[#091413] font-semibold px-5 py-2 rounded-lg transition-colors flex-1 sm:flex-none h-10 shadow-sm"
          >
            {t('card.read')}
          </Button>

          {/* Button 2: "Like" containing ONLY a heart icon (strictly no text) */}
          <Button
            id={`news-like-btn-${item.id}`}
            type="button"
            variant="secondary"
            size="icon"
            onClick={handleLike}
            aria-label={t('card.like')}
            aria-pressed={liked}
            className="bg-[#122220] hover:bg-[#1A302D] text-neutral-200 hover:text-[#A4B885] border border-[#1E3834] h-10 w-10 shrink-0 rounded-lg transition-colors"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                liked ? "fill-[#A4B885] text-[#A4B885]" : ""
              }`}
              aria-hidden="true"
            />
          </Button>

          {/* Button 3: "Share" containing ONLY a share/forward icon (strictly no text) */}
          <Button
            id={`news-share-btn-${item.id}`}
            type="button"
            variant="secondary"
            size="icon"
            onClick={onShare}
            aria-label={t('card.share')}
            className="bg-[#122220] hover:bg-[#1A302D] text-neutral-200 hover:text-[#A4B885] border border-[#1E3834] h-10 w-10 shrink-0 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
          </Button>
        </footer>
      </div>
    </motion.article>
  );
};

export default NewsCard;
