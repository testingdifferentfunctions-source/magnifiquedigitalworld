import React from "react";
import { AppMode, MODE_ACCENTS, useMode } from "@/hooks/useMode";

export interface ItemTagBadgeProps {
  tag: string;
  mode?: AppMode;
  accentColor?: string;
  onClick?: (tag: string) => void;
  className?: string;
  id?: string;
}

export interface ItemTagsListProps {
  tags?: string[];
  mode?: AppMode;
  accentColor?: string;
  onTagClick?: (tag: string) => void;
  className?: string;
  id?: string;
}

/**
 * Strips leading hashtag symbol(s) and trims whitespace.
 * e.g., "#Design" -> "Design", "##React" -> "React"
 */
function cleanTagName(tag: string): string {
  if (!tag) return "";
  return tag.replace(/^#+/, "").trim();
}

/**
 * Reusable dynamic tag badge that replicates the subcategory button UI & interaction
 * using dynamic mode accents injected via CSS variables and inline styles.
 */
export const ItemTagBadge: React.FC<ItemTagBadgeProps> = ({
  tag,
  mode,
  accentColor,
  onClick,
  className = "",
  id,
}) => {
  const { mode: currentContextMode } = useMode();

  const activeMode = mode || currentContextMode;
  const resolvedAccent =
    accentColor || (activeMode ? MODE_ACCENTS[activeMode] : undefined) || "#A07DFA";

  const cleanLabel = cleanTagName(tag);
  if (!cleanLabel) return null;

  const isClickable = Boolean(onClick);

  const styleObj: React.CSSProperties = {
    "--mode-accent": resolvedAccent,
    borderColor: `${resolvedAccent}80`,
  } as React.CSSProperties;

  const baseClasses =
    "inline-flex items-center gap-1.5 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold border bg-transparent text-white border-[var(--mode-accent)]/50 hover:bg-[var(--mode-accent)]/15 hover:border-[var(--mode-accent)] hover:text-white active:scale-95 transition-all duration-200 select-none whitespace-nowrap shadow-sm";

  if (isClickable) {
    return (
      <button
        id={id}
        type="button"
        onClick={() => onClick?.(cleanLabel)}
        style={styleObj}
        className={`${baseClasses} cursor-pointer ${className}`}
        title={cleanLabel}
      >
        <span>{cleanLabel}</span>
      </button>
    );
  }

  return (
    <span
      id={id}
      style={styleObj}
      className={`${baseClasses} cursor-default ${className}`}
      title={cleanLabel}
    >
      <span>{cleanLabel}</span>
    </span>
  );
};

/**
 * List container for rendering multiple item tag badges
 */
export const ItemTagsList: React.FC<ItemTagsListProps> = ({
  tags,
  mode,
  accentColor,
  onTagClick,
  className = "flex flex-wrap items-center gap-2",
  id,
}) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div id={id} className={className}>
      {tags.map((tag, idx) => {
        const cleaned = cleanTagName(tag);
        if (!cleaned) return null;
        return (
          <ItemTagBadge
            key={`${cleaned}-${idx}`}
            tag={tag}
            mode={mode}
            accentColor={accentColor}
            onClick={onTagClick}
          />
        );
      })}
    </div>
  );
};

export default ItemTagBadge;
