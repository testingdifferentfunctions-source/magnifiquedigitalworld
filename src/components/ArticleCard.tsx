import { Heart, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Article } from "@/data/articles";
import { shareArticle } from "@/lib/share";
import { useLanguage } from "@/hooks/useLanguage";

interface ArticleCardProps {
  article: Article;
  index?: number;
}

const ArticleCard = ({ article, index = 0 }: ArticleCardProps) => {
  const { t } = useLanguage();
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    shareArticle(article.id, article.title);
  };

  return (
    <Link to={`/article/${article.id}`} className="h-full block">
      <article
        className="card-hover bg-card rounded-xl overflow-hidden cursor-pointer animate-fade-in h-full flex flex-col"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="aspect-video overflow-hidden shrink-0">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">
              {article.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {article.description}
            </p>
          </div>
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center gap-2 text-primary">
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{article.likes}</span>
            </div>
            <button
              type="button"
              onClick={handleShare}
              aria-label={t('card.share')}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground transition-colors duration-200 hover:text-primary-foreground hover:bg-primary cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;
