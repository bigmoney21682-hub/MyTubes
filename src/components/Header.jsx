/**
 * File: Header.jsx
 * Path: src/components/Header.jsx
 * Description: Global app header with MyTube title and search bar.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        background: "#111",
        borderBottom: "1px solid #222",
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        zIndex: 1000
      }}
    >
      {/* Title */}
      <div
        onClick={() => navigate("/")}
        style={{
          cursor: "pointer",
          fontSize: "1.4rem",
          fontWeight: "bold",
          marginRight: 12,
          background: "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          whiteSpace: "nowrap"
        }}
      >
        🔥 MyTube
      </div>

      {/* Search bar */}
      <form
        onSubmit={handleSubmit}
        style={{
          flex: 1,
          display: "flex",
          gap: 8
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          style={{
            flex: 1,
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #444",
            background: "#222",
            color: "#fff"
          }}
        />

        <button
          type="submit"
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            background: "#ff0000",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Go
        </button>
      </form>
    </header>
  );
}
