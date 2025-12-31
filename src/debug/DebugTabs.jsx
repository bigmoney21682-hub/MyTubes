/**
 * File: DebugTabs.jsx
 * Path: src/debug/DebugTabs.jsx
 * Description: Tab bar for DebugOverlay with Copy button for current tab.
 */

export default function DebugTabs({ active, setActive, getCurrentTabText }) {
  const tabs = ["Console", "Router", "Network", "Player"];

  function copyCurrentTab() {
    try {
      const text = getCurrentTabText();
      if (!text) return;

      navigator.clipboard.writeText(text);
      window.bootDebug?.log("CONSOLE", "Copied current tab to clipboard");
    } catch (err) {
      window.bootDebug?.error("Copy failed: " + err.message);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        background: "#111",
        borderBottom: "1px solid #333",
        padding: "6px 8px",
        alignItems: "center",
        gap: 8,
        overflowX: "auto"
      }}
    >
      {/* Tabs */}
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setActive(t)}
          style={{
            padding: "6px 10px",
            background: active === t ? "#333" : "#1a1a1a",
            color: "#fff",
            border: "1px solid #444",
            borderRadius: 4,
            fontSize: 12,
            whiteSpace: "nowrap",
            cursor: "pointer"
          }}
        >
          {t}
        </button>
      ))}

      {/* Spacer pushes Copy button to the right */}
      <div style={{ flex: 1 }} />

      {/* Copy Button */}
      <button
        onClick={copyCurrentTab}
        style={{
          padding: "6px 10px",
          background: "#222",
          color: "#fff",
          border: "1px solid #444",
          borderRadius: 4,
          fontSize: 12,
          whiteSpace: "nowrap",
          cursor: "pointer"
        }}
      >
        Copy
      </button>
    </div>
  );
}
