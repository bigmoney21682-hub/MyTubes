// File: src/components/DebugOverlay.jsx
// PCC v2.0 — Adds colored [SOURCE] tag for fallback visibility

import { useEffect, useState } from "react";

export default function DebugOverlay({ pageName, sourceUsed }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "`") setVisible((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const tagStyle = {
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    marginLeft: 6,
  };

  const sourceColor =
    sourceUsed === "PIPED"
      ? "#4caf50"
      : sourceUsed === "INVIDIOUS"
      ? "#2196f3"
      : sourceUsed === "YOUTUBE_API"
      ? "#ff9800"
      : "#777";

  return (
    visible && (
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          background: "rgba(0,0,0,0.85)",
          padding: 12,
          borderRadius: 8,
          color: "#fff",
          fontSize: 13,
          zIndex: 9999,
          maxWidth: 260,
          lineHeight: 1.4,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          Debug: {pageName}
        </div>

        {sourceUsed && (
          <div style={{ marginTop: 4 }}>
            Source:
            <span style={{ ...tagStyle, background: sourceColor }}>
              [{sourceUsed}]
            </span>
          </div>
        )}
      </div>
    )
  );
}
