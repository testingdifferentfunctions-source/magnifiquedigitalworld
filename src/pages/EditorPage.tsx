import React, { useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import CodePlayground from "@/components/CodePlayground";
import { useMode, getModeTitle, getModeSubtitle } from "@/hooks/useMode";
import { useLanguage } from "@/hooks/useLanguage";

const EditorPage: React.FC = () => {
  const { mode, setMode } = useMode();
  const { language } = useLanguage();

  useEffect(() => {
    if (mode !== "editor") {
      setMode("editor");
    }
  }, [mode, setMode]);

  return (
    <PageLayout>
      <SEO
        title="Онлайн-Редактор Python (WebAssembly) — Magnifique numérique"
        description="Пишіть та виконуйте код Python безпосередньо у вашому браузері через WebAssembly та Pyodide з нульовим навантаженням на сервер."
        path="/editor"
        type="website"
      />

      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
          {getModeTitle("editor", language)}
        </h1>
        <p className="text-muted-foreground text-base max-w-3xl">
          {getModeSubtitle("editor", language)}
        </p>
      </section>

      <div className="w-full max-w-6xl mx-auto">
        <CodePlayground />
      </div>
    </PageLayout>
  );
};

export default EditorPage;
