import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useToggleArticleLikeAnonymous } from "@/hooks/useArticles";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";

const ANON_LIKES_KEY = "anon_liked_articles";

const getAnonLikes = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(ANON_LIKES_KEY) || "[]");
  } catch {
    return [];
  }
};

const setAnonLike = (articleId: string, liked: boolean) => {
  const likes = getAnonLikes();
  if (liked && !likes.includes(articleId)) {
    likes.push(articleId);
  } else if (!liked) {
    const idx = likes.indexOf(articleId);
    if (idx !== -1) likes.splice(idx, 1);
  }
  localStorage.setItem(ANON_LIKES_KEY, JSON.stringify(likes));
};

interface LikeButtonProps {
  articleId: string;
  likes: number;
  className?: string;
}

const LikeButton = ({ articleId, likes, className }: LikeButtonProps) => {
  const { t } = useLanguage();
  const toggleLikeAnon = useToggleArticleLikeAnonymous();
  
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [isLiked, setIsLiked] = useState(() => getAnonLikes().includes(articleId));

  useEffect(() => {
    setIsLiked(getAnonLikes().includes(articleId));
  }, [articleId]);

  useEffect(() => {
    setCurrentLikes(likes);
  }, [likes]);

  const handleLike = useCallback(async () => {
    const wasLiked = isLiked;
    const isLiking = !wasLiked;
    setIsLiked(isLiking);
    setCurrentLikes(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      await toggleLikeAnon.mutateAsync({ articleId, isLiking });
      setAnonLike(articleId, isLiking);
    } catch {
      setIsLiked(wasLiked);
      setCurrentLikes(prev => wasLiked ? prev + 1 : prev - 1);
      toast.error(t('like.error'));
    }
  }, [isLiked, articleId, toggleLikeAnon, t]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={toggleLikeAnon.isPending}
      className={cn(
        "gap-2 transition-colors duration-200 group hover:bg-primary hover:text-primary-foreground",
        isLiked ? "text-primary" : "text-muted-foreground",
        className
      )}
    >
      <Heart className={cn("w-4 h-4 transition-colors", isLiked && "fill-current", !isLiked && "group-hover:fill-current")} />
      <span>{currentLikes}</span>
    </Button>
  );
};

export default LikeButton;
