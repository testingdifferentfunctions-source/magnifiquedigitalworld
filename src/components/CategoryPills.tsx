import React from "react";
import { AppMode, MODE_ACCENTS } from "@/hooks/useMode";
import { useLanguage } from "@/hooks/useLanguage";
import { Category } from "@/hooks/useCategories";

export interface PillItem {
  id: string;
  label: string;
  name_en?: string;
  title_en?: string;
  count?: number;
}

interface CategoryPillsProps {
  pills: PillItem[];
  activePillId: string;
  onSelectPill: (pillId: string) => void;
  accentColor?: string;
  mode?: AppMode;
  className?: string;
  selectedCategory?: Category | null;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({
  pills,
  activePillId,
  onSelectPill,
  accentColor,
  mode = "articles",
  className = "",
}) => {
  const { language } = useLanguage();
  const resolvedAccent =
    accentColor || (mode ? MODE_ACCENTS[mode] : "#A07DFA") || "#A07DFA";

  if (!pills || pills.length <= 1) {
    return null;
  }

  return (
    <div
      id="category-pills-container"
      className={`py-2 w-full ${className}`}
      role="tablist"
      aria-label="Підкатегорії та фільтри"
    >
      <div className="flex flex-wrap items-center gap-3 w-full min-h-[48px]">
        {pills.map((pill) => {
          const isActive = activePillId === pill.id;
          const isAll = pill.id === "all";
          const isResearch = mode === "research" || resolvedAccent.toLowerCase() === "#f78d60";
          const displayLabel = isAll
            ? language === "en"
              ? "All"
              : "Всі"
            : language === "en" && (pill.title_en || pill.name_en)
            ? pill.title_en || pill.name_en
            : pill.label;

          return (
            <button
              key={pill.id}
              id={`category-pill-${pill.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectPill(pill.id)}
              style={{
                backgroundColor: isActive ? resolvedAccent : undefined,
                borderColor: isActive ? resolvedAccent : isResearch ? "#F78D6080" : `${resolvedAccent}80`,
              }}
              className={`w-fit flex-none inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-200 cursor-pointer select-none whitespace-nowrap shadow-sm ${
                isActive
                  ? isResearch
                    ? "bg-[#F78D60] text-[#0F0F0F] font-bold shadow-md scale-[1.02] border-transparent"
                    : "text-black shadow-md scale-[1.02] border-transparent"
                  : isResearch
                  ? "bg-[#141718]/80 text-neutral-300 border-[#F78D60]/50 hover:bg-[#F78D60]/15 hover:text-[#F78D60] hover:border-[#F78D60] active:scale-95 transition-colors duration-200"
                  : "text-white hover:bg-white/10 active:scale-95 opacity-90 hover:opacity-100 transition-colors duration-200"
              }`}
              title={displayLabel}
            >
              <span>{displayLabel}</span>
              {typeof pill.count === "number" && (
                <span
                  style={{
                    backgroundColor: isActive
                      ? isResearch ? "rgba(15,15,15,0.2)" : "rgba(0,0,0,0.18)"
                      : isResearch ? "rgba(247,141,96,0.15)" : "rgba(255,255,255,0.15)",
                  }}
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none shrink-0 font-bold ${
                    isActive
                      ? isResearch ? "text-[#0F0F0F]" : "text-black"
                      : isResearch ? "text-[#F78D60]" : "text-white"
                  }`}
                >
                  {pill.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPills;
