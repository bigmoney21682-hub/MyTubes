// File: src/components/DebugOverlay.jsx
// PCC v3.3 — Guaranteed top-line visibility with blank spacer lines

import { useEffect, useRef, useState } from "react";

const MAX_LOGS = 300;
const VISIBLE_LINES = 6;

export default function DebugOverlay({ pageName }) {
  const [logs, setLogs] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    window.debugLog = (msg) => {
      const timestamp = new Date().toLocaleTimeString();
      const line = `${timestamp}: ${msg}`;
      setLogs((prev) => [...prev.slice(-MAX_LOGS + 1), line]);
    };

    window.debugLog("DEBUG: DebugOverlay initialized");
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => setLogs([]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        bottom: "var(--footer-height)",
        left: 0,
        right: 0,
        height: `${(VISIBLE_LINES + 2) * 1.4}em`, // +2 lines
        background: "rgba(0,0,0,0.9)",
        color: "#0f0",
        fontSize: "0.8rem",
        overflowY: "auto",
        padding: "12px 8px 4px 8px", // more top padding
        zIndex: 9999,
        borderTop: "1px solid #333",
      }}
    >
      {/* Spacer lines to guarantee visibility on iOS */}
      <div style={{ height: "1.4em" }}></div>
      <div style={{ height: "1.4em" }}></div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
          opacity: 0.8,
        }}
      >
        <div>{pageName ? `Page: ${pageName}` : "Debug Console"}</div>

        <button
          onClick={clearLogs}
          style={{
            background: "none",
            border: "1px solid #0f0",
            color: "#0f0",
            padding: "0 6px",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "0.7rem",
          }}
        >
          Clear
        </button>
      </div>

      {logs.map((log, i) => (
        <div key={i} style={{ whiteSpace: "pre-wrap", lineHeight: "1.4em" }}>
          {log}
        </div>
      ))}
    </div>
  );
}
