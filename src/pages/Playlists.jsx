// File: src/pages/Playlists.jsx
// PCC v1.0 — Preservation-First Mode

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaylists } from "../contexts/PlaylistContext";

export default function Playlists() {
  const { playlists, addPlaylist } = usePlaylists();
  const navigate = useNavigate();

  useEffect(() => {
    window.debugLog?.("DEBUG: Playlists page mounted");
    window.debugLog?.(`DEBUG: Playlists count = ${playlists?.length}`);
    console.log("DEBUG: Playlists state", playlists);
  }, [playlists]);

  const handleAdd = () => {
    const name = prompt("Enter new playlist name:");
    if (name) addPlaylist(name);
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
          width: "100%", // explicit width for Safari
          boxSizing: "border-box",
        }}
      >
        {playlists?.map((p) => (
          p && (
            <div
              key={p.id}
              onClick={() => navigate(`/playlist/${p.id}`)}
              style={{
                background: "#111",
                borderRadius: "12px",
                padding: "16px",
                cursor: "pointer",
                border: "1px solid #222",
              }}
            >
              <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                📁 {p.name}
              </div>
              <div style={{ opacity: 0.6, marginTop: 6 }}>
                {p.videos?.length ?? 0} videos
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
