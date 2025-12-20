// File: src/pages/Playlists.jsx
import { useNavigate } from "react-router-dom";
import { usePlaylists } from "../contexts/PlaylistContext";
import Header from "../components/Header";

export default function Playlists() {
  const navigate = useNavigate();
  const {
    playlists,
    setCurrentPlaylist,
    addPlaylist,
    renamePlaylist,
    deletePlaylist,
    movePlaylist,
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
    <div
      style={{
        paddingTop: "var(--header-height)",
        paddingBottom: "var(--footer-height)",
        minHeight: "100vh",
        background: "var(--app-bg)",
        color: "#fff",
      }}
    >
      <Header />

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

        {playlists.map((p, idx) => (
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
              style={{ cursor: "pointer", fontSize: "1.1rem", flex: 1 }}
            >
              {p.name} ({p.videos.length} videos)
            </strong>

            <div style={{ display: "flex", gap: 8 }}>
              {/* Move Up / Down buttons */}
              <button
                onClick={() => movePlaylist(p.id, "up")}
                disabled={idx === 0}
              >
                ↑
              </button>
              <button
                onClick={() => movePlaylist(p.id, "down")}
                disabled={idx === playlists.length - 1}
              >
                ↓
              </button>

              <button onClick={() => handleRename(p.id, p.name)}>✏️</button>
              <button onClick={() => handleDelete(p.id, p.name)}>🗑️</button>
            </div>
          </div>
        ))}

        {playlists.length === 0 && (
          <p style={{ opacity: 0.7, textAlign: "center" }}>
            No playlists yet. Create one!
          </p>
        )}
      </div>
    </div>
  );
}
