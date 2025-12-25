// File: src/components/DebugOverlay.jsx
// PCC v24.0 — Color‑coded, crash‑proof, touch‑safe, mouse‑safe debug console

import React, { useEffect, useRef, useState } from "react";

const STORAGE_KEY_MINIMIZED = "pcc_debug_minimized_v1";
const STORAGE_KEY_FILTER = "pcc_debug_filter_v1";

const FILTERS = ["ALL", "ERROR", "PLAYER", "API", "ROUTER", "UI"];

export default function DebugOverlay({ pageName = "Unknown", sourceUsed = null }) {
  const [logs, setLogs] = useState([]);
  const [minimized, setMinimized] = useState(
    loadBoolean(STORAGE_KEY_MINIMIZED, false)
  );
  const [filter, setFilter] = useState(loadString(STORAGE_KEY_FILTER, "ALL"));
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 8, y: 8 });

  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragPosRef = useRef({ x: 8, y: 8 });

  // ------------------------------------------------------------
  // Global debugLog with buffered writes
  // ------------------------------------------------------------
  useEffect(() => {
    if (!window.debugLog) {
      window.debugLog = (msg, category = "UI") => {
        const safeCategory = normalizeCategory(category);
        const entry = makeEntry(msg, safeCategory);
        window.__debugBuffer = window.__debugBuffer || [];
        window.__debugBuffer.push(entry);
      };
    }

    const interval = setInterval(() => {
      if (window.__debugBuffer && window.__debugBuffer.length > 0) {
        setLogs((prev) => [...prev, ...window.__debugBuffer]);
        window.__debugBuffer = [];
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // ------------------------------------------------------------
  // Load persistent fatal errors
  // ------------------------------------------------------------
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("fatal_errors") || "[]");
      if (stored.length > 0) {
        const mapped = stored.map((e) => ({
          time: new Date(e.time).toLocaleTimeString(),
          category: "ERROR",
          text: `[${e.type}] ${e.message} ${e.extra || ""}`,
        }));
        setLogs((prev) => [...mapped, ...prev]);
      }
    } catch {}
  }, []);

  // ------------------------------------------------------------
  // Persist minimized + filter
  // ------------------------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MINIMIZED, minimized ? "1" : "0");
    } catch {}
  }, [minimized]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FILTER, filter);
    } catch {}
  }, [filter]);

  // ------------------------------------------------------------
  // Clear logs
  // ------------------------------------------------------------
  const clearLogs = () => {
    setLogs([]);
    window.__debugBuffer = [];
  };

  // ------------------------------------------------------------
  // Drag handling — touch + mouse safe
  // ------------------------------------------------------------
  const handleDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const point = e.touches ? e.touches[0] : e;

    setDragging(true);
    dragStartRef.current = { x: point.clientX, y: point.clientY };
    dragPosRef.current = { ...dragPos };
  };

  const handleDragMove = (e) => {
    if (!dragging) return;

    const point = e.touches ? e.touches[0] : e;

    const dx = point.clientX - dragStartRef.current.x;
    const dy = point.clientY - dragStartRef.current.y;

    setDragPos({
      x: clamp(dragPosRef.current.x + dx, 0, window.innerWidth - 60),
      y: clamp(dragPosRef.current.y + dy, 0, window.innerHeight - 40),
    });
  };

  const handleDragEnd = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (!dragging) return;

    const move = (e) => handleDragMove(e);
    const up = () => handleDragEnd();

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", up);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [dragging]);

  // ------------------------------------------------------------
  // Filtered logs
  // ------------------------------------------------------------
  const filteredLogs =
    filter === "ALL"
      ? logs
      : logs.filter((l) => {
          if (!l.category) return false;
          if (filter === "ERROR") return l.category === "ERROR";
          return l.category === filter;
        });

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <>
      {/* Draggable Toggle */}
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          position: "fixed",
          left: dragPos.x,
          top: dragPos.y,
          width: 40,
          height: 40,
          background: "rgba(0,0,0,0.9)",
          border: "1px solid #0f0",
          borderRadius: 4,
          color: "#0f0",
          fontFamily: "monospace",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: dragging ? "grabbing" : "grab",
          zIndex: 1000000,
          userSelect: "none",
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!dragging) setMinimized((m) => !m);
        }}
      >
        {minimized ? "▣" : "–"}
      </div>

      {/* Main Console */}
      {!minimized && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100%",
            height: "45%",
            background: "rgba(0,0,0,0.9)",
            color: "#0f0",
            fontFamily: "monospace",
            fontSize: 12,
            zIndex: 999999,
            borderBottom: "2px solid #0f0",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "6px 8px",
              borderBottom: "1px solid #0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.95), rgba(0,40,0,0.95))",
            }}
          >
            <div>
              <strong>{pageName}</strong>
              {sourceUsed && <span> — {sourceUsed}</span>}
            </div>

            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: "2px 6px",
                      background:
                        filter === f ? "#0f0" : "rgba(0,0,0,0.7)",
                      color: filter === f ? "#000" : "#0f0",
                      border: "1px solid #0f0",
                      borderRadius: 4,
                      fontSize: 10,
                      cursor: "pointer",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                onClick={clearLogs}
                style={{
                  padding: "3px 8px",
                  background: "#111",
                  border: "1px solid #0f0",
                  color: "#0f0",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 11,
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Log Window */}
          <div
            style={{
              padding: 6,
              flex: 1,
              overflowY: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {filteredLogs.length === 0 && (
              <div style={{ opacity: 0.6 }}>No logs yet…</div>
            )}
            {filteredLogs.map((entry, i) => (
              <LogLine key={i} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function loadBoolean(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === "1") return true;
    if (raw === "0") return false;
  } catch {}
  return fallback;
}

function loadString(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (typeof raw === "string" && raw) return raw;
  } catch {}
  return fallback;
}

function normalizeCategory(category) {
  const c = String(category || "").toUpperCase();
  if (FILTERS.includes(c)) return c;
  if (c.includes("ERROR")) return "ERROR";
  if (c.includes("API")) return "API";
  if (c.includes("PLAYER")) return "PLAYER";
  if (c.includes("ROUTER")) return "ROUTER";
  return "UI";
}

function makeEntry(msg, category) {
  const time = new Date().toLocaleTimeString();
  return {
    time,
    category,
    text: String(msg),
  };
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// ------------------------------------------------------------
// Log line renderer
// ------------------------------------------------------------
function LogLine({ entry }) {
  const { textColor, bgColor, badgeColor } = getColors(entry.category);

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        alignItems: "flex-start",
        marginBottom: 2,
        color: textColor,
      }}
    >
      {/* Timestamp */}
      <span
        style={{
          opacity: 0.6,
          minWidth: 80,
        }}
      >
        [{entry.time}]
      </span>

      {/* Category badge */}
      <span
        style={{
          padding: "0px 6px",
          borderRadius: 999,
          fontSize: 10,
          backgroundColor: bgColor,
          color: badgeColor,
          border: "1px solid rgba(255,255,255,0.12)",
          textTransform: "uppercase",
        }}
      >
        {entry.category}
      </span>

      {/* Message */}
      <span style={{ whiteSpace: "pre-wrap", flex: 1 }}>{entry.text}</span>
    </div>
  );
}

function getColors(category) {
  switch (category) {
    case "ERROR":
      return {
        textColor: "#ff9999",
        bgColor: "rgba(255, 85, 85, 0.2)",
        badgeColor: "#ffdddd",
      };
    case "API":
      return {
        textColor: "#88cfff",
        bgColor: "rgba(85, 170, 255, 0.18)",
        badgeColor: "#e0f2ff",
      };
    case "PLAYER":
      return {
        textColor: "#ffdd88",
        bgColor: "rgba(255, 200, 100, 0.18)",
        badgeColor: "#fff6d8",
      };
    case "ROUTER":
      return {
        textColor: "#b4ffb4",
        bgColor: "rgba(120, 255, 120, 0.18)",
        badgeColor: "#e6ffe6",
      };
    case "UI":
    default:
      return {
        textColor: "#b6ffb6",
        bgColor: "rgba(0, 255, 0, 0.16)",
        badgeColor: "#e4ffe4",
      };
  }
}
