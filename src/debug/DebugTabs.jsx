/**
 * File: DebugTabs.jsx
 * Path: src/debug/DebugTabs.jsx
 * Description: Fixed tab bar for the debug overlay with Copy button.
 */

const BASE_TABS = [
  { id: "console", label: "Console" },
  { id: "router", label: "Router" },
  { id: "network", label: "Network" },
  { id: "player", label: "Player" }
];

export default function DebugTabs({ activeTab, onChange, onCopy, extraTabs = [] }) {
  // ⭐ Merge built‑in tabs with extra tabs
  const tabs = [
    ...BASE_TABS,
    ...extraTabs.map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }))
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 6,
        borderBottom: "1px solid #333",
        paddingBottom: 4,
        overflowX: "hidden",
        whiteSpace: "nowrap",
        minWidth: 0
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: "4px 8px",
            background: tab.id === activeTab ? "#555" : "#222",
            border: "1px solid #555",
            color: "#fff",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 11,
            flexShrink: 0
          }}
        >
          {tab.label}
        </button>
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Copy button */}
      <button
        onClick={onCopy}
        style={{
          padding: "4px 8px",
          background: "#333",
          border: "1px solid #555",
          color: "#fff",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 11,
          flexShrink: 0
        }}
      >
        Copy
      </button>
    </div>
  );
}
