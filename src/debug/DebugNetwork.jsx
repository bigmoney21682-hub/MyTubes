/**
 * File: DebugNetwork.jsx
 * Path: src/debug/DebugNetwork.jsx
 * Description: Network inspector for DebugOverlay v3 with quota cost + key usage.
 */

export default function DebugNetwork({ logs, colors, formatTime }) {
  // Filter only network logs
  const networkLogs = logs.filter((l) => l.level === "FETCH" || l.level === "ERROR_FETCH");

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
      {networkLogs.length === 0 && (
        <div style={{ color: "#888", fontSize: 12 }}>No network activity yet.</div>
      )}

      {networkLogs.map((log, i) => {
        const { msg, data, ts } = log;

        return (
          <div
            key={i}
            style={{
              padding: "6px 0",
              borderBottom: "1px solid #333",
              color: colors[log.level] || "#ccc",
              fontSize: 12,
              lineHeight: "16px"
            }}
          >
            {/* Timestamp */}
            <div style={{ opacity: 0.6 }}>{formatTime(ts)}</div>

            {/* Main message */}
            <div style={{ fontWeight: "bold" }}>{msg}</div>

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
                {/* URL */}
                {data.url && (
                  <div style={{ marginBottom: 4 }}>
                    <strong>URL:</strong> {data.url}
                  </div>
                )}

                {/* Status */}
                {data.status && (
                  <div style={{ marginBottom: 4 }}>
                    <strong>Status:</strong> {data.status}
                  </div>
                )}

                {/* Key used */}
                {data.key && (
                  <div style={{ marginBottom: 4 }}>
                    <strong>Key:</strong> {data.key}
                  </div>
                )}

                {/* Quota cost */}
                {data.cost !== undefined && (
                  <div style={{ marginBottom: 4 }}>
                    <strong>Quota Cost:</strong> {data.cost} units
                  </div>
                )}

                {/* Error */}
                {data.error && (
                  <div style={{ marginTop: 6, color: "#ff6666" }}>
                    <strong>Error:</strong> {data.error}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
