// File: src/components/Header.jsx

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SearchBar from "./SearchBar";

export default function Header({ onSearch }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function go(path) {
    setOpen(false);
    navigate(path);
  }

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
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOpen(v => !v)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            ☰
          </button>

          {open && (
            <div
              style={{
                position: "absolute",
                top: 36,
                left: 0,
                background: "#111",
                border: "1px solid #333",
                borderRadius: 8,
                padding: 8,
                minWidth: 140,
              }}
            >
              {[
                ["Home", "/"],
                ["Playlists", "/playlists"],
                ["Subs", "/subs"],
                ["Settings", "/settings"],
                ["About", "/about"],
              ].map(([label, path]) => (
                <div
                  key={label}
                  onClick={() => go(path)}
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    opacity: 0.85,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{ flex: 1, textAlign: "center", cursor: "pointer" }}
          onClick={() => navigate("/")}
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
      </div>

      {onSearch && (
        <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
          <SearchBar onSearch={onSearch} />
        </div>
      )}
    </header>
  );
}
