// File: src/components/DebugOverlay.jsx

import { useState, useEffect } from "react";

export default function DebugOverlay() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Capture console.log output
    const originalLog = console.log;
    console.log = (...args) => {
      setLogs((prev) => [...prev, args.map(String).join(" ")].slice(-50)); // keep last 50 logs
      originalLog(...args);
    };

    return () => {
      console.log = originalLog; // restore original log on unmount
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "var(--footer-height)", // pinned above footer
        left: 0,
        right: 0,
        maxHeight: "200px",
        overflowY: "auto",
        background: "rgba(0,0,0,0.85)",
        color: "#0f0",
        fontSize: "12px",
        fontFamily: "monospace",
        padding: "6px 8px",
        zIndex: 1500,
        pointerEvents: "none", // allows clicks through the overlay
        boxShadow: "0 -2px 8px rgba(0,0,0,0.7)",
      }}
    >
      {logs.map((log, i) => (
        <div key={i}>{log}</div>
      ))}
    </div>
  );
}
