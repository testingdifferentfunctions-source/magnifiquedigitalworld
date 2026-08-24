export interface ColorSwatch {
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
  role?: string;
}

/** Convert a 3 or 6 digit hex string to RGB object */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let cleaned = hex.replace(/^#/, "").trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (cleaned.length !== 6) return null;
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/** Convert RGB to HSL values */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/** Parse any hex code into complete swatch with HEX, RGB, HSL and role */
export function parseColor(rawHex: string, name?: string, role?: string): ColorSwatch {
  let hex = rawHex.trim();
  if (!hex.startsWith("#")) {
    hex = `#${hex}`;
  }
  const rgbObj = hexToRgb(hex);
  if (!rgbObj) {
    return {
      name: name || hex.toUpperCase(),
      hex: hex.toUpperCase(),
      rgb: "rgb(0, 0, 0)",
      hsl: "hsl(0, 0%, 0%)",
      role: role || "Color",
    };
  }

  const hslObj = rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b);
  const formattedHex = hex.toUpperCase();
  const formattedRgb = `rgb(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b})`;
  const formattedHsl = `hsl(${hslObj.h}, ${hslObj.s}%, ${hslObj.l}%)`;

  return {
    name: name || formattedHex,
    hex: formattedHex,
    rgb: formattedRgb,
    hsl: formattedHsl,
    role: role || "Color",
  };
}

/** Slugify color name or fallback to key */
export function slugifyColorName(name: string, index: number): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || `color-${index + 1}`;
}

/** Generate CSS, SCSS, and Tailwind code snippets for a single color swatch */
export function generateColorSnippets(swatch: ColorSwatch, index: number = 0) {
  const slug = slugifyColorName(swatch.name || swatch.role || `color-${index + 1}`, index);

  const css = `/* CSS Variable & Utility */
:root {
  --${slug}: ${swatch.hex};
}

.element {
  background-color: var(--${slug});
  color: ${swatch.hex};
  border-color: var(--${slug});
}`;

  const scss = `// SCSS Variable & Mixin
$${slug}: ${swatch.hex};

.element {
  background-color: $${slug};
  color: $${slug};
  border: 1px solid lighten($${slug}, 10%);
}`;

  const tailwind = `// 1. In tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        '${slug}': '${swatch.hex}',
      },
    },
  },
}

// 2. In your HTML / JSX markup
<div className="bg-[${swatch.hex}] text-[${swatch.hex}] border-[${swatch.hex}]">
  Palette Element
</div>`;

  return { css, scss, tailwind };
}

/** Extract colors from tags, blocks, or specific JSON format */
export function extractColorsFromEntry(entry: {
  tags?: string[];
  blocks_uk?: any[];
  blocks_en?: any[];
}): ColorSwatch[] {
  const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g;
  const found = new Map<string, { name?: string; role?: string }>();

  // Check tags
  (entry.tags || []).forEach((tag) => {
    const matches = tag.match(hexRegex);
    if (matches) {
      matches.forEach((m) => {
        if (!found.has(m.toUpperCase())) {
          found.set(m.toUpperCase(), { name: tag.replace(hexRegex, "").trim() || undefined });
        }
      });
    }
  });

  // Check blocks
  const allBlocks = [...(entry.blocks_uk || []), ...(entry.blocks_en || [])];
  allBlocks.forEach((block) => {
    if (block.type === "code" && block.code) {
      const matches = block.code.match(hexRegex);
      if (matches) {
        matches.forEach((m: string) => {
          if (!found.has(m.toUpperCase())) found.set(m.toUpperCase(), {});
        });
      }
    } else if (block.type === "paragraph" && block.text) {
      const matches = block.text.match(hexRegex);
      if (matches) {
        matches.forEach((m: string) => {
          if (!found.has(m.toUpperCase())) found.set(m.toUpperCase(), {});
        });
      }
    } else if (block.type === "list" && Array.isArray(block.items)) {
      block.items.forEach((item: string) => {
        const matches = item.match(hexRegex);
        if (matches) {
          matches.forEach((m: string) => {
            const role = item.includes(":") ? item.split(":")[0].trim() : undefined;
            if (!found.has(m.toUpperCase())) found.set(m.toUpperCase(), { role });
          });
        }
      });
    }
  });

  if (found.size === 0) {
    // Default fallback palette if none found in entry text
    return [
      parseColor("#8ABEB9", "Primary Accent", "Primary"),
      parseColor("#262626", "Dark Surface", "Background"),
      parseColor("#383838", "Card Background", "Surface"),
      parseColor("#E0E0E0", "Text Foreground", "Text"),
      parseColor("#F4A261", "Secondary Accent", "Highlight"),
    ];
  }

  const result: ColorSwatch[] = [];
  let idx = 1;
  found.forEach((meta, hex) => {
    result.push(parseColor(hex, meta.name || `Колір ${idx}`, meta.role || `Color ${idx}`));
    idx++;
  });

  return result;
}
