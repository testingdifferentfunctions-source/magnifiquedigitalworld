import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/hooks/useCategories";
import { useLanguage } from "@/hooks/useLanguage";
import ModeSwitcher from "./ModeSwitcher";

export type SortOption = "newest" | "oldest";

export interface FilterCategoryOption {
  id: string;
  name: string;
}

interface ArticleFiltersProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  categories?: Category[];
  categoryOptions?: FilterCategoryOption[];
  categoryTranslations?: Record<string, string>;
  dropdownPlaceholder?: string;
}

const ArticleFilters = ({
  sortBy,
  onSortChange,
  categoryId,
  onCategoryChange,
  categories = [],
  categoryOptions,
  categoryTranslations = {},
  dropdownPlaceholder,
}: ArticleFiltersProps) => {
  const { t, language } = useLanguage();

  const options: FilterCategoryOption[] = categoryOptions || categories;

  return (
    <div id="article-filters-bar" className="flex flex-wrap items-center gap-3">
      {/* Перемикач режимів сайту */}
      <ModeSwitcher />

      <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
        <SelectTrigger id="sort-select-trigger" className="w-[150px] sm:w-[160px]">
          <SelectValue placeholder={t('filters.sort')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{t('filters.newest')}</SelectItem>
          <SelectItem value="oldest">{t('filters.oldest')}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryId} onValueChange={onCategoryChange}>
        <SelectTrigger id="category-select-trigger" className="w-[165px] sm:w-[185px]">
          <SelectValue placeholder={dropdownPlaceholder || t('filters.all_sections')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{dropdownPlaceholder || t('filters.all_sections')}</SelectItem>
          {options.map((category) => (
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
