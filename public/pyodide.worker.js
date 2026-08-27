// Pyodide WebAssembly Worker for in-browser Python execution
/* eslint-disable no-restricted-globals */

let pyodide = null;
let pyodideLoadingPromise = null;

async function loadPyodideEngine() {
  if (pyodide) return pyodide;
  if (!pyodideLoadingPromise) {
    pyodideLoadingPromise = (async () => {
      let indexURL = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/";
      try {
        importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");
      } catch (error) {
        console.warn("jsDelivr failed, falling back to unpkg...", error);
        indexURL = "https://unpkg.com/pyodide@0.26.2/";
        importScripts("https://unpkg.com/pyodide@0.26.2/pyodide.js");
      }

      // @ts-ignore
      const py = await self.loadPyodide({
        indexURL,
        stdout: (text) => {
          self.postMessage({ type: "stdout", text: String(text) });
        },
        stderr: (text) => {
          self.postMessage({ type: "stderr", text: String(text) });
        },
      });
      return py;
    })();
  }
  pyodide = await pyodideLoadingPromise;
  return pyodide;
}

self.onmessage = async (event) => {
  const { type, code, id } = event.data || {};

  if (type === "init") {
    try {
      await loadPyodideEngine();
      self.postMessage({
        type: "ready",
        id: String(id || ""),
      });
    } catch (err) {
      const errorMsg = "Failed to initialize Pyodide WebAssembly engine: " + String(err && (err.message || err.toString ? err.toString() : err));
      self.postMessage({
        type: "error",
        error: errorMsg,
        text: errorMsg,
        id: String(id || ""),
      });
    }
    return;
  }

  if (type === "run") {
    const startTime = performance.now();
    try {
      const engine = await loadPyodideEngine();

      // Ensure standard output and error are bound with string casting
      engine.setStdout({
        batched: (text) => {
          self.postMessage({ type: "stdout", text: String(text) });
        },
      });
      engine.setStderr({
        batched: (text) => {
          self.postMessage({ type: "stderr", text: String(text) });
        },
      });

      // Execute the user Python code asynchronously
      const rawResult = await engine.runPythonAsync(String(code || ""));
      const executionTime = Math.round(performance.now() - startTime);

      let resultStr = null;
      if (rawResult !== undefined && rawResult !== null) {
        try {
          if (typeof rawResult === "object" && typeof rawResult.toString === "function") {
            resultStr = String(rawResult.toString());
          } else {
            resultStr = String(rawResult);
          }
        } catch {
          resultStr = "[Result]";
        }

        // Clean up PyProxy reference if applicable to prevent memory leaks
        try {
          if (rawResult && typeof rawResult.destroy === "function") {
            rawResult.destroy();
          }
        } catch {
          // ignore cleanup error
        }
      }

      // Send sanitized primitive payload
      self.postMessage({
        type: "done",
        result: resultStr !== null ? String(resultStr) : null,
        executionTime: Number(executionTime) || 0,
        id: String(id || ""),
      });
    } catch (err) {
      const executionTime = Math.round(performance.now() - startTime);
      const errorMsg = String(err && (err.message || (typeof err.toString === "function" ? err.toString() : err)) || "Execution error");

      self.postMessage({
        type: "error",
        error: errorMsg,
        text: errorMsg,
        executionTime: Number(executionTime) || 0,
        id: String(id || ""),
      });
    }
  }
};
