// File: src/components/DebugOverlay.jsx
// PCC v4.0 — Global debug overlay for API key usage, endpoints, player state, and logs.
// Appears as a floating dev panel. Toggle with the button in the corner.

import React, { useEffect, useState } from "react";
import { usePlayer } from "../contexts/PlayerContext";

export default function DebugOverlay() {
  const { current, playerState } = usePlayer();

  const [logs, setLogs] = useState([]);
  const [visible, setVisible] = useState(true);
  const [apiKeyUsed, setApiKeyUsed] = useState(null);
  const [lastEndpoint, setLastEndpoint] = useState(null);
  const [apiCallCount, setApiCallCount] = useState(0);

  // Hook into global debugLog()
  useEffect(() => {
    window.debugLog = (msg) => {
      setLogs((prev) => [...prev.slice(-40), msg]); // keep last 40 logs

      // Detect key usage
      if (msg.startsWith("API KEY USED")) {
        const key = msg.split("→")[1]?.trim();
        setApiKeyUsed(key);
        setApiCallCount((c) => c + 1);
      }

      // Detect endpoint
      if (msg.startsWith("URL")) {
        const url = msg.split("→")[1]?.trim();
        setLastEndpoint(url);
      }
    };
  }, []);

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 99999,
          padding: "8px 12px",
          background: "#111",
          color: "#fff",
          borderRadius: 8,
          border: "1px solid #444",
          fontSize: 14,
          opacity: 0.7,
        }}
      >
        Debug
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        width: 320,
        height: 300,
        background: "rgba(0,0,0,0.85)",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: 12,
        padding: 12,
        borderRadius: 12,
        zIndex: 99999,
        overflowY: "auto",
        border: "1px solid #333",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <strong style={{ color: "#fff" }}>Debug Panel</strong>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: "none",
            border: "1px solid #444",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Hide
        </button>
      </div>

      {/* Key Info */}
      <div style={{ marginBottom: 8 }}>
        <div>API Key Used: <span style={{ color: "#fff" }}>{apiKeyUsed || "—"}</span></div>
        <div>API Calls: <span style={{ color: "#fff" }}>{apiCallCount}</span></div>
        <div style={{ marginTop: 4 }}>
          Last Endpoint:
          <div style={{ color: "#fff", fontSize: 11, wordBreak: "break-all" }}>
            {lastEndpoint || "—"}
          </div>
        </div>
      </div>

      {/* Player Info */}
      <div style={{ marginBottom: 8 }}>
        <div>Player State: <span style={{ color: "#fff" }}>{playerState}</span></div>
        <div>
          Current Video:
          <span style={{ color: "#fff" }}>
            {current?.id || "—"}
          </span>
        </div>
      </div>

      {/* Log Stream */}
      <div style={{ borderTop: "1px solid #333", paddingTop: 8 }}>
        {logs.map((l, i) => (
          <div key={i} style={{ marginBottom: 2 }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
