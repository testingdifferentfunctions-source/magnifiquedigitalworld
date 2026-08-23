import { ArrowUpRight, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ComponentItem {
  id: string;
  title: string;
  description: string;
  url?: string;
}

interface ComponentCardProps {
  item: ComponentItem;
  index?: number;
  onView?: (item: ComponentItem) => void;
  onLink?: (item: ComponentItem) => void;
}

const ComponentCard = ({ item, index = 0, onView, onLink }: ComponentCardProps) => {
  return (
    <article
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
        <ArrowUpRight className="w-5 h-5 text-foreground shrink-0" aria-hidden="true" />
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>

      <div className="flex items-center gap-3 pt-2">
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => onView?.(item)}>
          Переглянути
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-transparent"
          onClick={() => onLink?.(item)}
        >
          <Link2 className="w-4 h-4" aria-hidden="true" />
          Посилання
        </Button>
      </div>
    </article>
  );
};

export default ComponentCard;
