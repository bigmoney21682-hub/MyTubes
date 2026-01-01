/**
 * File: DebugOverlay.jsx
 * Path: src/debug/DebugOverlay.jsx
 */

import React, { useState, useEffect } from "react";
import { FOOTER_HEIGHT } from "../layout/Footer.jsx";
import { debugBus } from "./debugBus.js";
import DebugNetwork from "./DebugNetwork.jsx";
import DebugPlayer from "./DebugPlayer.jsx";
import DebugRouter from "./DebugRouter.jsx";
import DebugConsole from "./DebugConsole.jsx";
import DebugTabs from "./DebugTabs.jsx";

// ⭐ NEW — import quota + key usage snapshots
import { getQuotaSnapshot } from "./quotaTracker.js";
import { getKeyUsageSnapshot } from "./keyUsageTracker.js";

export default function DebugOverlay() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("network");
  const [logs, setLogs] = useState([]);

  // ⭐ NEW — quota + key usage state
  const [quota, setQuota] = useState({});
  const [keyUsage, setKeyUsage] = useState({});

  // ------------------------------------------------------------
  // Subscribe to debugBus
  // ------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = debugBus.subscribe((entry, allLogs) => {
      if (Array.isArray(allLogs)) {
        setLogs(allLogs.filter(Boolean).slice());
      }
    });
    return unsubscribe;
  }, []);

  // ------------------------------------------------------------
  // ⭐ NEW — Poll quota + key usage every 500ms
  // ------------------------------------------------------------
  useEffect(() => {
    const id = setInterval(() => {
      setQuota(getQuotaSnapshot());
      setKeyUsage(getKeyUsageSnapshot());
    }, 500);
    return () => clearInterval(id);
  }, []);

  // ------------------------------------------------------------
  // COLOR MAP
  // ------------------------------------------------------------
  const colors = {
    FETCH: "#66ccff",
    ERROR_FETCH: "#ff6666",
    NETWORK: "#cccccc",
    PLAYER: "#ffcc66",
    ROUTER: "#66ff66",
    CONSOLE: "#ffffff",
    INFO: "#88c0ff",
    WARN: "#ffcc66",
    ERROR: "#ff6666",
    BOOT: "#aaaaaa",
    PERF: "#66ffcc",
    CMD: "#ff99ff"
  };

  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString();
    } catch {
      return "";
    }
  };

  function handleCopy() {
    const filtered = logs.filter((l) => {
      if (!l) return false;
      if (tab === "console") return ["CONSOLE", "INFO", "WARN", "ERROR"].includes(l.level);
      if (tab === "router") return l.level === "ROUTER";
      if (tab === "network") return ["NETWORK", "FETCH", "ERROR_FETCH"].includes(l.level);
      if (tab === "player") return l.level === "PLAYER";
      return false;
    });

    const text = filtered
      .map((l) => `[${formatTime(l.ts)}] ${l.msg}`)
      .join("\n");

    navigator.clipboard.writeText(text);
  }

  // ------------------------------------------------------------
  // ⭐ NEW — Quota inspector UI
  // ------------------------------------------------------------
  function renderQuota() {
    const keys = Object.keys(quota);
    const usageKeys = Object.keys(keyUsage);

    return (
      <div style={{ padding: 8, color: "#fff", fontSize: 12 }}>
        <h3 style={{ marginTop: 0 }}>Quota Usage</h3>

        {keys.length === 0 && <div>No quota data yet</div>}

        {keys.map((key) => (
          <div key={key} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: "bold" }}>{key}</div>
            <div>Used: {quota[key]} units</div>
          </div>
        ))}

        <h3 style={{ marginTop: 16 }}>Key Usage</h3>

        {usageKeys.length === 0 && <div>No key usage yet</div>}

        {usageKeys.map((key) => (
          <div key={key} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: "bold" }}>{key}</div>
            <div>Calls: {keyUsage[key]}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          right: 12,
          bottom: FOOTER_HEIGHT + 12,
          zIndex: 2001,
          background: "#222",
          color: "#fff",
          border: "1px solid #444",
          padding: "6px 10px",
          borderRadius: 4,
          fontSize: 12,
          pointerEvents: "auto"
        }}
      >
        {open ? "Close Debug" : "Debug"}
      </button>

      {/* Overlay */}
      {open && (
        <div
          style={{
            position: "fixed",
            left: 0,
            bottom: FOOTER_HEIGHT,
            width: "100%",
            height: "40%",
            background: "#000",
            borderTop: "1px solid #333",
            zIndex: 2000,
            display: "flex",
            flexDirection: "column",
            pointerEvents: "auto"
          }}
        >
          {/* ⭐ NEW — Add "quota" tab */}
          <DebugTabs activeTab={tab} onChange={setTab} onCopy={handleCopy} extraTabs={["quota"]} />

          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {tab === "network" && (
              <DebugNetwork logs={logs} colors={colors} formatTime={formatTime} />
            )}
            {tab === "player" && (
              <DebugPlayer logs={logs} colors={colors} formatTime={formatTime} />
            )}
            {tab === "router" && (
              <DebugRouter logs={logs} colors={colors} formatTime={formatTime} />
            )}
            {tab === "console" && (
              <DebugConsole logs={logs} colors={colors} formatTime={formatTime} />
            )}

            {/* ⭐ NEW — Quota tab */}
            {tab === "quota" && renderQuota()}
          </div>
        </div>
      )}
    </>
  );
}
