import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SnippetCardItem {
  id: string;
  title: string;
  description: string;
  code?: string;
  language?: string;
  tags?: string[];
  likes?: number;
  url?: string | null;
}

interface SnippetCardProps {
  item: SnippetCardItem;
  index?: number;
  onView?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
}

const SnippetCard = ({
  item,
  index = 0,
  onView,
  onLike,
  onShare,
  isLiked: initialLiked = false,
}: SnippetCardProps) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(initialLiked);
  const [, setLikesCount] = useState(item.likes ?? 0);

  const displayCode = item.code?.trim() || `// ${item.title}\nconsole.log("${item.description}");`;

  const handleView = () => {
    if (onView) {
      onView();
    } else {
      navigate(`/template/${item.id}`);
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
      id={`snippet-card-${item.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.08, 0.4) }}
      className="group w-full rounded-xl overflow-hidden bg-[#161215] border border-[#2E232C] shadow-md hover:border-[#C562AF]/60 hover:shadow-xl transition-all duration-300 flex flex-col p-5 sm:p-6 justify-between"
    >
      <div>
        {/* 1. Title */}
        <h2
          onClick={handleView}
          className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100 group-hover:text-[#C562AF] transition-colors duration-200 leading-snug cursor-pointer"
        >
          {item.title}
        </h2>

        {/* 2. Short Description */}
        <p className="mt-2 text-sm sm:text-base text-neutral-300 leading-relaxed line-clamp-2 mb-4">
          {item.description}
        </p>

        {/* 3. Code Preview Block: Static preview with custom thin scrollbar matching card theme */}
        <div
          id={`snippet-code-block-${item.id}`}
          className="relative rounded-lg bg-zinc-900 border border-[#2E232C] overflow-hidden shadow-inner"
        >
          <pre className="snippet-code-scrollbar p-4 font-mono text-xs sm:text-sm text-neutral-200 overflow-x-auto max-h-40 leading-relaxed">
            <code>{displayCode}</code>
          </pre>
        </div>
      </div>

      {/* 4. Action Buttons Footer */}
      <footer
        id={`snippet-footer-${item.id}`}
        className="mt-5 pt-4 border-t border-[#2E232C] flex flex-row items-center gap-2"
      >
        {/* Button 1: "Переглянути" (View) */}
        <Button
          id={`snippet-view-btn-${item.id}`}
          type="button"
          onClick={handleView}
          className="bg-[#C562AF] hover:bg-[#b54f9f] text-[#0F0E0E] font-semibold px-4 py-2 rounded-lg transition-colors flex-1 sm:flex-none h-10 shadow-sm text-xs sm:text-sm"
        >
          Переглянути
        </Button>

        {/* Button 2: "Like" - strictly icon only */}
        <Button
          id={`snippet-like-btn-${item.id}`}
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleLike}
          aria-label="Вподобати"
          aria-pressed={liked}
          className="bg-[#20181E] hover:bg-[#2C1F2A] text-neutral-200 hover:text-[#C562AF] border border-[#3E2A3A] h-10 w-10 shrink-0 rounded-lg transition-colors ml-auto sm:ml-0"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              liked ? "fill-[#C562AF] text-[#C562AF]" : ""
            }`}
            aria-hidden="true"
          />
        </Button>

        {/* Button 3: "Share" - strictly icon only */}
        <Button
          id={`snippet-share-btn-${item.id}`}
          type="button"
          variant="secondary"
          size="icon"
          onClick={onShare}
          aria-label="Поділитися"
          className="bg-[#20181E] hover:bg-[#2C1F2A] text-neutral-200 hover:text-[#C562AF] border border-[#3E2A3A] h-10 w-10 shrink-0 rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" aria-hidden="true" />
        </Button>
      </footer>
    </motion.article>
  );
};

export default SnippetCard;

