// File: src/components/Header.jsx

import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function Header({ onSearch }) {
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "var(--header-height)",
        background: "var(--app-bg)",
        borderBottom: "1px solid #222",
        zIndex: 1000,
        padding: "10px 12px",
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <button
          onClick={() => navigate("/settings")}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          ☰
          <div style={{ fontSize: 11, opacity: 0.7 }}>Menu</div>
        </button>

        <div
          onClick={() => navigate("/")}
          style={{
            cursor: "pointer",
            textAlign: "center",
            flex: 1,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "1.5rem",
              background:
                "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🔥 MyTube 🔥
          </h1>
        </div>

        <button
          onClick={() => navigate("/subs")}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          📺
          <div style={{ fontSize: 11, opacity: 0.7 }}>Subs</div>
        </button>
      </div>

      {/* Search bar */}
      {onSearch && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SearchBar onSearch={onSearch} />
        </div>
      )}
    </header>
  );
}
