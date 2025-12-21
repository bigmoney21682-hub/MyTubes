// File: src/components/DebugOverlay.jsx
import { useEffect, useState } from "react";

export default function DebugOverlay() {
  const [logs, setLogs] = useState([]);

  // Push a log
  const pushLog = (msg) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    // Mount-time log
    pushLog("DEBUG: DebugOverlay mounted");

    // Expose global function for temporary debugging
    window.debugLog = (msg) => pushLog(msg);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "var(--footer-height)", // place just above footer
        left: 0,
        right: 0,
        maxHeight: "30vh",
        overflowY: "auto",
        background: "rgba(0,0,0,0.85)",
        color: "#0f0",
        fontSize: "12px",
        padding: "4px 8px",
        zIndex: 2000,
        fontFamily: "monospace",
      }}
    >
      {logs.map((log, i) => (
        <div key={i}>{log}</div>
      ))}
    </div>
  );
}
