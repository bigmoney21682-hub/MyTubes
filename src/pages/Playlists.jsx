// File: src/pages/Playlists.jsx
// PCC v1.0 — Preservation-First Mode

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaylists } from "../contexts/PlaylistContext";

export default function Playlists() {
  const { playlists, addPlaylist, deletePlaylist, renamePlaylist, movePlaylist } = usePlaylists();
  const navigate = useNavigate();

  // Page mount
  useEffect(() => {
    window.debugLog?.("DEBUG: Playlists page mounted");
    window.debugLog?.(`DEBUG: Playlists count = ${playlists.length}`);
  }, [playlists.length]);

  const handleAdd = () => {
    const name = prompt("Enter new playlist name:");
    if (name) {
      addPlaylist(name);
      window.debugLog?.(`DEBUG: Added playlist "${name}"`);
    }
  };

  const handleDelete = (id, name) => {
    if (confirm(`Delete playlist "${name}"?`)) {
      deletePlaylist(id);
      window.debugLog?.(`DEBUG: Deleted playlist "${name}"`);
    }
  };

  const handleRename = (id, oldName) => {
    const newName = prompt("Enter new playlist name:", oldName);
    if (newName && newName !== oldName) {
      renamePlaylist(id, newName);
      window.debugLog?.(`DEBUG: Renamed playlist "${oldName}" → "${newName}"`);
    }
  };

  const handleMove = (id, direction) => {
    movePlaylist(id, direction);
    window.debugLog?.(`DEBUG: Moved playlist id=${id} ${direction}`);
  };

  return (
    <div
      style={{
        paddingTop: "var(--header-height)",
        paddingBottom: "var(--footer-height)",
        minHeight: "100vh",
        background: "var(--app-bg)",
        color: "#fff",
      }}
    >
      {/* Header removed per baby step #1 */}

      <div style={{ padding: "1rem" }}>
        <h2>Playlists</h2>
        <button onClick={handleAdd}>+ New Playlist</button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "16px",
          padding: "1rem",
        }}
      >
        {playlists.map((p) => (
          <div
            key={p.id}
            style={{
              background: "#111",
              borderRadius: "12px",
              padding: "16px",
              cursor: "pointer",
              border: "1px solid #222",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              onClick={() => navigate(`/playlist/${p.id}`)}
              style={{ fontSize: "1.1rem", fontWeight: 600 }}
            >
              📁 {p.name}
            </div>
            <div style={{ opacity: 0.6, marginTop: 6 }}>
              {p.videos.length} videos
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
              <button onClick={() => handleRename(p.id, p.name)}>Rename</button>
              <button onClick={() => handleDelete(p.id, p.name)}>Delete</button>
              <button onClick={() => handleMove(p.id, "up")}>↑</button>
              <button onClick={() => handleMove(p.id, "down")}>↓</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
