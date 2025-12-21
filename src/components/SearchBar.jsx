// File: src/components/SearchBar.jsx

import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [q, setQ] = useState("");

  function submit(e) {
    e.preventDefault();
    onSearch(q.trim());
  }

  return (
    <form
      onSubmit={submit}
      style={{
        width: "80%",
        maxWidth: 520,
        display: "flex",
        borderRadius: 999,
        overflow: "hidden",
        border: "1px solid #333",
        background: "#000",
      }}
    >
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search YouTube"
        style={{
          flex: 1,
          padding: "10px 14px",
          border: "none",
          outline: "none",
          background: "transparent",
          color: "#fff",
          fontSize: "1rem",
        }}
      />

      {/* vertical divider */}
      <div style={{ width: 1, background: "#333" }} />

      <button
        type="submit"
        style={{
          padding: "0 16px",
          border: "none",
          background: "#ff0000",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Search
      </button>
    </form>
  );
}
