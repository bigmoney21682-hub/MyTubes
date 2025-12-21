// File: src/components/DebugOverlay.jsx

import { useEffect, useState } from "react";

const MAX_LOGS = 200;
const VISIBLE_LINES = 4;

export default function DebugOverlay() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Install global logger ONCE
    window.debugLog = (msg) => {
      setLogs((prev) => [
        ...prev.slice(-MAX_LOGS + 1),
        `${new Date().toLocaleTimeString()}: ${msg}`,
      ]);
    };

    window.debugLog("DEBUG: DebugOverlay initialized");

    return () => {
      // Do NOT null this unless app fully unmounts
      // (prevents navigation regressions)
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "var(--footer-height)",
        left: 0,
        right: 0,
        height: `${VISIBLE_LINES * 1.4}em`,
        background: "rgba(0,0,0,0.9)",
        color: "#0f0",
        fontSize: "0.8rem",
        overflowY: "auto",
        padding: "4px 8px",
        zIndex: 9999,

        // Critical: allow text selection but block clicks through
        pointerEvents: "auto",
        userSelect: "text",
      }}
    >
      {logs.map((log, i) => (
        <div key={i} style={{ whiteSpace: "pre-wrap", lineHeight: "1.4em" }}>
          {log}
        </div>
      ))}
    </div>
  );
}
