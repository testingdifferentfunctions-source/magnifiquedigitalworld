import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import BlockRenderer from "@/components/BlockRenderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Tag } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { localizeEntry, useModeEntry } from "@/hooks/useModeEntries";
import { blocksToPlainText, extractHeadings } from "@/lib/blocks";

const ComponentDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: entry, isLoading } = useModeEntry(id);
  const [activeId, setActiveId] = useState<string | null>(null);

  const loc = entry ? localizeEntry(entry, language) : null;
  const headings = useMemo(() => (loc ? extractHeadings(loc.blocks) : []), [loc]);

  // Highlight the section currently in view in the sticky table of contents.
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    if (!activeId && headings.length > 0) {
      setActiveId(headings[0].id);
    }
    return () => observer.disconnect();
  }, [headings, activeId]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Завантаження...</p>
        </div>
      </PageLayout>
    );
  }

  if (!entry || !loc) {
    return (
      <PageLayout>
        <div className="py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold">Матеріал не знайдено</h1>
          <Button variant="outline" className="hover:text-black" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>
      </PageLayout>
    );
  }

  const canonicalUrl = language === "en"
    ? (entry.canonical_url_en || entry.canonical_url_uk || undefined)
    : (entry.canonical_url_uk || entry.canonical_url_en || undefined);

  return (
    <PageLayout>
      <SEO
        title={`${loc.title} — Компоненти — Magnifique numérique`}
        description={loc.description || blocksToPlainText(loc.blocks).slice(0, 155)}
        path={`/component/${entry.id}`}
        image={entry.image_url ?? undefined}
        type="article"
        canonicalUrl={canonicalUrl}
      />

      <div className="max-w-6xl mx-auto pb-12">
        {/* Top Bar: Back button */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
          <Button
            variant="ghost"
            className="-ml-2 text-muted-foreground hover:text-black inline-flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === "en" ? "Back" : "Назад"}
          </Button>
        </div>

        {/* Header: Title, Description, Outline-style tag pills with small icons */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-foreground">
            {loc.title}
          </h1>
          {loc.description && (
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-4">
              {loc.description}
            </p>
          )}

          {entry.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {entry.tags.map((tag) => {
                const isTemplate = entry.type === "template";
                const accentBorder = isTemplate ? "border-[#C562AF]" : "border-[#F1F5F9]";
                const accentText = isTemplate ? "text-[#C562AF]" : "text-[#F1F5F9]";
                return (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1.5 rounded-full border bg-transparent px-3 py-1 text-xs font-medium ${accentBorder} ${accentText} transition-colors`}
                  >
                    <Tag className={`w-3.5 h-3.5 ${accentText}`} aria-hidden="true" />
                    {tag}
                  </span>
                );
              })}
            </div>
          )}

          {entry.external_url && (
            <div className="pt-5">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href={entry.external_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Офіційний сайт / документація
                </a>
              </Button>
            </div>
          )}
        </header>

        {/* Body Layout (Two-Column): Sticky TOC on the left, Main Block Content on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
          {/* Left Sidebar: Sticky Table of Contents */}
          <aside className="hidden lg:block">
            <nav className="sticky top-28 space-y-3" aria-label="Зміст">
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase pl-1">
                ЗМІСТ
              </p>
              <ul className="space-y-1 border-l border-border relative">
                {headings.map((h) => {
                  const isActive = activeId === h.id;
                  return (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const target = document.getElementById(h.id);
                          if (target) {
                            target.scrollIntoView({ behavior: "smooth" });
                            setActiveId(h.id);
                          }
                        }}
                        className={`block -ml-px border-l-2 py-1.5 pl-4 text-sm transition-colors ${
                          isActive
                            ? "border-primary text-primary font-semibold"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        } ${h.level > 2 ? "pl-7 text-xs" : ""}`}
                      >
                        {h.text}
                      </a>
                    </li>
                  );
                })}
                {headings.length === 0 && (
                  <li className="pl-4 py-1.5 text-sm text-muted-foreground">Немає розділів</li>
                )}
              </ul>
            </nav>
          </aside>

          {/* Right Main Content */}
          <main className="min-w-0">
            <BlockRenderer blocks={loc.blocks} />
          </main>
        </div>
      </div>
    </PageLayout>
  );
};

export default ComponentDetail;
