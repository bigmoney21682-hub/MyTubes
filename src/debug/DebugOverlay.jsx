/**
 * File: DebugOverlay.jsx
 * Path: src/debug/DebugOverlay.jsx
 * Description: Full inspector-based debug overlay (v3).
 * Renders DebugPlayer, DebugRouter, DebugNetwork, DebugPerf,
 * and uses DebugCommandBar for the CMD tab.
 */

import React, { useEffect, useState } from "react";
import { debugBus } from "./debugBus.js";

import DebugPlayer from "./DebugPlayer.jsx";
import DebugRouter from "./DebugRouter.jsx";
import DebugNetwork from "./DebugNetwork.jsx";
import DebugPerf from "./DebugPerf.jsx";
import DebugCommandBar from "./DebugCommandBar.jsx";

const CHANNELS = ["BOOT", "PLAYER", "ROUTER", "NETWORK", "PERF", "CMD"];

const COLORS = {
  BOOT: "#0f0",
  PLAYER: "#4af",
  ROUTER: "#fa4",
  NETWORK: "#af4",
  PERF: "#f4a",
  CMD: "#ff4"
};

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString();
}

export default function DebugOverlay() {
  const [visible, setVisible] = useState(true);
  const [activeChannel, setActiveChannel] = useState("PLAYER");

  const [logs, setLogs] = useState({
    BOOT: [],
    PLAYER: [],
    ROUTER: [],
    NETWORK: [],
    PERF: [],
    CMD: []
  });

  // Subscribe to debugBus
  useEffect(() => {
    const unsub = debugBus.subscribe((level, entry) => {
      setLogs((prev) => {
        if (!prev[level]) return prev;
        const next = { ...prev };
        const list = next[level].slice(-199);
        list.push(entry);
        next[level] = list;
        return next;
      });
    });

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  // Copy logs
  function handleCopy() {
    const text = logs[activeChannel]
      .map((l) => `[${formatTime(l.ts)}] ${l.msg}`)
      .join("\n");

    navigator.clipboard.writeText(text);
    debugBus.info("DebugOverlay → Logs copied to clipboard");
  }

  // Render inspector for active tab
  function renderInspector() {
    const channelLogs = logs[activeChannel];

    switch (activeChannel) {
      case "PLAYER":
        return (
          <DebugPlayer
            logs={channelLogs}
            colors={COLORS}
            formatTime={formatTime}
          />
        );

      case "ROUTER":
        return (
          <DebugRouter
            logs={channelLogs}
            colors={COLORS}
            formatTime={formatTime}
          />
        );

      case "NETWORK":
        return (
          <DebugNetwork
            logs={channelLogs}
            colors={COLORS}
            formatTime={formatTime}
          />
        );

      case "PERF":
        return (
          <DebugPerf
            logs={channelLogs}
            colors={COLORS}
            formatTime={formatTime}
          />
        );

      case "CMD":
        return (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
              {channelLogs.length === 0 && (
                <div style={{ color: "#888", fontSize: 12 }}>
                  No command events yet.
                </div>
              )}

              {channelLogs.map((l, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ opacity: 0.6 }}>{formatTime(l.ts)}</div>
                  <div>{l.msg}</div>
                </div>
              ))}
            </div>

            {/* Command input bar */}
            <div style={{ borderTop: "1px solid #333", paddingTop: 6 }}>
              <DebugCommandBar
                onCommand={(entry) => {
                  debugBus.cmd(entry.msg, entry);
                }}
              />
            </div>
          </div>
        );

      case "BOOT":
      default:
        return (
          <div style={{ padding: 8, fontSize: 12 }}>
            {channelLogs.length === 0 && (
              <div style={{ color: "#888" }}>No boot events yet.</div>
            )}
            {channelLogs.map((l, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ opacity: 0.6 }}>{formatTime(l.ts)}</div>
                <div>{l.msg}</div>
              </div>
            ))}
          </div>
        );
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        pointerEvents: "none"
      }}
    >
      {/* Panel */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          width: "90%",
          maxWidth: 420,
          height: "30%",
          background: "rgba(0,0,0,0.9)",
          color: "#0f0",
          fontFamily: "monospace",
          fontSize: 11,
          border: "1px solid #333",
          borderRadius: 6,
          overflow: "hidden",
          display: visible ? "flex" : "none",
          flexDirection: "column",
          pointerEvents: "auto"
        }}
      >

        {/* HEADER ROW 1 — DEBUG + TABS */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            padding: "4px 6px",
            borderBottom: "1px solid #333",
            background: "#111",
            flexShrink: 0
          }}
        >
          <span style={{ marginRight: 8, fontWeight: "bold" }}>DEBUG</span>

          {CHANNELS.map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              style={{
                marginRight: 4,
                marginBottom: 4,
                padding: "2px 6px",
                fontSize: 10,
                borderRadius: 4,
                border: "1px solid #444",
                background: activeChannel === ch ? COLORS[ch] : "transparent",
                color: activeChannel === ch ? "#000" : COLORS[ch],
                cursor: "pointer"
              }}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* HEADER ROW 2 — ACTION BUTTONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 6,
            padding: "4px 6px",
            borderBottom: "1px solid #333",
            background: "#111",
            flexShrink: 0
          }}
        >
          <button
            onClick={handleCopy}
            style={{
              padding: "2px 6px",
              fontSize: 10,
              borderRadius: 4,
              border: "1px solid #444",
              background: "transparent",
              color: "#0f0",
              cursor: "pointer"
            }}
          >
            Copy
          </button>

          <button
            onClick={() => setVisible(false)}
            style={{
              padding: "2px 6px",
              fontSize: 10,
              borderRadius: 4,
              border: "1px solid #444",
              background: "transparent",
              color: "#f44",
              cursor: "pointer"
            }}
          >
            ✕
          </button>
        </div>

        {/* Inspector content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 6
          }}
        >
          {renderInspector()}
        </div>
      </div>

      {/* Reopen button */}
      {!visible && (
        <button
          onClick={() => setVisible(true)}
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            padding: "4px 8px",
            fontSize: 10,
            borderRadius: 4,
            border: "1px solid #444",
            background: "rgba(0,0,0,0.8)",
            color: "#0f0",
            cursor: "pointer",
            pointerEvents: "auto"
          }}
        >
          DEBUG
        </button>
      )}
    </div>
  );
}
