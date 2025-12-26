/**
 * File: DebugTabs.jsx
 * Path: src/debug/DebugTabs.jsx
 * Description: Fixed tab bar for the debug overlay.
 */

const TABS = [
  { id: "console", label: "Console" },
  { id: "network", label: "Network" },
  { id: "player", label: "Player" },
  { id: "router", label: "Router" },
  { id: "perf", label: "Perf" },
  { id: "cmd", label: "Cmd" }
];

export default function DebugTabs({ activeTab, onChange }) {
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
      {TABS.map((tab) => (
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
    </div>
  );
}
