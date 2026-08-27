import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export interface DictionaryCardItem {
  id: string;
  title: string;
  description: string;
  likes?: number;
  tags?: string[];
  url?: string | null;
}

interface DictionaryCardProps {
  item: DictionaryCardItem;
  index?: number;
  onRead?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
}

const DictionaryCard = ({
  item,
  index = 0,
  onRead,
  onLike,
  onShare,
  isLiked: initialLiked = false,
}: DictionaryCardProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(item.likes ?? 0);

  const handleRead = () => {
    if (onRead) {
      onRead();
    } else {
      navigate(`/dictionary/${item.id}`);
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
      id={`dictionary-card-${item.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      className="group w-full rounded-xl bg-[#140c0c] hover:bg-[#1a1010] border border-[#2a1d1d] hover:border-[#F3CD97]/60 shadow-md hover:shadow-lg transition-all duration-300 p-5 sm:p-6"
    >
      {/* Horizontal Flex Layout: Left Column (Content) and Right Column (Actions) on the exact same row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Column: Title (heading) + Short description */}
        <div className="flex flex-col flex-1 min-w-0 pr-0 sm:pr-4">
          <h2
            onClick={handleRead}
            className="text-lg sm:text-xl font-bold tracking-tight text-neutral-100 group-hover:text-[#F3CD97] transition-colors duration-200 cursor-pointer truncate"
            title={item.title}
          >
            {item.title}
          </h2>
          <p className="mt-1.5 text-sm text-neutral-300 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Right Column: Action buttons in a horizontal row */}
        <div className="flex flex-row items-center gap-2 self-start sm:self-center shrink-0">
          {/* Action 1: "Прочитати" / "Read" styled using #F3CD97 */}
          <Button
            id={`dictionary-read-btn-${item.id}`}
            type="button"
            onClick={handleRead}
            className="bg-[#F3CD97] hover:bg-[#e4be87] text-[#080202] font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm h-9"
          >
            {language === "en" ? "Read" : "Прочитати"}
          </Button>

          {/* Action 2: "Like" - Icon-only button (heart icon) */}
          <Button
            id={`dictionary-like-btn-${item.id}`}
            type="button"
            variant="secondary"
            size="icon"
            onClick={handleLike}
            aria-label={language === "en" ? "Like" : "Вподобати"}
            aria-pressed={liked}
            className="bg-[#1f1414] hover:bg-[#2a1d1d] text-neutral-200 hover:text-[#F3CD97] border border-[#352525] h-9 w-9 shrink-0 rounded-lg transition-colors"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                liked ? "fill-[#F3CD97] text-[#F3CD97]" : ""
              }`}
              aria-hidden="true"
            />
          </Button>

          {/* Action 3: "Share" - Icon-only button (share/forward icon) */}
          <Button
            id={`dictionary-share-btn-${item.id}`}
            type="button"
            variant="secondary"
            size="icon"
            onClick={onShare}
            aria-label={language === "en" ? "Share" : "Поділитися"}
            className="bg-[#1f1414] hover:bg-[#2a1d1d] text-neutral-200 hover:text-[#F3CD97] border border-[#352525] h-9 w-9 shrink-0 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </motion.article>
  );
};

export default DictionaryCard;
