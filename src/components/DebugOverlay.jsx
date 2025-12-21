// File: src/components/DebugOverlay.jsx
import { useEffect, useState } from "react";

let globalLogs = [];

export function addDebugLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  globalLogs.push(`${timestamp}: DEBUG: ${message}`);
  // Keep only last 50 logs for performance
  if (globalLogs.length > 50) globalLogs.shift();
}

export default function DebugOverlay() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Mount log
    addDebugLog("DebugOverlay mounted");

    // Interval to sync logs
    const interval = setInterval(() => {
      setLogs([...globalLogs]);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: "40vh", // Restore full-height scrollable behavior
        background: "rgba(0,0,0,0.9)",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: 12,
        padding: 8,
        overflowY: "auto",
        zIndex: 9999,
        pointerEvents: "none", // Prevent interference with UI clicks
        whiteSpace: "pre-wrap",
      }}
    >
      {logs.map((log, i) => (
        <div key={i}>{log}</div>
      ))}
    </div>
  );
}
