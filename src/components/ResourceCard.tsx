import { Heart, Share2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  likes: number;
  url?: string;
}

interface ResourceCardProps {
  item: ResourceItem;
  index?: number;
  onDetails?: (item: ResourceItem) => void;
  onTry?: (item: ResourceItem) => void;
  onLike?: (item: ResourceItem) => void;
  onShare?: (item: ResourceItem) => void;
}

const ResourceCard = ({ item, index = 0, onDetails, onTry, onLike, onShare }: ResourceCardProps) => {
  return (
    <article
      className="bg-card border border-border rounded-xl overflow-hidden flex flex-col animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
        )}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <Button className="w-full" onClick={() => onDetails?.(item)}>
            Деталі
          </Button>
          <Button
            variant="outline"
            className="w-full bg-background border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => onTry?.(item)}
          >
            Спробувати
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-border">
        <button
          type="button"
          onClick={() => onLike?.(item)}
          aria-label="Вподобати"
          className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <Heart className="w-4 h-4" aria-hidden="true" />
          <span className="font-medium">{item.likes}</span>
        </button>
        <button
          type="button"
          onClick={() => onShare?.(item)}
          aria-label="Поділитися"
          className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground border-l border-border transition-colors hover:text-primary"
        >
          <Share2 className="w-4 h-4" aria-hidden="true" />
          <span className="font-medium">Поділитися</span>
        </button>
      </div>
    </article>
  );
};

export default ResourceCard;
