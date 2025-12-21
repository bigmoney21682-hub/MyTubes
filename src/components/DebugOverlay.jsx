// File: src/components/DebugOverlay.jsx
import { useEffect, useState } from "react";

const MAX_LOGS = 200;
const LINE_HEIGHT = 18; // approximate line height in pixels
const VISIBLE_LINES = 4;

export default function DebugOverlay({ pageName = "GLOBAL" }) {
  const [logs, setLogs] = useState([]);

  // Attach global debug function
  useEffect(() => {
    window.debugLog = (msg) => {
      setLogs((prev) => [
        ...prev.slice(-MAX_LOGS + 1),
        `${new Date().toLocaleTimeString()}: ${msg}`,
      ]);
    };

    window.debugLog(`DEBUG: ${pageName} overlay initialized`);

    return () => {
      window.debugLog = null;
    };
  }, [pageName]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "var(--footer-height)", // anchored above footer
        left: 0,
        right: 0,
        maxHeight: LINE_HEIGHT * VISIBLE_LINES, // show 4 lines
        background: "rgba(0,0,0,0.85)",
        color: "#0f0",
        fontSize: "0.8rem",
        overflowY: "auto",
        padding: 4,
        zIndex: 9999,
        pointerEvents: "auto", // enable text selection
        whiteSpace: "pre-wrap",
        userSelect: "text", // allow copying
      }}
    >
      {logs.map((log, i) => (
        <div key={i} style={{ lineHeight: `${LINE_HEIGHT}px` }}>
          {log}
        </div>
      ))}
    </div>
  );
}
