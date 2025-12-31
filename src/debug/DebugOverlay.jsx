/**
 * File: DebugOverlay.jsx
 * Path: src/debug/DebugOverlay.jsx
 * Description: Full debug overlay stacked above footer and below MiniPlayer.
 */

import React, { useState } from "react";
import { FOOTER_HEIGHT } from "../layout/Footer.jsx";
import DebugNetwork from "./DebugNetwork.jsx";
import DebugPlayer from "./DebugPlayer.jsx";
import DebugRouter from "./DebugRouter.jsx";
import DebugConsole from "./DebugConsole.jsx";

export default function DebugOverlay() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("network");

  // ------------------------------------------------------------
  // LOG STORAGE (simple internal buffer for now)
  // ------------------------------------------------------------
  const [logs] = useState([]);

  // ------------------------------------------------------------
  // COLOR MAP
  // ------------------------------------------------------------
  const colors = {
    FETCH: "#66ccff",
    ERROR_FETCH: "#ff6666",
    NETWORK: "#cccccc",
    PLAYER: "#ffcc66",
    ROUTER: "#66ff66",
    CONSOLE: "#ffffff"
  };

  // ------------------------------------------------------------
  // TIMESTAMP FORMATTER
  // ------------------------------------------------------------
  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString();
    } catch {
      return "";
    }
  };

  const tabs = [
    { id: "network", label: "Network" },
    { id: "player", label: "Player" },
    { id: "router", label: "Router" },
    { id: "console", label: "Console" }
  ];

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
          fontSize: 12
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
            flexDirection: "column"
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #333",
              background: "#111"
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  background: tab === t.id ? "#222" : "transparent",
                  color: "#fff",
                  border: "none",
                  fontSize: 12
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
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
          </div>
        </div>
      )}
    </>
  );
}
