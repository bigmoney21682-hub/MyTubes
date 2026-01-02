/**
 * File: DebugNetwork.jsx
 * Path: src/debug/DebugNetwork.jsx
 * Description: Network inspector for DebugOverlay v3 with quota + key usage.
 */

import { getQuotaSnapshot } from "./quotaTracker.js";
import { getKeyUsageSnapshot } from "./keyUsageTracker.js";

export default function DebugNetwork({ logs, colors, formatTime }) {
  const networkLogs = logs.filter(
    (l) =>
      l.level === "NETWORK" ||
      l.level === "FETCH" ||
      l.level === "ERROR_FETCH"
  );

  const quota = getQuotaSnapshot();
  const keyUsage = getKeyUsageSnapshot();

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
        gap: 12,
        overflowY: "auto",
        width: "100%",
        paddingBottom: 20
      }}
    >
      {/* Quota Panel */}
      <div
        style={{
          background: "#111",
          padding: "8px 10px",
          borderRadius: 6,
          fontSize: 12,
          lineHeight: "16px"
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 6 }}>Quota Usage</div>

        {Object.keys(quota).length === 0 && (
          <div style={{ opacity: 0.6 }}>No quota usage yet.</div>
        )}

        {Object.entries(quota).map(([key, used]) => (
          <div key={key}>
            <strong>{key}:</strong> {renderValue(used)} units
          </div>
        ))}
      </div>

      {/* Key Usage Panel */}
      <div
        style={{
          background: "#111",
          padding: "8px 10px",
          borderRadius: 6,
          fontSize: 12,
          lineHeight: "16px"
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 6 }}>API Key Usage</div>

        {Object.keys(keyUsage).length === 0 && (
          <div style={{ opacity: 0.6 }}>No API calls yet.</div>
        )}

        {Object.entries(keyUsage).map(([key, count]) => (
          <div key={key}>
            <strong>{key}:</strong> {renderValue(count)} calls
          </div>
        ))}
      </div>

      {/* Network Logs */}
      {networkLogs.length === 0 && (
        <div style={{ color: "#888", fontSize: 12 }}>
          No network activity yet.
        </div>
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
            <div style={{ opacity: 0.6 }}>{formatTime(ts)}</div>

            {/* ⭐ FIX: Safely render msg */}
            <div style={{ fontWeight: "bold" }}>{renderValue(msg)}</div>

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
                {/* Safely render each field */}
                {data.url && (
                  <div style={{ marginBottom: 4 }}>
                    <strong>URL:</strong> {renderValue(data.url)}
                  </div>
                )}

                {data.status && (
                  <div style={{ marginBottom: 4 }}>
                    <strong>Status:</strong> {renderValue(data.status)}
                  </div>
                )}

                {data.method && (
                  <div style={{ marginBottom: 4 }}>
                    <strong>Method:</strong> {renderValue(data.method)}
                  </div>
                )}

                {data.duration && (
                  <div style={{ marginBottom: 4 }}>
                    <strong>Duration:</strong> {renderValue(data.duration)}ms
                  </div>
                )}

                {data.error && (
                  <div style={{ marginTop: 6, color: "#ff6666" }}>
                    <strong>Error:</strong> {renderValue(data.error)}
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
