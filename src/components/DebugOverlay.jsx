// File: src/components/DebugOverlay.jsx
// PCC v3.0 — Always-on debug panel with colored [SOURCE] tag

import { useEffect, useState } from "react";

export default function DebugOverlay({ pageName, sourceUsed }) {
  // Keep a local copy so we can show "last known" source for the page
  const [lastSource, setLastSource] = useState(null);

  useEffect(() => {
    if (sourceUsed) setLastSource(sourceUsed);
  }, [sourceUsed]);

  const tagStyle = {
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    marginLeft: 6,
  };

  const sourceColor =
    lastSource === "INVIDIOUS"
      ? "#2196f3"
      : lastSource === "YOUTUBE_API"
      ? "#ff9800"
      : "#777";

  return (
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

      {lastSource && (
        <div style={{ marginTop: 4 }}>
          Source:
          <span style={{ ...tagStyle, background: sourceColor }}>
            [{lastSource}]
          </span>
        </div>
      )}
    </div>
  );
}
