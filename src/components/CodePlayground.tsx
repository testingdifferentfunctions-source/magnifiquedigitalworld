import React, { useState, useEffect, useRef, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  Play,
  Square,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Terminal as TerminalIcon,
  Sparkles,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ModeSwitcher from "@/components/ModeSwitcher";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

interface LogMessage {
  id: string;
  type: "stdout" | "stderr" | "info" | "success" | "error" | "system";
  text: string;
  timestamp: string;
}

const DEFAULT_PYTHON_SNIPPET = `# Magnifique numérique — Python in WebAssembly (Pyodide)
import time
import math

def calculate_fibonacci(n):
    """Calculate Fibonacci sequence with timing."""
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

print("✨ Вітаємо у WebAssembly Редакторі Python!")
print("🚀 Код виконується безпосередньо у вашому браузері через WebAssembly.\\n")

# Fibonacci demo
n = 15
start = time.perf_counter()
fib_seq = calculate_fibonacci(n)
elapsed = (time.perf_counter() - start) * 1000

print(f"📊 Перші {n} чисел Фібоначчі:")
print(fib_seq)
print(f"⏱️ Час обчислення: {elapsed:.3f} ms\\n")

# Math demo
print("📐 Математичні обчислення:")
for angle in [0, 30, 45, 60, 90]:
    rad = math.radians(angle)
    print(f"   sin({angle:2d}°) = {math.sin(rad):.4f} | cos({angle:2d}°) = {math.cos(rad):.4f}")

print("\\n✅ Виконання завершено успішно!")
`;

const EXECUTION_TIMEOUT_MS = 10000; // 10s strict timeout

// Custom CodeMirror theme matching application slate dark palette
const slateEditorTheme = EditorView.theme(
  {
    "&": {
      color: "#EEEEEE",
      backgroundColor: "#222831",
      fontSize: "14px",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      height: "100%",
      width: "100%",
    },
    ".cm-content": {
      caretColor: "#BDA6CE",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      lineHeight: "21px",
      padding: "14px 0",
      WebkitTextSizeAdjust: "100%",
      textSizeAdjust: "100%",
    },
    "&.cm-focused": {
      outline: "none !important",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "#BDA6CE",
      borderLeftWidth: "2px",
    },
    "&.cm-focused .cm-selectionBackground, ::selection, .cm-selectionBackground": {
      backgroundColor: "rgba(189, 166, 206, 0.25) !important",
    },
    ".cm-gutters": {
      backgroundColor: "#1B2027",
      color: "#596877",
      border: "none",
      borderRight: "1px solid #2D3540",
      paddingRight: "6px",
      userSelect: "none",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      paddingLeft: "10px",
      paddingRight: "6px",
      minWidth: "28px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#272F3B",
      color: "#BDA6CE",
      fontWeight: "bold",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(44, 52, 64, 0.4)",
    },
    ".cm-line": {
      padding: "0 14px",
      fontFeatureSettings: '"liga" 0, "calt" 0',
    },
    ".cm-scroller": {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      overflow: "auto",
      height: "100% !important",
    },
  },
  { dark: true }
);

export const CodePlayground: React.FC = () => {
  const { t, language } = useLanguage();
  const [code, setCode] = useState<string>(DEFAULT_PYTHON_SNIPPET);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "ready" | "running" | "error" | "timeout">("idle");
  const [engineReady, setEngineReady] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  const formatTimestamp = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}.${d.getMilliseconds().toString().padStart(3, "0")}`;
  };

  const appendLog = useCallback((type: LogMessage["type"], text: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type,
        text,
        timestamp: formatTimestamp(),
      },
    ]);
  }, []);

  // Initialize Web Worker for Pyodide execution
  const initWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    try {
      const worker = new Worker("/pyodide.worker.js");
      workerRef.current = worker;

      worker.onmessage = (e: MessageEvent) => {
        const { type, text, error, executionTime: execTime, result } = e.data || {};

        if (type === "ready") {
          setEngineReady(true);
          setStatus("ready");
          appendLog(
            "system",
            language === "en"
              ? "✨ Pyodide WebAssembly engine initialized."
              : "✨ Рушій Pyodide WebAssembly готовий до роботи."
          );
        } else if (type === "stdout") {
          appendLog("stdout", text);
        } else if (type === "stderr") {
          appendLog("stderr", text);
        } else if (type === "done") {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          if (result !== null && result !== undefined && result !== "") {
            appendLog("info", `=> ${result}`);
          }
          setExecutionTime(execTime || 0);
          setStatus("ready");
          appendLog(
            "success",
            language === "en"
              ? `✔ Process finished in ${execTime || 0}ms`
              : `✔ Виконання завершено за ${execTime || 0}мс`
          );
        } else if (type === "error") {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setStatus("error");
          setExecutionTime(execTime || 0);
          appendLog("error", error || text || "Unknown execution error");
        }
      };

      worker.onerror = (err) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setStatus("error");
        appendLog("error", `Worker error: ${err.message || "Failed to execute worker"}`);
      };

      // Trigger Pyodide pre-load
      worker.postMessage({ type: "init" });
    } catch (err: any) {
      appendLog("error", `Failed to create Web Worker: ${err.message || String(err)}`);
      setStatus("error");
    }
  }, [appendLog, language]);

  useEffect(() => {
    initWorker();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (workerRef.current) workerRef.current.terminate();
    };
  }, [initWorker]);

  // Autoscroll terminal on logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleRunCode = () => {
    if (!code.trim()) {
      toast.warning(language === "en" ? "Code is empty" : "Код порожній");
      return;
    }

    if (!workerRef.current) {
      initWorker();
    }

    setStatus("running");
    setExecutionTime(null);
    appendLog("system", language === "en" ? "▶ Running Python code..." : "▶ Запуск коду Python...");

    // Setup 10-second strict timeout mechanism
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      setStatus("timeout");
      appendLog(
        "error",
        language === "en"
          ? `⛔ Execution timed out (${EXECUTION_TIMEOUT_MS / 1000}s limit exceeded). Worker forcefully terminated to prevent freezing.`
          : `⛔ Перевищено ліміт часу (${EXECUTION_TIMEOUT_MS / 1000}с). Процес примусово зупинено для уникнення зависання браузера.`
      );
      // Automatically respawn worker for next execution
      setTimeout(() => {
        initWorker();
      }, 300);
    }, EXECUTION_TIMEOUT_MS);

    workerRef.current?.postMessage({
      type: "run",
      code,
      id: Date.now().toString(),
    });
  };

  const handleStopExecution = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setStatus("idle");
    appendLog(
      "system",
      language === "en" ? "⏹ Execution stopped by user." : "⏹ Виконання зупинено користувачем."
    );
    // Respawn worker
    setTimeout(() => {
      initWorker();
    }, 200);
  };

  const handleClearConsole = () => {
    setLogs([]);
    setExecutionTime(null);
  };

  const handleResetCode = () => {
    setCode(DEFAULT_PYTHON_SNIPPET);
    toast.info(language === "en" ? "Code reset to default" : "Код скинуто до початкового стану");
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(language === "en" ? "Code copied to clipboard!" : "Код скопійовано у буфер обміну!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(language === "en" ? "Failed to copy code" : "Не вдалося скопіювати код");
    }
  };

  return (
    <div
      id="editor-mode-container"
      className="flex flex-col h-[calc(100dvh-4rem)] w-full overflow-hidden rounded-2xl bg-[#222831] border border-[#393E46] shadow-2xl transition-all"
    >
      {/* Step 1: Stable Top Toolbar with horizontal scroll */}
      <div className="flex flex-row overflow-x-auto whitespace-nowrap shrink-0 flex-none z-10 w-full p-2.5 sm:p-4 border-b border-[#393E46] bg-[#222831] items-center gap-2 sm:gap-3 no-scrollbar touch-pan-x">
        {/* Global Mode Switcher in Editor mode toolbar */}
        <div className="shrink-0">
          <ModeSwitcher className="bg-[#1A1F26] border-[#393E46] text-white hover:border-[#BDA6CE] transition-colors h-10 px-3 text-sm rounded-xl" />
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
          {/* Run / Stop Button */}
          {status === "running" ? (
            <Button
              id="stop-code-button"
              onClick={handleStopExecution}
              className="h-10 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 gap-2 font-medium shrink-0 whitespace-nowrap active:scale-95 transition-transform"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>{t("editor.stop")}</span>
            </Button>
          ) : (
            <Button
              id="run-code-button"
              onClick={handleRunCode}
              disabled={!engineReady && status === "idle"}
              className="h-10 px-4 rounded-xl !bg-[#BDA6CE] hover:!bg-[#d6c4e4] !text-[#1A1F26] font-semibold gap-2 shadow-lg shadow-[#BDA6CE]/20 transition-all active:scale-95 shrink-0 whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{status === "running" ? t("editor.running") : t("editor.run")}</span>
            </Button>
          )}

          {/* Clear Console */}
          <Button
            id="clear-console-button"
            variant="outline"
            onClick={handleClearConsole}
            title={t("editor.clear_console")}
            className="h-10 px-3.5 rounded-xl border-[#393E46] bg-[#1A1F26] hover:bg-[#1A1F26] hover:border-[#BDA6CE] hover:text-[#BDA6CE] text-slate-200 gap-1.5 shrink-0 whitespace-nowrap transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t("editor.clear_console")}</span>
          </Button>

          {/* Reset Code */}
          <Button
            id="reset-code-button"
            variant="outline"
            onClick={handleResetCode}
            title={t("editor.reset")}
            className="h-10 px-3.5 rounded-xl border-[#393E46] bg-[#1A1F26] hover:bg-[#1A1F26] hover:border-[#BDA6CE] hover:text-[#BDA6CE] text-slate-200 gap-1.5 shrink-0 whitespace-nowrap transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("editor.reset")}</span>
          </Button>

          {/* Copy Code */}
          <Button
            id="copy-code-button"
            variant="outline"
            onClick={handleCopyCode}
            title={t("editor.copy")}
            className="h-10 px-3.5 rounded-xl border-[#393E46] bg-[#1A1F26] hover:bg-[#1A1F26] hover:border-[#BDA6CE] hover:text-[#BDA6CE] text-slate-200 gap-1.5 shrink-0 whitespace-nowrap transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#BDA6CE]" />
                <span className="text-[#BDA6CE] whitespace-nowrap">{t("editor.copied")}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t("editor.copy")}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Responsive Split Layout */}
      <div className="flex flex-col flex-1 min-h-0 divide-y divide-[#393E46] w-full">
        {/* Step 2 & Step 5: CodeMirror 6 Mobile-Compatible Quarantine Container */}
        <div
          id="codemirror-outer-container"
          translate="no"
          className="notranslate relative flex-1 min-h-0 w-full h-full overflow-hidden text-left isolate bg-[#222831] !outline-none"
          style={{ WebkitTextSizeAdjust: "100%", textSizeAdjust: "100%" }}
        >
          <CodeMirror
            value={code}
            height="100%"
            className="h-full w-full text-left"
            theme="dark"
            extensions={[python(), EditorView.lineWrapping, oneDark, slateEditorTheme]}
            onChange={(val) => setCode(val)}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              history: true,
              foldGutter: false,
              drawSelection: true,
              dropCursor: true,
              allowMultipleSelections: false,
              indentOnInput: true,
              syntaxHighlighting: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: false,
              crosshairCursor: false,
              highlightActiveLine: true,
              highlightSelectionMatches: false,
              closeBracketsKeymap: true,
              defaultKeymap: true,
              searchKeymap: true,
              historyKeymap: true,
              foldKeymap: false,
              completionKeymap: true,
              lintKeymap: false,
            }}
          />
        </div>

        {/* Step 3: Bottom Console container */}
        <div className="w-full bg-[#222831] flex flex-col h-56 sm:h-64 md:h-72 shrink-0 flex-shrink-0 overflow-hidden">
          {/* Terminal Title Bar */}
          <div className="px-3.5 sm:px-4 py-2.5 bg-[#1A1F26] border-b border-[#393E46] flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-[#BDA6CE]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#BDA6CE]">
                [ {t("editor.terminal_title")} ]
              </span>
            </div>

            {/* Status indicator & Execution time */}
            <div className="flex items-center gap-3 text-xs font-mono">
              {executionTime !== null && (
                <div className="flex items-center gap-1 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-[#BDA6CE]" />
                  <span>{executionTime} ms</span>
                </div>
              )}

              {status === "running" ? (
                <span className="flex items-center gap-1.5 text-[#BDA6CE] animate-pulse font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#BDA6CE] animate-ping" />
                  {t("editor.status_running")}
                </span>
              ) : status === "error" ? (
                <span className="flex items-center gap-1.5 text-red-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {t("editor.status_error")}
                </span>
              ) : status === "timeout" ? (
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  {t("editor.status_timeout")}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {t("editor.status_ready")}
                </span>
              )}
            </div>
          </div>

          {/* Terminal Stream Body with touch-pan-y */}
          <div
            id="terminal-output-area"
            className="p-3.5 sm:p-4 overflow-y-auto touch-pan-y font-mono text-xs sm:text-sm space-y-1.5 select-text flex-1 bg-[#222831]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {logs.length === 0 ? (
              <div className="text-slate-400 py-6 text-center italic">
                <Sparkles className="w-5 h-5 mx-auto mb-2 text-[#BDA6CE]/60" />
                <p className="text-slate-200">{t("editor.welcome")}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Pyodide WebAssembly • Zero server overhead • Full client-side isolation
                </p>
              </div>
            ) : (
              logs.map((log) => {
                let colorClass = "text-slate-200";
                let prefix = ">";

                if (log.type === "stderr" || log.type === "error") {
                  colorClass = "text-red-300 bg-red-950/40 px-1 py-0.5 rounded";
                  prefix = "✖";
                } else if (log.type === "success") {
                  colorClass = "text-emerald-400 font-medium";
                  prefix = "✔";
                } else if (log.type === "system") {
                  colorClass = "text-[#BDA6CE] italic";
                  prefix = "⚡";
                } else if (log.type === "info") {
                  colorClass = "text-sky-300";
                  prefix = "ⓘ";
                }

                return (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-400 select-none text-xs">{log.timestamp}</span>
                    <span className="text-[#BDA6CE] select-none font-bold">{prefix}</span>
                    <pre
                      className={`whitespace-pre-wrap font-mono flex-1 break-words ${colorClass}`}
                    >
                      {log.text}
                    </pre>
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePlayground;
