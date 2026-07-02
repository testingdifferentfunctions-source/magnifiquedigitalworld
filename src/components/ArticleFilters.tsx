import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/hooks/useCategories";
import { useLanguage } from "@/hooks/useLanguage";

export type SortOption = "newest" | "oldest";

interface ArticleFiltersProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
  categoryTranslations?: Record<string, string>;
}

const ArticleFilters = ({
  sortBy,
  onSortChange,
  categoryId,
  onCategoryChange,
  categories,
  categoryTranslations = {},
}: ArticleFiltersProps) => {
  const { t, language } = useLanguage();

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t('filters.sort')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{t('filters.newest')}</SelectItem>
          <SelectItem value="oldest">{t('filters.oldest')}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryId} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('filters.all_sections')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.all_sections')}</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {(language === 'en' && categoryTranslations[category.id]) ? categoryTranslations[category.id] : category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ArticleFilters;
