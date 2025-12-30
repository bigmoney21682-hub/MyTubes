/**
 * File: DebugHeader.jsx
 * Path: src/debug/DebugHeader.jsx
 */

import React from "react";

const COLORS = {
  BOOT: "#0f0",
  PLAYER: "#4af",
  ROUTER: "#fa4",
  NETWORK: "#af4",
  PERF: "#f4a",
  CMD: "#ff4"
};

const CHANNELS = ["BOOT", "PLAYER", "ROUTER", "NETWORK", "PERF", "CMD"];

export default function DebugHeader({
  activeChannel,
  setActiveChannel,
  logs,
  visible,
  setVisible
}) {
  function handleCopy() {
    const channelLogs = logs[activeChannel];
    const text = channelLogs
      .map((l) => `[${new Date(l.ts).toLocaleTimeString()}] ${l.msg}`)
      .join("\n");

    navigator.clipboard.writeText(text);
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        padding: "4px 6px",
        borderBottom: "1px solid #333",
        background: "#111",
        flexShrink: 0,
        gap: 4
      }}
    >
      {/* Left side: DEBUG + tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        <span style={{ marginRight: 4, fontWeight: "bold" }}>DEBUG</span>

        {CHANNELS.map((ch) => (
          <button
            key={ch}
            onClick={() => setActiveChannel(ch)}
            style={{
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

      {/* Spacer pushes Copy/X to the right */}
      <div style={{ flex: 1 }} />

      {/* Right side: Copy + Close */}
      <div style={{ display: "flex", gap: 6 }}>
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
    </div>
  );
}
