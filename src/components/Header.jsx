// src/components/Header.jsx

import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function Header({ onSearch }) {
  const navigate = useNavigate();

  return (
    <header
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid #222",
        background: "#0a0a0a",
      }}
    >
      {/* Top row: Menu | Title | Playlist */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <button
          style={{
            opacity: 0.7,
            fontSize: "1.3rem",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => navigate("/settings")}
        >
          ☰
        </button>

        <div
          onClick={() => navigate("/")}
          style={{
            cursor: "pointer",
            flex: 1,
            maxWidth: "70vw",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "1.6rem",
              background: "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              display: "inline-block",
            }}
          >
            🔥 MyTube 🔥
          </h1>

          <p
            style={{
              margin: "8px auto 0",
              fontSize: "0.82rem",
              opacity: 0.85,
              maxWidth: "90%",
              lineHeight: 1.4,
              color: "#ccc",
            }}
          >
            No Ads • No Tracking • Free Premium Features • Background Playback • 4K Support
          </p>
        </div>

        <button
          style={{
            opacity: 0.7,
            fontSize: "1.3rem",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => navigate("/playlists")}
        >
          ▶︎
        </button>
      </div>

      {/* Search bar */}
      {onSearch && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 0,
            maxWidth: "90vw",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              maxWidth: "600px",
              background: "#ffffff",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            <SearchBar
              onSearch={onSearch}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                padding: "12px 16px",
                fontSize: "1rem",
                outline: "none",
              }}
            />
            <button
              style={{
                background: "#ff0000",
                color: "white",
                border: "none",
                padding: "0 24px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => {
                // More reliable: find any text input inside the search bar
                const input = document.querySelector('input[type="text"], input[placeholder]');
                if (input?.value.trim()) {
                  onSearch(input.value.trim());
                }
              }}
            >
              Search
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
