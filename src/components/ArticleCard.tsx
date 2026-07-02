import { Heart, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Article } from "@/data/articles";
import { shareArticle } from "@/lib/share";

interface ArticleCardProps {
  article: Article;
  index?: number;
}

const ArticleCard = ({ article, index = 0 }: ArticleCardProps) => {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    shareArticle(article.id, article.title);
  };

  return (
    <Link to={`/article/${article.id}`}>
      <article
        className="card-hover bg-card rounded-xl overflow-hidden cursor-pointer animate-fade-in"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="aspect-video overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {article.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{article.likes}</span>
            </div>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Поділитися"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground transition-colors duration-200 hover:text-primary-foreground hover:bg-primary"
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
