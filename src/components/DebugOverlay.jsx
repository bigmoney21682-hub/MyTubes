// File: src/components/DebugOverlay.jsx
// PCC v20.0 — Full debug console with minimize button (Top‑Left, Style C)

import React, { useEffect, useState } from "react";

export default function DebugOverlay({ pageName = "Unknown", sourceUsed = null }) {
  const [logs, setLogs] = useState([]);
  const [minimized, setMinimized] = useState(false);

  // ------------------------------------------------------------
  // Hook into global debugLog()
  // ------------------------------------------------------------
  useEffect(() => {
    if (!window.debugLog) {
      window.debugLog = (msg) => {
        const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
        window.__debugBuffer = window.__debugBuffer || [];
        window.__debugBuffer.push(entry);
      };
    }

    const interval = setInterval(() => {
      if (window.__debugBuffer && window.__debugBuffer.length > 0) {
        setLogs((prev) => [...prev, ...window.__debugBuffer]);
        window.__debugBuffer = [];
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // ------------------------------------------------------------
  // Clear logs
  // ------------------------------------------------------------
  const clearLogs = () => {
    setLogs([]);
    window.__debugBuffer = [];
  };

  // ------------------------------------------------------------
  // Minimize toggle
  // ------------------------------------------------------------
  const toggleMinimize = () => setMinimized((m) => !m);

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: minimized ? 60 : "100%",
        height: minimized ? 40 : "40%",
        background: minimized ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.85)",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: 12,
        zIndex: 999999,
        borderBottom: minimized ? "none" : "2px solid #0f0",
        borderRight: minimized ? "none" : "2px solid #0f0",
        overflow: "hidden",
        transition: "all 0.25s ease",
      }}
    >
      {/* Minimize Button (Top‑Left) */}
      <button
        onClick={toggleMinimize}
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          width: 28,
          height: 28,
          borderRadius: 4,
          background: "#111",
          border: "1px solid #0f0",
          color: "#0f0",
          fontSize: 16,
          cursor: "pointer",
          zIndex: 1000000,
        }}
      >
        {minimized ? "▣" : "–"}
      </button>

      {/* Minimized mode stops here */}
      {minimized && (
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 40,
            color: "#0f0",
            fontSize: 12,
            opacity: 0.8,
          }}
        >
          Debug
        </div>
      )}

      {!minimized && (
        <>
          {/* Header */}
          <div
            style={{
              padding: "6px 40px 6px 40px",
              borderBottom: "1px solid #0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(0,0,0,0.9)",
            }}
          >
            <div>
              <strong>{pageName}</strong>
              {sourceUsed && <span> — {sourceUsed}</span>}
            </div>

            <button
              onClick={clearLogs}
              style={{
                padding: "4px 8px",
                background: "#111",
                border: "1px solid #0f0",
                color: "#0f0",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Clear
            </button>
          </div>

          {/* Log Window */}
          <div
            style={{
              padding: 8,
              height: "calc(100% - 40px)",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {logs.length === 0 && (
              <div style={{ opacity: 0.6 }}>No logs yet…</div>
            )}

            {logs.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
