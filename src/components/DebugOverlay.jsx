// File: src/components/DebugOverlay.jsx
import { useEffect, useState } from "react";

export default function DebugOverlay() {
  const [logs, setLogs] = useState([]);

  // Append log safely
  const addLog = (msg) => {
    setLogs((prev) => [...prev.slice(-49), msg]); // keep last 50
    console.log(msg);
  };

  useEffect(() => {
    // Global JS errors
    const handleError = (msg, url, line, col, error) => {
      addLog({ type: "error", msg, url, line, col, error: error?.toString() });
    };
    window.onerror = handleError;

    // Unhandled promise rejections
    const handleRejection = (e) => {
      addLog({ type: "promise", reason: e.reason?.toString() });
    };
    window.onunhandledrejection = handleRejection;

    // Optional: capture console.log, console.warn, console.error
    const originalLog = console.log;
    console.log = (...args) => {
      addLog({ type: "log", args });
      originalLog(...args);
    };
    const originalWarn = console.warn;
    console.warn = (...args) => {
      addLog({ type: "warn", args });
      originalWarn(...args);
    };
    const originalError = console.error;
    console.error = (...args) => {
      addLog({ type: "error", args });
      originalError(...args);
    };

    return () => {
      window.onerror = null;
      window.onunhandledrejection = null;
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        maxHeight: "30vh",
        overflowY: "auto",
        background: "rgba(0,0,0,0.8)",
        color: "#0f0",
        fontSize: "12px",
        fontFamily: "monospace",
        padding: "6px",
        zIndex: 99999,
        pointerEvents: "none",
      }}
    >
      {logs.map((log, i) => (
        <div key={i}>
          {log.type === "log" && `[LOG] ${log.args.join(" ")}`}
          {log.type === "warn" && `[WARN] ${log.args.join(" ")}`}
          {log.type === "error" && log.msg ? `[ERROR] ${log.msg} (${log.url}:${log.line})` : `[ERROR] ${log.args?.join(" ")}`}
          {log.type === "promise" && `[PROMISE REJECTION] ${log.reason}`}
        </div>
      ))}
    </div>
  );
}
