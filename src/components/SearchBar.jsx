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
        width: "75%",
        maxWidth: 520,
        display: "flex",
        gap: 8,
      }}
    >
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search YouTube"
        style={{
          flex: 1,
          padding: "10px 14px",
          borderRadius: 999,
          border: "1px solid #333",
          background: "#000",
          color: "#fff",
          textAlign: "center",
          fontSize: "1rem",
        }}
      />

      <button
        type="submit"
        style={{
          padding: "0 14px",
          borderRadius: 999,
          border: "none",
          background: "#ff0000",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        🔍
      </button>
    </form>
  );
}
