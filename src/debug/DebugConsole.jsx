/**
 * File: DebugConsole.jsx
 * Path: src/debug/DebugConsole.jsx
 * Description: Console tab for DebugOverlay v3 with quota summary at top.
 */

export default function DebugConsole({ logs, colors, formatTime }) {
  // Find the latest quota log
  const quotaLog = logs.find((l) => l.msg.startsWith("[QUOTA]"));

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
      {/* Quota summary at the top */}
      {quotaLog && (
        <div
          style={{
            padding: "6px 0",
            borderBottom: "1px solid #333",
            color: "#66cc66",
            fontSize: 12,
            fontWeight: "bold"
          }}
        >
          {quotaLog.msg}
        </div>
      )}

      {/* No logs */}
      {logs.length === 0 && (
        <div style={{ color: "#888", fontSize: 12 }}>No console logs yet.</div>
      )}

      {/* Render all logs except quota */}
      {logs
        .filter((l) => !l.msg.startsWith("[QUOTA]"))
        .map((log, i) => (
          <div
            key={i}
            style={{
              padding: "4px 0",
              borderBottom: "1px solid #333",
              color: colors[log.level] || "#ccc",
              fontSize: 12,
              lineHeight: "16px"
            }}
          >
            <div style={{ opacity: 0.6 }}>{formatTime(log.ts)}</div>
            <div>{log.msg}</div>

            {/* Optional metadata */}
            {log.data && (
              <pre
                style={{
                  marginTop: 4,
                  background: "#111",
                  padding: 6,
                  borderRadius: 4,
                  fontSize: 11,
                  overflowX: "auto"
                }}
              >
                {JSON.stringify(log.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
    </div>
  );
}
