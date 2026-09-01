import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import CodePlayground from "@/components/CodePlayground";
import { useMode } from "@/hooks/useMode";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Terminal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CodeEditorPage: React.FC = () => {
  const { mode, setMode } = useMode();
  const { language, t } = useLanguage();

  useEffect(() => {
    if (mode !== "tools") {
      setMode("tools");
    }
  }, [mode, setMode]);

  return (
    <PageLayout>
      <SEO
        title={`${language === "en" ? "Python Code Editor (WebAssembly)" : "Онлайн-Редактор Python (WebAssembly)"} — Magnifique numérique`}
        description={
          language === "en"
            ? "Write and execute Python code directly in your browser via WebAssembly and Pyodide with zero server latency."
            : "Пишіть та виконуйте код Python безпосередньо у вашому браузері через WebAssembly та Pyodide з нульовим навантаженням на сервер."
        }
        path="/tools/code-editor"
        type="website"
      />

      {/* Top Breadcrumbs / Back Navigation */}
      <section className="mb-4 flex items-center justify-between">
        <Link to="/tools" className="inline-flex items-center gap-2 group">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-[#BDA6CE]/10 gap-2 pl-2 pr-3.5 rounded-xl border border-[#393E46] hover:border-[#BDA6CE]/60"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#BDA6CE]" />
            <span className="font-medium text-sm">
              {language === "en" ? "Back to Tools Hub" : "← До всіх інструментів"}
            </span>
          </Button>
        </Link>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#080202] text-[#BDA6CE] border border-[#BDA6CE]/30">
          <Terminal className="w-3.5 h-3.5 text-[#BDA6CE]" />
          <span>Python 3.12 • Pyodide WebAssembly</span>
        </div>
      </section>

      {/* Code Editor Full Workspace */}
      <div className="w-full max-w-6xl mx-auto">
        <CodePlayground />
      </div>
    </PageLayout>
  );
};

export default CodeEditorPage;
