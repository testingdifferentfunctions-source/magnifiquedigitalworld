export interface ColorSwatch {
  badge?: string | number;
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
  role?: string;
  subtitle?: string;
  description?: string;
  css_snippet?: string;
  scss_snippet?: string;
  tailwind_snippet?: string;
}

export interface ColorDetailBlock {
  id?: string;
  type: "color_detail";
  badge?: string | number;
  subtitle?: string;
  title?: string;
  description?: string;
  hex: string;
  rgb?: string;
  hsl?: string;
  oklch?: string;
  css_snippet?: string;
  scss_snippet?: string;
  tailwind_snippet?: string;
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

/** Convert sRGB [0-255] to OKLCH string format */
export function rgbToOklch(
  r: number,
  g: number,
  b: number
): { l: number; c: number; h: number; formatted: string } {
  const linearize = (val: number) => {
    const v = val / 255;
    return v >= 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
  };

  const rLin = linearize(r);
  const gLin = linearize(g);
  const bLin = linearize(b);

  // Linear sRGB to LMS (Oklab transfer)
  const l = 0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin;
  const m = 0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin;
  const s = 0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  // LMS to Oklab
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // Oklab to OKLCH
  const C = Math.sqrt(a * a + b_ * b_);
  let h = (Math.atan2(b_, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  if (isNaN(h)) h = 0;

  const formattedL = (L * 100).toFixed(1);
  const formattedC = C.toFixed(3);
  const formattedH = h.toFixed(1);
  const formatted = `oklch(${formattedL}% ${formattedC} ${formattedH})`;

  return {
    l: L,
    c: C,
    h,
    formatted,
  };
}

/** Parse any hex code into complete swatch with HEX, RGB, HSL, OKLCH and role */
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
      oklch: "oklch(0.0% 0.000 0.0)",
      role: role || "Color",
    };
  }

  const hslObj = rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b);
  const oklchObj = rgbToOklch(rgbObj.r, rgbObj.g, rgbObj.b);
  const formattedHex = hex.toUpperCase();
  const formattedRgb = `rgb(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b})`;
  const formattedHsl = `hsl(${hslObj.h}, ${hslObj.s}%, ${hslObj.l}%)`;

  return {
    name: name || formattedHex,
    hex: formattedHex,
    rgb: formattedRgb,
    hsl: formattedHsl,
    oklch: oklchObj.formatted,
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

/** Generate CSS, SCSS, Tailwind, and OKLCH code snippets for a single color swatch */
export function generateColorSnippets(swatch: ColorSwatch, index: number = 0) {
  const slug = slugifyColorName(swatch.name || swatch.role || `color-${index + 1}`, index);

  const css = `/* CSS Variables & Utilities */
:root {
  --${slug}: ${swatch.hex};
  --${slug}-oklch: ${swatch.oklch};
}

.element {
  background-color: var(--${slug});
  color: ${swatch.hex};
  border-color: ${swatch.oklch};
}`;

  const scss = `// SCSS Variables & Mixin
$${slug}: ${swatch.hex};
$${slug}-oklch: ${swatch.oklch};

.element {
  background-color: $${slug};
  color: $${slug};
  border: 1px solid ${swatch.oklch};
}`;

  const tailwind = `// 1. In tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        '${slug}': '${swatch.hex}',
        '${slug}-oklch': '${swatch.oklch}',
      },
    },
  },
}

// 2. In your HTML / JSX markup
<div className="bg-[${swatch.hex}] text-[${swatch.oklch}] border-[${swatch.oklch}]">
  Palette Element
</div>`;

  const oklch = `/* Modern CSS Color 4 OKLCH Specification */
:root {
  --${slug}: ${swatch.oklch};
}

.element {
  background: ${swatch.oklch};
  color: ${swatch.hex};
  outline: 2px solid ${swatch.oklch};
}`;

  return { css, scss, tailwind, oklch };
}

/** Extract colors from tags, blocks, or specific JSON format */
export function extractColorsFromEntry(entry: {
  tags?: string[];
  blocks_uk?: any[];
  blocks_en?: any[];
}): ColorSwatch[] {
  // 1. Check for explicit structured color_detail blocks first
  const blocks = (entry.blocks_uk && entry.blocks_uk.length > 0) ? entry.blocks_uk : (entry.blocks_en || []);
  const explicitColorBlocks = (blocks || []).filter(
    (b) => b && (b.type === "color_detail" || b.type === "color-detail")
  );

  if (explicitColorBlocks.length > 0) {
    return explicitColorBlocks.map((b, idx) => {
      const rawHex = b.hex ? (b.hex.startsWith("#") ? b.hex : `#${b.hex}`).toUpperCase() : "#8ABEB9";
      const parsed = parseColor(rawHex, b.title || b.name, b.subtitle || b.role);
      const defaultSnippets = generateColorSnippets(parsed, idx);

      return {
        badge: b.badge !== undefined && b.badge !== "" ? b.badge : String(idx + 1),
        name: b.title || b.name || `Колір ${idx + 1}`,
        role: b.subtitle || b.role || `Color ${idx + 1}`,
        subtitle: b.subtitle || b.role || `Color ${idx + 1}`,
        description: b.description || "Клікніть на значення нижче для швидкого копіювання",
        hex: b.hex ? (b.hex.startsWith("#") ? b.hex.toUpperCase() : `#${b.hex.toUpperCase()}`) : parsed.hex,
        rgb: b.rgb || parsed.rgb,
        hsl: b.hsl || parsed.hsl,
        oklch: b.oklch || parsed.oklch,
        css_snippet: b.css_snippet || defaultSnippets.css,
        scss_snippet: b.scss_snippet || defaultSnippets.scss,
        tailwind_snippet: b.tailwind_snippet || defaultSnippets.tailwind,
      };
    });
  }

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
