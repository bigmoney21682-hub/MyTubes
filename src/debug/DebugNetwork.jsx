/**
 * File: DebugNetwork.jsx
 * Path: src/debug/DebugNetwork.jsx
 * Description: Network inspector for DebugOverlay v3. Displays fetch + XHR logs in waterfall style.
 */

export default function DebugNetwork({ logs, colors, formatTime }) {
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
      {logs.map((log, i) => (
        <div
          key={i}
          style={{
            padding: "4px 0",
            borderBottom: "1px solid #333",
            color: colors.NET,
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
