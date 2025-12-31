/**
 * File: DebugOverlay.jsx
 * Path: src/debug/DebugOverlay.jsx
 * Description: Minimal corrected version — ONLY fixes:
 *              1) pointerEvents so overlay doesn't block UI on boot
 *              2) null guard so logs never crash on boot
 */

import React, { useState, useEffect, useRef } from "react";
import { debugBus } from "./debugBus.js";

export default function DebugOverlay() {
  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState([]);
  const scrollRef = useRef(null);

  // Subscribe to debugBus
  useEffect(() => {
    const unsub = debugBus.subscribe((entry) => {
      setLogs((prev) => [...prev, entry]);
    });
    return () => unsub();
  }, []);

  // Auto-scroll when visible
  useEffect(() => {
    if (!visible) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs, visible]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,

        // ⭐ FIX 1 — overlay no longer blocks UI
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

          // Button must be interactive
          pointerEvents: "auto"
        }}
      >
        {visible ? "Close Debug" : "Debug"}
      </button>

      {/* Debug panel */}
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

            // Panel must be interactive
            pointerEvents: "auto"
          }}
        >
          {/* Log list */}
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
              .filter(Boolean)   // ⭐ FIX 2 — remove null entries
              .map((l, i) => (
                <div key={i} style={{ marginBottom: "4px" }}>
                  <span style={{ opacity: 0.6 }}>[{l.time}]</span>{" "}
                  <span style={{ color: "#0af" }}>{l.level}</span> →{" "}
                  <span>{l.msg}</span>
                </div>
              ))}
          </div>

          {/* Clear button */}
          <button
            onClick={() => setLogs([])}
            style={{
              marginTop: "8px",
              padding: "6px 10px",
              background: "#222",
              color: "#fff",
              border: "1px solid #444",
              borderRadius: "4px",
              alignSelf: "flex-start"
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
