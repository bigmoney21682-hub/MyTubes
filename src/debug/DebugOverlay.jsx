/**
 * File: DebugOverlay.jsx
 * Path: src/debug/DebugOverlay.jsx
 * Description: DebugOverlay v3 — non-blocking global debug UI.
 *              This version ensures the overlay NEVER blocks the app
 *              unless explicitly opened by the user.
 */

import React, { useState, useEffect, useRef } from "react";
import { debugBus } from "./debugBus.js";

export default function DebugOverlay() {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState("console");
  const [logs, setLogs] = useState([]);

  const scrollRef = useRef(null);

  // Subscribe to debugBus
  useEffect(() => {
    const unsub = debugBus.subscribe((entry) => {
      setLogs((prev) => [...prev, entry]);
    });
    return () => unsub();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (!visible) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs, visible]);

  // Copy button
  function handleCopy() {
    const filtered = logs
      .filter((l) => {
        if (tab === "console")
          return ["CONSOLE", "INFO", "WARN", "ERROR", "BOOT", "FETCH", "RESPONSE"].includes(
            l.level
          );
        if (tab === "network") return l.level === "NETWORK";
        if (tab === "player") return l.level === "PLAYER";
        if (tab === "router") return l.level === "ROUTER";
        return false;
      })
      .map((l) => `[${l.time}] ${l.level} → ${l.msg}`);

    navigator.clipboard.writeText(filtered.join("\n"));
  }

  // Tab button
  function TabButton({ id, label }) {
    return (
      <button
        onClick={() => setTab(id)}
        style={{
          padding: "6px 10px",
          marginRight: "6px",
          background: tab === id ? "#444" : "#222",
          color: "#fff",
          border: "1px solid #555",
          borderRadius: "4px",
          pointerEvents: "auto"
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,

        // ⭐ KEY FIX: Overlay container does NOT block the app
        pointerEvents: "none"
      }}
    >
      {/* Toggle button (always clickable) */}
      <button
        onClick={() => setVisible((v) => !v)}
        style={{
          position: "fixed",
          bottom: "80px",
          right: "20px",
          padding: "10px 14px",
          background: "#111",
          color: "#fff",
          border: "1px solid #444",
          borderRadius: "6px",
          zIndex: 10000,
          pointerEvents: "auto"
        }}
      >
        {visible ? "Close Debug" : "Debug"}
      </button>

      {/* Panel */}
      {visible && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "50%",
            background: "rgba(0,0,0,0.92)",
            borderTop: "2px solid #444",
            padding: "10px",
            display: "flex",
            flexDirection: "column",

            // ⭐ Panel is interactive
            pointerEvents: "auto"
          }}
        >
          {/* Tabs */}
          <div style={{ marginBottom: "8px" }}>
            <TabButton id="console" label="Console" />
            <TabButton id="network" label="Network" />
            <TabButton id="player" label="Player" />
            <TabButton id="router" label="Router" />
          </div>

          {/* Log area */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              background: "#000",
              padding: "8px",
              border: "1px solid #333",
              borderRadius: "4px",
              fontSize: "13px",
              lineHeight: 1.35
            }}
          >
            {logs
              .filter((l) => {
                if (tab === "console")
                  return ["CONSOLE", "INFO", "WARN", "ERROR", "BOOT", "FETCH", "RESPONSE"].includes(
                    l.level
                  );
                if (tab === "network") return l.level === "NETWORK";
                if (tab === "player") return l.level === "PLAYER";
                if (tab === "router") return l.level === "ROUTER";
                return false;
              })
              .map((l, i) => (
                <div key={i} style={{ marginBottom: "4px" }}>
                  <span style={{ opacity: 0.6 }}>[{l.time}]</span>{" "}
                  <span style={{ color: "#0af" }}>{l.level}</span> →{" "}
                  <span>{l.msg}</span>
                </div>
              ))}
          </div>

          {/* Buttons */}
          <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
            <button
              onClick={handleCopy}
              style={{
                padding: "6px 10px",
                background: "#222",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "4px"
              }}
            >
              Copy
            </button>

            <button
              onClick={() => setLogs([])}
              style={{
                padding: "6px 10px",
                background: "#222",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "4px"
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
