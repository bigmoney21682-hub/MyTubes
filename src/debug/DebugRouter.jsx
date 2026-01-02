/**
 * File: DebugRouter.jsx
 * Path: src/debug/DebugRouter.jsx
 * Description: Router inspector for DebugOverlay v3.
 * Shows route changes, params, and navigation direction.
 * Fully compatible with HashRouter (GitHub Pages).
 */

export default function DebugRouter({ logs, colors, formatTime }) {
  // Safely render any value (string, number, object)
  function renderValue(v) {
    if (v == null) return "";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        overflowX: "hidden",
        overflowY: "auto",
        width: "100%",
        boxSizing: "border-box",
        whiteSpace: "normal",
        wordBreak: "break-word",
        minWidth: 0
      }}
    >
      {/* No router events */}
      {logs.length === 0 && (
        <div style={{ color: "#888", fontSize: 12 }}>
          No router events yet.
        </div>
      )}

      {/* Router event list */}
      {logs.map((log, i) => (
        <div
          key={i}
          style={{
            padding: "4px 0",
            borderBottom: "1px solid #333",
            color: colors.ROUTER,
            fontSize: 12,
            lineHeight: "16px"
          }}
        >
          {/* Timestamp */}
          <div style={{ opacity: 0.6 }}>
            {formatTime(log.ts)}
          </div>

          {/* Main message (SAFE) */}
          <div>{renderValue(log.msg)}</div>

          {/* Optional metadata (SAFE) */}
          {log.meta && (
            <div style={{ opacity: 0.7, fontSize: 11, marginTop: 2 }}>
              {renderValue(log.meta)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
