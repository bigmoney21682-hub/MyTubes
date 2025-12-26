/**
 * File: DebugOverlay.jsx
 * Path: src/debug/DebugOverlay.jsx
 * Description: Unified debug overlay with collapse toggle, clear button, and network inspector.
 */

import { useEffect, useState } from "react";
import { subscribeToDebugBus } from "./debugBus";

export default function DebugOverlay() {
  const [logs, setLogs] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [showNet, setShowNet] = useState(false);

  // Merge boot logs + subscribe to runtime logs
  useEffect(() => {
    const boot = window.bootDebug?._buffer || [];
    setLogs(boot);

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
    UI: "#f0f",
    NET: "#ffa500"
  };

  const filtered = showNet
    ? logs.filter((l) => l.level === "NET")
    : logs;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100vw",
        maxHeight: collapsed ? "32px" : "45vh",
        overflowY: collapsed ? "hidden" : "auto",
        background: "rgba(0,0,0,0.85)",
        fontFamily: "monospace",
        fontSize: 12,
        padding: 8,
        zIndex: 999999,
        borderTop: "2px solid #333",
        transition: "max-height 0.2s ease"
      }}
    >
      {/* Header Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={btnStyle}
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>

        <button
          onClick={() => setLogs([])}
          style={btnStyle}
        >
          Clear Logs
        </button>

        <button
          onClick={() => setShowNet(!showNet)}
          style={btnStyle}
        >
          {showNet ? "Show All Logs" : "Network Only"}
        </button>
      </div>

      {/* Log Output */}
      {!collapsed &&
        filtered.map((log, i) => (
          <div key={i} style={{ color: colors[log.level] || "#0f0" }}>
            [{log.level}] {log.msg}
          </div>
        ))}
    </div>
  );
}

const btnStyle = {
  padding: "4px 8px",
  background: "#222",
  border: "1px solid #555",
  color: "#fff",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 11
};
