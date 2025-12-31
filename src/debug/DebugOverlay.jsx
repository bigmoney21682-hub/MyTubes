/**
 * File: DebugOverlay.jsx
 * Path: src/debug/DebugOverlay.jsx
 * Description: Unified DebugOverlay v3 with tabbed inspectors and
 *              Copy button that copies only the active tab's content.
 */

import React, { useState, useEffect } from "react";
import DebugTabs from "./DebugTabs.jsx";
import DebugConsole from "./DebugConsole.jsx";
import DebugNetwork from "./DebugNetwork.jsx";
import DebugPlayer from "./DebugPlayer.jsx";
import DebugRouter from "./DebugRouter.jsx";
import { debugBus } from "./debugBus.js";

export default function DebugOverlay() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState("Console");
  const [logs, setLogs] = useState([]);

  /* ------------------------------------------------------------
     Subscribe to debugBus
  ------------------------------------------------------------- */
  useEffect(() => {
    const unsub = debugBus.subscribe((entry) => {
      setLogs((prev) => [...prev, entry]);
    });
    return () => unsub();
  }, []);

  /* ------------------------------------------------------------
     Toggle overlay with backtick `
  ------------------------------------------------------------- */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "`") {
        setVisible((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ------------------------------------------------------------
     Allow external toggle via window.toggleDebug()
  ------------------------------------------------------------- */
  useEffect(() => {
    window.toggleDebug = () => setVisible((v) => !v);
  }, []);

  /* ------------------------------------------------------------
     Format timestamp
  ------------------------------------------------------------- */
  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString();
  }

  /* ------------------------------------------------------------
     Provide text for Copy button (active tab only)
  ------------------------------------------------------------- */
  function getCurrentTabText() {
    const filtered = logs.filter((l) => {
      if (active === "Console") return ["CONSOLE", "INFO", "WARN", "ERROR"].includes(l.level);
      if (active === "Router") return l.level === "ROUTER";
      if (active === "Network") return ["NETWORK", "FETCH", "ERROR_FETCH"].includes(l.level);
      if (active === "Player") return l.level === "PLAYER";
      return false;
    });

    return filtered
      .map((l) => `[${formatTime(l.ts)}] ${l.msg}`)
      .join("\n");
  }

  /* ------------------------------------------------------------
     Colors per log level
  ------------------------------------------------------------- */
  const colors = {
    CONSOLE: "#ccc",
    INFO: "#6cf",
    WARN: "#fc6",
    ERROR: "#f66",
    ROUTER: "#9f6",
    NETWORK: "#6cf",
    FETCH: "#6cf",
    ERROR_FETCH: "#f66",
    PLAYER: "#f6c"
  };

  /* ------------------------------------------------------------
     Render nothing if hidden
  ------------------------------------------------------------- */
  if (!visible) return null;

  /* ------------------------------------------------------------
     Render active tab content
  ------------------------------------------------------------- */
  let content = null;

  if (active === "Console") {
    content = <DebugConsole logs={logs} colors={colors} formatTime={formatTime} />;
  } else if (active === "Router") {
    content = <DebugRouter logs={logs} colors={colors} formatTime={formatTime} />;
  } else if (active === "Network") {
    content = <DebugNetwork logs={logs} colors={colors} formatTime={formatTime} />;
  } else if (active === "Player") {
    content = <DebugPlayer logs={logs} colors={colors} formatTime={formatTime} />;
  }

  /* ------------------------------------------------------------
     Overlay container
  ------------------------------------------------------------- */
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "45%",
        background: "rgba(0,0,0,0.92)",
        color: "#fff",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        borderTop: "1px solid #333",
        backdropFilter: "blur(6px)"
      }}
    >
      <DebugTabs
        active={active}
        setActive={setActive}
        getCurrentTabText={getCurrentTabText}
      />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px 12px"
        }}
      >
        {content}
      </div>
    </div>
  );
}
