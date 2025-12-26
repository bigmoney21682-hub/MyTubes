// File: src/components/DebugOverlay.jsx
// PCC v14.0 — Full-width, color-coded, quota-aware debug panel

import React, { useEffect, useState } from "react";
import { usePlayer } from "../contexts/PlayerContext";

export default function DebugOverlay() {
  const { currentVideo, playerMetrics } = usePlayer();

  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState([]);
  const [apiKeyUsed, setApiKeyUsed] = useState("—");
  const [lastEndpoint, setLastEndpoint] = useState("—");
  const [apiCalls, setApiCalls] = useState(0);

  // Quota tracking
  const [quotaPrimary, setQuotaPrimary] = useState(0);
  const [quotaFallback, setQuotaFallback] = useState(0);

  // ------------------------------------------------------------
  // YouTube API quota cost rules
  // ------------------------------------------------------------
  function getQuotaCost(endpoint) {
    if (endpoint.includes("/search")) return 100; // search.list
    if (endpoint.includes("/videos")) return 1;   // videos.list
    return 1;
  }

  // ------------------------------------------------------------
  // Color map for categories
  // ------------------------------------------------------------
  const colorFor = (category) => {
    switch (category) {
      case "API":
        return "#4dd0e1"; // cyan
      case "ERROR":
        return "#ff5252"; // red
      case "HOME":
      case "WATCH":
      case "SEARCH":
      case "PLAYER":
        return "#ffeb3b"; // yellow
      default:
        return "#bdbdbd"; // gray
    }
  };

  // ------------------------------------------------------------
  // Global debug hooks
  // ------------------------------------------------------------
  useEffect(() => {
    window.debugLog = (msg, category = "LOG") => {
      setLogs((prev) => [
        { msg, category, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 49),
      ]);
    };

    window.debugApi = (endpoint, key) => {
      const cost = getQuotaCost(endpoint);

      if (key === import.meta.env.VITE_YT_API_PRIMARY) {
        setQuotaPrimary((q) => q + cost);
      } else {
        setQuotaFallback((q) => q + cost);
      }

      setLastEndpoint(endpoint);
      setApiKeyUsed(key ?? "null/undefined");
      setApiCalls((c) => c + 1);

      window.debugLog(`API → ${endpoint}`, "API");
    };
  }, []);

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setVisible((v) => !v)}
        style={{
          position: "fixed",
          right: 16,
          bottom: "calc(env(safe-area-inset-bottom) + 16px)",
          padding: "8px 14px",
          background: "#222",
          color: "#fff",
          border: "1px solid #444",
          borderRadius: 6,
          pointerEvents: "auto",
          fontSize: 12,
          zIndex: 999999,
        }}
      >
        {visible ? "Hide Debug" : "Debug"}
      </button>

      {/* Panel */}
      {visible && (
        <div
          style={{
            position: "fixed",
            bottom: 60,
            left: 0,
            right: 0,
            width: "100%",
            maxWidth: "100%",
            background: "rgba(0,0,0,0.9)",
            color: "#0f0",
            padding: 12,
            borderTop: "1px solid #333",
            maxHeight: "45vh",
            overflowY: "auto",
            overflowX: "hidden",
            fontFamily: "monospace",
            fontSize: 12,
            pointerEvents: "auto",
            boxSizing: "border-box",
            wordBreak: "break-word",
            zIndex: 999998,
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 8, fontWeight: "bold" }}>
            Debug Panel
          </div>

          {/* API summary */}
          <div>API Key Used: {apiKeyUsed}</div>
          <div>API Calls: {apiCalls}</div>
          <div>Last Endpoint: {lastEndpoint}</div>

          {/* Quota */}
          <div style={{ marginTop: 8, fontWeight: "bold" }}>Quota</div>
          <div>
            Primary: {quotaPrimary} used / 10000 (
            {10000 - quotaPrimary} remaining)
          </div>
          <div>
            Fallback: {quotaFallback} used / 10000 (
            {10000 - quotaFallback} remaining)
          </div>

          {/* Player state */}
          <div style={{ marginTop: 8, fontWeight: "bold" }}>
            Player State
          </div>
          <div>Video: {currentVideo?.id || "—"}</div>
          <div>State: {playerMetrics.state}</div>
          <div>
            Time: {playerMetrics.currentTime} / {playerMetrics.duration}
          </div>

          {/* Logs */}
          <div style={{ marginTop: 8, fontWeight: "bold" }}>Logs</div>

          {logs.map((l, i) => (
            <div
              key={i}
              style={{
                color: colorFor(l.category),
                marginBottom: 2,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              [{l.time}] [{l.category}] {l.msg}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
