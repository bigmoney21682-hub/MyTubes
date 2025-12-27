/**
 * File: DebugOverlay.jsx
 * Path: src/debug/DebugOverlay.jsx
 * Description: Full DebugOverlay v3 with tabbed inspectors, vertical-only scroll,
 *              full-width content, and one-click Copy Logs button.
 */

import React, { useEffect, useState, useRef } from "react";
import { debugBus } from "./debugBus.js";

// ------------------------------------------------------------
// Tab Names
// ------------------------------------------------------------
const TABS = ["Console", "Network", "Player", "Router", "Perf", "Cmd"];

// ------------------------------------------------------------
// Main Component
// ------------------------------------------------------------
export default function DebugOverlay() {
  const [entries, setEntries] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Console");

  const consoleRef = useRef(null);

  // ------------------------------------------------------------
  // Subscribe to debugBus
  // ------------------------------------------------------------
  useEffect(() => {
    const handleEntry = (entry) => {
      setEntries((prev) => [...prev, entry]);
    };

    const unsub = debugBus.subscribe(handleEntry);
    return () => unsub();
  }, []);

  // ------------------------------------------------------------
  // Auto-scroll console
  // ------------------------------------------------------------
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [entries, activeTab]);

  // ------------------------------------------------------------
  // Filter entries by tab
  // ------------------------------------------------------------
  function filteredEntries() {
    switch (activeTab) {
      case "Console":
        return entries;
      case "Network":
        return entries.filter((e) => e.level === "NETWORK");
      case "Player":
        return entries.filter((e) => e.level === "PLAYER");
      case "Router":
        return entries.filter((e) => e.level === "ROUTER" || e.level === "BOOT");
      case "Perf":
        return entries.filter((e) => e.level === "PERF");
      case "Cmd":
        return entries.filter((e) => e.level === "CMD");
      default:
        return entries;
    }
  }

  // ------------------------------------------------------------
  // Clear logs
  // ------------------------------------------------------------
  function clearLogs() {
    setEntries([]);
    window.bootDebug.info("DebugOverlay → Logs cleared");
  }

  // ------------------------------------------------------------
  // Copy logs to clipboard
  // ------------------------------------------------------------
  function copyLogs() {
    const text = entries
      .map(
        (e) =>
          `[${e.level}] ${e.msg} (${new Date(e.ts).toLocaleTimeString()})`
      )
      .join("\n");

    navigator.clipboard.writeText(text);
    window.bootDebug.info("DebugOverlay → Logs copied to clipboard");
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div style={styles.overlay}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.title}>DebugOverlay v3</span>

        <div style={styles.headerButtons}>
          <button style={styles.btn} onClick={copyLogs}>
            Copy
          </button>
          <button style={styles.btn} onClick={clearLogs}>
            Clear
          </button>
          <button style={styles.btn} onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? "Expand" : "Collapse"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      {!collapsed && (
        <div style={styles.tabs}>
          {TABS.map((tab) => (
            <div
              key={tab}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.tabActive : {})
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {!collapsed && (
        <div style={styles.content} ref={consoleRef}>
          {filteredEntries().map((e, i) => (
            <div key={i} style={styles.entry}>
              <span style={styles.level}>{e.level}</span>
              <span style={styles.msg}>{e.msg}</span>
              <span style={styles.ts}>
                {new Date(e.ts).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Styles
// ------------------------------------------------------------
const styles = {
  overlay: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    background: "rgba(0,0,0,0.85)",
    color: "#fff",
    fontSize: "12px",
    fontFamily: "monospace",
    zIndex: 99999,
    display: "flex",
    flexDirection: "column",
    borderTop: "2px solid #444"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 10px",
    background: "#222",
    borderBottom: "1px solid #444"
  },

  title: {
    fontWeight: "bold"
  },

  headerButtons: {
    display: "flex",
    gap: "6px"
  },

  btn: {
    background: "#444",
    color: "#fff",
    border: "none",
    padding: "4px 8px",
    cursor: "pointer",
    borderRadius: "4px"
  },

  tabs: {
    display: "flex",
    borderBottom: "1px solid #444"
  },

  tab: {
    padding: "6px 10px",
    cursor: "pointer",
    color: "#aaa"
  },

  tabActive: {
    color: "#fff",
    borderBottom: "2px solid #fff"
  },

  content: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden", // 🔥 vertical-only scroll
    width: "100%",       // 🔥 full width
    boxSizing: "border-box",
    padding: "8px"
  },

  entry: {
    display: "flex",
    gap: "8px",
    marginBottom: "4px",
    width: "100%",
    wordBreak: "break-word" // 🔥 prevents horizontal overflow
  },

  level: {
    color: "#0af",
    minWidth: "60px"
  },

  msg: {
    flex: 1
  },

  ts: {
    color: "#888"
  }
};
