/**
 * File: DebugPlayer.jsx
 * Path: src/debug/DebugPlayer.jsx
 * Description: Player inspector for DebugOverlay v3.
 * Shows all player events: play, pause, buffer, seek, end, error, etc.
 */

export default function DebugPlayer({ logs, colors, formatTime }) {
  // Filter only player logs
  const playerLogs = logs.filter((l) => l.level === "PLAYER");

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
        gap: 8,
        overflowX: "hidden",
        overflowY: "auto",
        width: "100%",
        boxSizing: "border-box",
        whiteSpace: "normal",
        wordBreak: "break-word",
        minWidth: 0
      }}
    >
      {playerLogs.length === 0 && (
        <div style={{ color: "#888", fontSize: 12 }}>
          No player events yet.
        </div>
      )}

      {playerLogs.map((log, i) => {
        const { msg, data, ts } = log;

        return (
          <div
            key={i}
            style={{
              padding: "6px 0",
              borderBottom: "1px solid #333",
              color: colors.PLAYER || "#ccc",
              fontSize: 12,
              lineHeight: "16px"
            }}
          >
            {/* Timestamp */}
            <div style={{ opacity: 0.6 }}>{formatTime(ts)}</div>

            {/* Main message (SAFE) */}
            <div style={{ fontWeight: "bold" }}>{renderValue(msg)}</div>

            {/* Metadata */}
            {data && (
              <div
                style={{
                  marginTop: 4,
                  background: "#111",
                  padding: 6,
                  borderRadius: 4,
                  fontSize: 11,
                  overflowX: "auto"
                }}
              >
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: 4 }}>
                    <strong>{key}:</strong> {renderValue(value)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
