import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/hooks/useCategories";
import { useLanguage } from "@/hooks/useLanguage";
import { useMode } from "@/hooks/useMode";
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
  const { mode } = useMode();
  const isDesignMode = mode === "design";

  const options: FilterCategoryOption[] = categoryOptions || categories;

  return (
    <div id="article-filters-bar" className="flex flex-wrap items-center gap-3">
      {/* Перемикач режимів сайту */}
      <ModeSwitcher />

      {/* Фільтр сортування: Спочатку нові / Спочатку старі */}
      <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
        <SelectTrigger
          id="sort-select-trigger"
          className={`w-[150px] sm:w-[160px] transition-colors ${
            isDesignMode
              ? "bg-[#030008] text-white border-[#231b2f] hover:border-[#FFBCBC]/60 font-medium [&>svg]:text-white [&>svg]:opacity-90"
              : "bg-card border-border"
          }`}
        >
          <SelectValue placeholder={t('filters.sort')} />
        </SelectTrigger>
        <SelectContent
          className={
            isDesignMode
              ? "bg-[#030008] border-[#231b2f] text-slate-100 shadow-2xl"
              : "bg-popover border-border"
          }
        >
          <SelectItem
            value="newest"
            className={
              isDesignMode
                ? "text-slate-200 transition-colors duration-200 cursor-pointer focus:bg-[#FFBCBC] focus:text-black hover:bg-[#FFBCBC] hover:text-black data-[highlighted]:bg-[#FFBCBC] data-[highlighted]:text-black data-[state=checked]:bg-[#FFBCBC] data-[state=checked]:text-black [&[data-state=checked]>span>svg]:text-black [&[data-highlighted]>span>svg]:text-black [&:focus>span>svg]:text-black"
                : "transition-colors duration-200 cursor-pointer"
            }
          >
            {t('filters.newest')}
          </SelectItem>
          <SelectItem
            value="oldest"
            className={
              isDesignMode
                ? "text-slate-200 transition-colors duration-200 cursor-pointer focus:bg-[#FFBCBC] focus:text-black hover:bg-[#FFBCBC] hover:text-black data-[highlighted]:bg-[#FFBCBC] data-[highlighted]:text-black data-[state=checked]:bg-[#FFBCBC] data-[state=checked]:text-black [&[data-state=checked]>span>svg]:text-black [&[data-highlighted]>span>svg]:text-black [&:focus>span>svg]:text-black"
                : "transition-colors duration-200 cursor-pointer"
            }
          >
            {t('filters.oldest')}
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Фільтр розділів: Всі розділи */}
      <Select value={categoryId} onValueChange={onCategoryChange}>
        <SelectTrigger
          id="category-select-trigger"
          className={`w-[165px] sm:w-[185px] transition-colors ${
            isDesignMode
              ? "bg-[#030008] text-white border-[#231b2f] hover:border-[#FFBCBC]/60 font-medium [&>svg]:text-white [&>svg]:opacity-90"
              : "bg-card border-border"
          }`}
        >
          <SelectValue placeholder={dropdownPlaceholder || t('filters.all_sections')} />
        </SelectTrigger>
        <SelectContent
          className={
            isDesignMode
              ? "bg-[#030008] border-[#231b2f] text-slate-100 shadow-2xl"
              : "bg-popover border-border"
          }
        >
          <SelectItem
            value="all"
            className={
              isDesignMode
                ? "text-slate-200 transition-colors duration-200 cursor-pointer focus:bg-[#FFBCBC] focus:text-black hover:bg-[#FFBCBC] hover:text-black data-[highlighted]:bg-[#FFBCBC] data-[highlighted]:text-black data-[state=checked]:bg-[#FFBCBC] data-[state=checked]:text-black [&[data-state=checked]>span>svg]:text-black [&[data-highlighted]>span>svg]:text-black [&:focus>span>svg]:text-black"
                : "transition-colors duration-200 cursor-pointer"
            }
          >
            {dropdownPlaceholder || t('filters.all_sections')}
          </SelectItem>
          {options.map((category) => (
            <SelectItem
              key={category.id}
              value={category.id}
              className={
                isDesignMode
                  ? "text-slate-200 transition-colors duration-200 cursor-pointer focus:bg-[#FFBCBC] focus:text-black hover:bg-[#FFBCBC] hover:text-black data-[highlighted]:bg-[#FFBCBC] data-[highlighted]:text-black data-[state=checked]:bg-[#FFBCBC] data-[state=checked]:text-black [&[data-state=checked]>span>svg]:text-black [&[data-highlighted]>span>svg]:text-black [&:focus>span>svg]:text-black"
                  : "transition-colors duration-200 cursor-pointer"
              }
            >
              {(language === 'en' && categoryTranslations[category.id]) ? categoryTranslations[category.id] : category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ArticleFilters;
