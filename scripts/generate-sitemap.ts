// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://byte-scribe-studio.lovable.app";
const SUPABASE_URL = "https://xpncqrkmzsufwahmozis.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbmNxcmttenN1ZndhaG1vemlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MzU0OTUsImV4cCI6MjA4MzAxMTQ5NX0.UvvLb2lz6yIPy4M392E3sjr7rjWhjhNVPprhQGm-gHY";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) return [];
  return res.json();
}

async function buildEntries(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/popular", changefreq: "daily", priority: "0.8" },
    { path: "/favorites", changefreq: "daily", priority: "0.8" },
    { path: "/sections", changefreq: "weekly", priority: "0.8" },
    { path: "/about", changefreq: "monthly", priority: "0.5" },
  ];

  try {
    const articles = (await fetchJson(
      `${SUPABASE_URL}/rest/v1/articles?select=id,updated_at&published=eq.true`
    )) as Array<{ id: string; updated_at: string }>;
    for (const a of articles) {
      entries.push({
        path: `/article/${a.id}`,
        lastmod: a.updated_at?.slice(0, 10),
        changefreq: "weekly",
        priority: "0.7",
      });
    }

    const categories = (await fetchJson(
      `${SUPABASE_URL}/rest/v1/categories?select=id`
    )) as Array<{ id: string }>;
    for (const c of categories) {
      entries.push({ path: `/section/${c.id}`, changefreq: "weekly", priority: "0.6" });
    }
  } catch (err) {
    console.warn("sitemap: failed to fetch dynamic entries", err);
  }

  return entries;
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

(async () => {
  const entries = await buildEntries();
  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
})();
