import React, { useMemo } from "react";
import { AppMode, MODE_ACCENTS } from "@/hooks/useMode";

export interface PillItem {
  id: string;
  label: string;
  count?: number;
}

interface CategoryPillsProps {
  pills: PillItem[];
  activePillId: string;
  onSelectPill: (pillId: string) => void;
  accentColor?: string;
  mode?: AppMode;
  className?: string;
}

const ITEMS_PER_ROW = 8;

const CategoryPills: React.FC<CategoryPillsProps> = ({
  pills,
  activePillId,
  onSelectPill,
  accentColor,
  mode,
  className = "",
}) => {
  const resolvedAccent =
    accentColor || (mode ? MODE_ACCENTS[mode] : "#A07DFA") || "#A07DFA";

  // Chunk pills into rows of maximum 8 items
  const chunkedPills = useMemo(() => {
    if (!pills || pills.length === 0) return [];
    const chunks: PillItem[][] = [];
    for (let i = 0; i < pills.length; i += ITEMS_PER_ROW) {
      chunks.push(pills.slice(i, i + ITEMS_PER_ROW));
    }
    return chunks;
  }, [pills]);

  if (!pills || pills.length === 0) {
    return null;
  }

  return (
    <div
      id="category-pills-container"
      className={`py-2 w-full ${className}`}
      role="tablist"
      aria-label="Підкатегорії та фільтри"
    >
      {chunkedPills.map((chunk, rowIndex) => (
        <div
          key={`pill-row-${rowIndex}`}
          className="flex flex-wrap gap-3 items-center mb-3 last:mb-0"
        >
          {chunk.map((pill) => {
            const isActive = activePillId === pill.id;

            return (
              <button
                key={pill.id}
                id={`category-pill-${pill.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectPill(pill.id)}
                style={{
                  backgroundColor: isActive ? resolvedAccent : "transparent",
                  borderColor: resolvedAccent,
                }}
                className={`w-fit flex-none inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border text-white transition-all duration-200 cursor-pointer select-none whitespace-nowrap shadow-sm ${
                  isActive
                    ? "font-semibold shadow-md scale-[1.02] border-transparent"
                    : "hover:bg-white/10 active:scale-95 opacity-90 hover:opacity-100"
                }`}
                title={pill.label}
              >
                <span>{pill.label}</span>
                {typeof pill.count === "number" && (
                  <span
                    style={{
                      backgroundColor: isActive ? "rgba(255,255,255,0.25)" : `${resolvedAccent}33`,
                    }}
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none text-white shrink-0"
                  >
                    {pill.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default CategoryPills;

