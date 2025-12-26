/**
 * File: DebugPlayer.jsx
 * Path: src/debug/DebugPlayer.jsx
 * Description: Player timeline inspector for DebugOverlay v3.
 * Shows player state transitions and events in chronological order.
 */

export default function DebugPlayer({ logs, colors, formatTime }) {
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
      {logs.length === 0 && (
        <div style={{ color: "#888", fontSize: 12 }}>
          No player events yet.
        </div>
      )}

      {logs.map((log, i) => (
        <div
          key={i}
          style={{
            padding: "4px 0",
            borderBottom: "1px solid #333",
            color: colors.PLAYER,
            fontSize: 12,
            lineHeight: "16px"
          }}
        >
          <div style={{ opacity: 0.6 }}>
            {formatTime(log.ts)}
          </div>
          <div>{log.msg}</div>
        </div>
      ))}
    </div>
  );
}
