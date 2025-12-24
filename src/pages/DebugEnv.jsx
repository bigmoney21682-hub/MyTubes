// File: src/pages/DebugEnv.jsx
// PCC v2.0 — Enhanced environment inspector for Vite + GitHub Pages.
// Adds: build timestamp, mode, key status, define() verification, and full env dump.

import React from "react";

export default function DebugEnv() {
  const env = import.meta.env;

  const primary = env.VITE_YT_API_PRIMARY;
  const fallback = env.VITE_YT_API_FALLBACK1;

  const statusColor = (val) =>
    val && val !== "undefined" ? "#0f0" : "#f00";

  const buildTime = env.VITE_BUILD_TIME || "unknown";

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "monospace",
        background: "#111",
        color: "#0f0",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ color: "#fff", marginBottom: "20px" }}>
        DebugEnv — Vite Environment Inspector
      </h2>

      {/* Build Info */}
      <div style={{ marginBottom: "20px" }}>
        <strong style={{ color: "#fff" }}>Build Timestamp:</strong>
        <div>{buildTime}</div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <strong style={{ color: "#fff" }}>Vite Mode:</strong>
        <div>{env.MODE}</div>
      </div>

      {/* Primary Key */}
      <div style={{ marginBottom: "20px" }}>
        <strong style={{ color: "#fff" }}>VITE_YT_API_PRIMARY:</strong>
        <div style={{ wordBreak: "break-all", color: statusColor(primary) }}>
          {primary || "undefined"}
        </div>
      </div>

      {/* Fallback Key */}
      <div style={{ marginBottom: "20px" }}>
        <strong style={{ color: "#fff" }}>VITE_YT_API_FALLBACK1:</strong>
        <div style={{ wordBreak: "break-all", color: statusColor(fallback) }}>
          {fallback || "undefined"}
        </div>
      </div>

      {/* Key Status */}
      <div style={{ marginBottom: "20px" }}>
        <strong style={{ color: "#fff" }}>Key Status:</strong>
        <div>
          PRIMARY:{" "}
          <span style={{ color: statusColor(primary) }}>
            {primary && primary !== "undefined" ? "OK" : "MISSING"}
          </span>
        </div>
        <div>
          FALLBACK1:{" "}
          <span style={{ color: statusColor(fallback) }}>
            {fallback && fallback !== "undefined" ? "OK" : "MISSING"}
          </span>
        </div>
      </div>

      {/* Full env dump */}
      <div style={{ marginBottom: "20px" }}>
        <strong style={{ color: "#fff" }}>Full import.meta.env:</strong>
        <pre
          style={{
            background: "#000",
            padding: "12px",
            border: "1px solid #333",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
{JSON.stringify(env, null, 2)}
        </pre>
      </div>
    </div>
  );
}
