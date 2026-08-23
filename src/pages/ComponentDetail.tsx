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
  const { language, setLanguage } = useLanguage();
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
    setActiveId(headings[0].id);
    return () => observer.disconnect();
  }, [headings]);

  if (isLoading) {
    return (
      <PageLayout>
        <p className="text-muted-foreground py-12 text-center">Завантаження...</p>
      </PageLayout>
    );
  }

  if (!entry || !loc) {
    return (
      <PageLayout>
        <div className="py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold">Матеріал не знайдено</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Усі бібліотеки
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO
        title={`${loc.title} — Magnifique numérique`}
        description={loc.description || blocksToPlainText(loc.blocks).slice(0, 155)}
        path={`/library/${entry.id}`}
        type="article"
      />

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Button variant="ghost" className="-ml-2" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Усі бібліотеки
          </Button>

          <div
            className="flex items-center rounded-lg border border-border p-1"
            role="group"
            aria-label="Мова матеріалу"
          >
            {(["uk", "en"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                aria-pressed={language === lang}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  language === lang
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <header className="mb-6">
          <h1 className="text-4xl font-bold mb-3">{loc.title}</h1>
          {loc.description && (
            <p className="text-lg text-muted-foreground leading-relaxed">{loc.description}</p>
          )}
        </header>

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
              >
                <Tag className="w-3.5 h-3.5" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {entry.external_url && (
          <Button asChild variant="outline" className="mb-10">
            <a href={entry.external_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
              Посилання
            </a>
          </Button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
          <aside className="hidden lg:block">
            <nav className="sticky top-28" aria-label="Зміст">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground mb-3">
                ЗМІСТ
              </p>
              <ul className="space-y-1 border-l border-border">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className={`block -ml-px border-l-2 py-1.5 pl-3 text-sm transition-colors ${
                        activeId === h.id
                          ? "border-primary text-primary font-medium"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      } ${h.level > 2 ? "pl-6" : ""}`}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
                {headings.length === 0 && (
                  <li className="pl-3 py-1.5 text-sm text-muted-foreground">Немає розділів</li>
                )}
              </ul>
            </nav>
          </aside>

          <article className="min-w-0">
            <BlockRenderer blocks={loc.blocks} />
          </article>
        </div>
      </div>
    </PageLayout>
  );
};

export default ComponentDetail;
