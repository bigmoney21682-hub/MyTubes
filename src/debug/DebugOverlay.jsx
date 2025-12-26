/**
 * File: DebugOverlay.jsx
 * Path: src/debug/DebugOverlay.jsx
 * Description: Unified debug overlay that displays boot logs + runtime logs with color coding.
 */

import { useEffect, useState } from "react";
import { subscribeToDebugBus } from "./debugBus";

export default function DebugOverlay() {
  const [logs, setLogs] = useState([]);

  // Merge boot logs on mount
  useEffect(() => {
    const boot = window.bootDebug?._buffer || [];
    setLogs(boot);

    // Subscribe to runtime logs
    const unsub = subscribeToDebugBus((entry) => {
      setLogs((prev) => [...prev, entry]);
    });

    return unsub;
  }, []);

  const colors = {
    INFO: "#0f0",
    WARN: "#ff0",
    ERROR: "#f33",
    BOOT: "#0af",
    API: "#0ff",
    UI: "#f0f"
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100vw",
        maxHeight: "45vh",
        overflowY: "auto",
        background: "rgba(0,0,0,0.85)",
        fontFamily: "monospace",
        fontSize: 12,
        padding: 8,
        zIndex: 999999,
        borderTop: "2px solid #333"
      }}
    >
      {logs.map((log, i) => (
        <div key={i} style={{ color: colors[log.level] || "#0f0" }}>
          [{log.level}] {log.msg}
        </div>
      ))}
    </div>
  );
}
