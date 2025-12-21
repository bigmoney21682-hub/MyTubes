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
      }}
    >
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search YouTube"
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 999,
          border: "1px solid #333",
          background: "#000",
          color: "#fff",
          textAlign: "center",
          fontSize: "1rem",
        }}
      />
    </form>
  );
}
