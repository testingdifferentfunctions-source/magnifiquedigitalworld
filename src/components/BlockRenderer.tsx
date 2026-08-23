import { slugifyHeading, type ContentBlock } from "@/lib/blocks";

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
              ? "text-2xl font-bold scroll-mt-28"
              : level === 3
              ? "text-xl font-semibold scroll-mt-28"
              : "text-lg font-semibold scroll-mt-28";
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

        if (block.type === "list") {
          return (
            <ul key={block.id} className="list-disc pl-6 space-y-2 text-muted-foreground">
              {(block.items ?? []).filter(Boolean).map((item, i) => (
                <li key={i} className="leading-relaxed">{item}</li>
              ))}
            </ul>
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
