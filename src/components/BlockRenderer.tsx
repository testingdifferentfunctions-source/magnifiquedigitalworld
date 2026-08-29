import { slugifyHeading, type ContentBlock } from "@/lib/blocks";
import { Info, ExternalLink, BookOpen } from "lucide-react";

interface BlockRendererProps {
  blocks: ContentBlock[];
  className?: string;
}

/**
 * Renders structured block content. Nothing is injected as HTML, so authored
 * content cannot introduce script or markup injection.
 */
const BlockRenderer = ({ blocks, className }: BlockRendererProps) => {
  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      {blocks.map((block, index) => {
        if (block.type === "header") {
          const text = block.text ?? "";
          const id = slugifyHeading(text, index);
          const level = block.level ?? 2;
          const classes =
            level === 2
              ? "text-2xl font-bold scroll-mt-28 text-foreground"
              : level === 3
              ? "text-xl font-semibold scroll-mt-28 text-foreground"
              : "text-lg font-semibold scroll-mt-28 text-foreground";
          if (level === 3) return <h3 key={block.id} id={id} className={classes}>{text}</h3>;
          if (level === 4) return <h4 key={block.id} id={id} className={classes}>{text}</h4>;
          return <h2 key={block.id} id={id} className={classes}>{text}</h2>;
        }

        if (block.type === "paragraph") {
          return (
            <p key={block.id} className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
              {block.text}
            </p>
          );
        }

        if (block.type === "image") {
          if (!block.image_url) return null;
          return (
            <figure key={block.id} className="my-6 space-y-2">
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <img
                  src={block.image_url}
                  alt={block.alt || block.caption || "Research visual data"}
                  className="w-full h-auto max-h-[550px] object-contain rounded-xl bg-black/20 mx-auto"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              {(block.caption || block.alt) && (
                <figcaption className="text-center text-xs text-muted-foreground italic px-2">
                  {block.caption || block.alt}
                </figcaption>
              )}
            </figure>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={block.id} className="list-disc pl-6 space-y-2 text-muted-foreground">
              {(block.items ?? []).filter(Boolean).map((item, i) => (
                <li key={i} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={block.id}
              className="relative my-6 pl-5 py-2 border-l-4 border-primary/80 bg-primary/5 rounded-r-lg text-foreground italic"
            >
              <p className="text-base leading-relaxed">{block.text}</p>
              {block.caption && (
                <cite className="block not-italic text-xs text-muted-foreground mt-2 font-medium">
                  — {block.caption}
                </cite>
              )}
            </blockquote>
          );
        }

        if (block.type === "callout") {
          return (
            <div
              key={block.id}
              className="my-6 p-4 rounded-xl border border-primary/25 bg-primary/10 flex items-start gap-3 text-sm text-foreground"
            >
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="whitespace-pre-line leading-relaxed">{block.text}</div>
            </div>
          );
        }

        if (block.type === "sources") {
          const sources = (block.sources ?? []).filter((s) => s.url);
          if (sources.length === 0) return null;
          return (
            <div
              key={block.id}
              className="my-6 p-4 rounded-xl border border-border bg-card/60 space-y-3"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Використані джерела та матеріали</span>
              </div>
              <ul className="space-y-1.5 pl-1">
                {sources.map((s, idx) => (
                  <li key={idx} className="text-sm">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                    >
                      <span>{s.title || s.url}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        return (
          <pre
            key={block.id}
            dir="ltr"
            className="overflow-x-auto rounded-lg border border-border bg-muted p-4 text-sm"
          >
            <code className="font-mono text-foreground">{block.code}</code>
          </pre>
        );
      })}
    </div>
  );
};

export default BlockRenderer;
