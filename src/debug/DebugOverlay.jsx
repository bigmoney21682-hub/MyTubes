/**
 * File: DebugOverlay.jsx
 * Path: src/debug/DebugOverlay.jsx
 * Description: Debug overlay shell with tabs, collapse, persistence, and log routing to inspectors.
 */

import { useEffect, useState, useMemo } from "react";
import { debugBus } from "./debugBus";
import { loadDebugState, saveDebugState } from "./debugStorage";
import { formatTime } from "./debugUtils";
import DebugTabs from "./DebugTabs";

// Phase 3 components (to be implemented next)
import DebugConsole from "./DebugConsole";
import DebugNetwork from "./DebugNetwork";
import DebugPlayer from "./DebugPlayer";
import DebugRouter from "./DebugRouter";
import DebugPerf from "./DebugPerf";
import DebugCommandBar from "./DebugCommandBar";

const DEFAULT_TAB = "console";

export default function DebugOverlay() {
  const [logs, setLogs] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);

  // Load persisted state on mount
  useEffect(() => {
    const state = loadDebugState();
    if (state.activeTab) setActiveTab(state.activeTab);
    if (typeof state.collapsed === "boolean") setCollapsed(state.collapsed);
  }, []);

  // Merge boot logs + subscribe to runtime logs
  useEffect(() => {
    const boot = window.bootDebug?._buffer || [];
    setLogs(boot);

    const unsub = subscribeToDebugBus((entry) => {
      setLogs((prev) => [...prev, entry]);
    });

    return unsub;
  }, []);

  // Persist state when it changes
  useEffect(() => {
    saveDebugState({ activeTab, collapsed });
  }, [activeTab, collapsed]);

  const colors = {
    INFO: "#0f0",
    WARN: "#ff0",
    ERROR: "#f33",
    BOOT: "#0af",
    API: "#0ff",
    UI: "#f0f",
    NET: "#ffa500",
    PLAYER: "#00eaff",
    ROUTER: "#ff66ff",
    PERF: "#88ff88"
  };

  const consoleLogs = useMemo(
    () => logs.filter((l) => l.level !== "NET"),
    [logs]
  );

  const netLogs = useMemo(
    () => logs.filter((l) => l.level === "NET"),
    [logs]
  );

  const playerLogs = useMemo(
    () => logs.filter((l) => l.level === "PLAYER"),
    [logs]
  );

  const routerLogs = useMemo(
    () => logs.filter((l) => l.level === "ROUTER"),
    [logs]
  );

  const perfLogs = useMemo(
    () => logs.filter((l) => l.level === "PERF"),
    [logs]
  );

  function clearLogs() {
    setLogs([]);
  }

  function renderActiveTab() {
    const commonProps = { logs, colors, formatTime };

    switch (activeTab) {
      case "console":
        return (
          <DebugConsole
            {...commonProps}
            logs={consoleLogs}
          />
        );
      case "network":
        return (
          <DebugNetwork
            {...commonProps}
            logs={netLogs}
          />
        );
      case "player":
        return (
          <DebugPlayer
            {...commonProps}
            logs={playerLogs}
          />
        );
      case "router":
        return (
          <DebugRouter
            {...commonProps}
            logs={routerLogs}
          />
        );
      case "perf":
        return (
          <DebugPerf
            {...commonProps}
            logs={perfLogs}
          />
        );
      case "cmd":
        return (
          <DebugCommandBar
            onCommand={(entry) => {
              setLogs((prev) => [...prev, entry]);
            }}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100vw",
        maxHeight: collapsed ? "32px" : "45vh",
        overflowY: collapsed ? "hidden" : "auto",
        overflowX: "hidden",
        background: "rgba(0,0,0,0.85)",
        fontFamily: "monospace",
        fontSize: 12,
        padding: "8px env(safe-area-inset-right) 8px env(safe-area-inset-left)",
        zIndex: 999999,
        borderTop: "2px solid #333",
        boxSizing: "border-box",
        whiteSpace: "normal",
        wordBreak: "break-word",
        minWidth: 0,
        transition: "max-height 0.2s ease"
      }}
    >
      {/* Header: collapse + clear + tabs */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginBottom: collapsed ? 0 : 6
        }}
      >
        {/* Top row: buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
            justifyContent: "space-between",
            minWidth: 0
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={btn}
            >
              {collapsed ? "Expand" : "Minimize"}
            </button>

            <button
              onClick={clearLogs}
              style={btn}
            >
              Clear
            </button>
          </div>

          <div style={{ color: "#888", fontSize: 10 }}>
            Logs: {logs.length}
          </div>
        </div>

        {/* Tabs row (fixed within overlay) */}
        {!collapsed && (
          <DebugTabs
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        )}
      </div>

      {/* Content */}
      {!collapsed && renderActiveTab()}
    </div>
  );
}

const btn = {
  padding: "4px 8px",
  background: "#222",
  border: "1px solid #555",
  color: "#fff",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 11,
  flexShrink: 0
};
