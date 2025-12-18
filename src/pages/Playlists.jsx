// src/pages/Playlists.jsx

import { useNavigate } from "react-router-dom";
import { usePlaylists } from "../components/PlaylistContext";

export default function Playlists() {
  const navigate = useNavigate();
  const {
    playlists,
    setCurrentPlaylist,
    addPlaylist,
    renamePlaylist,
    deletePlaylist,
  } = usePlaylists();

  const handleAddPlaylist = () => {
    const name = prompt("Enter playlist name:");
    if (name) addPlaylist(name);
  };

  const handleRename = (id, currentName) => {
    const newName = prompt("Enter new name:", currentName);
    if (newName) renamePlaylist(id, newName);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete playlist "${name}"? This cannot be undone.`)) {
      deletePlaylist(id);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 24 }}>📁 Playlists</h2>

      <button
        onClick={handleAddPlaylist}
        style={{
          padding: "10px 16px",
          background: "#ff0000",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: "1rem",
          marginBottom: 24,
          cursor: "pointer",
        }}
      >
        ➕ New Playlist
      </button>

      <div>
        {playlists.map(p => (
          <div
            key={p.id}
            style={{
              padding: 16,
              marginBottom: 12,
              background: "#111",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <strong
              onClick={() => {
                setCurrentPlaylist(p);
                navigate(`/playlist/${p.id}`);
              }}
              style={{ cursor: "pointer", fontSize: "1.1rem" }}
            >
              {p.name} ({p.videos.length} videos)
            </strong>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => handleRename(p.id, p.name)}>✏️</button>
              <button onClick={() => handleDelete(p.id, p.name)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {playlists.length === 0 && (
        <p style={{ opacity: 0.7, textAlign: "center" }}>
          No playlists yet. Create one!
        </p>
      )}
    </div>
  );
}
