/**
 * File: DebugRouter.jsx
 * Path: src/debug/DebugRouter.jsx
 * Description: Router inspector for DebugOverlay v3.
 * Shows route changes and detects basename mismatches.
 */

export default function DebugRouter({ logs, colors, formatTime }) {
  // Detect basename mismatch (GitHub Pages issue)
  const basename = "/MyTube-Piped-Frontend";
  const currentPath = window.location.pathname;

  const mismatch =
    !currentPath.startsWith(basename) &&
    currentPath !== "/" &&
    currentPath !== "";

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
      {/* Basename mismatch warning */}
      {mismatch && (
        <div
          style={{
            background: "#330000",
            border: "1px solid #660000",
            padding: 8,
            borderRadius: 4,
            color: "#ff6666",
            fontSize: 12
          }}
        >
          <strong>Router Basename Mismatch Detected</strong>
          <br />
          URL path: <code>{currentPath}</code>
          <br />
          Expected to start with: <code>{basename}</code>
          <br />
          This can cause blank screens on GitHub Pages.
        </div>
      )}

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
          <div style={{ opacity: 0.6 }}>
            {formatTime(log.ts)}
          </div>
          <div>{log.msg}</div>
        </div>
      ))}
    </div>
  );
}
