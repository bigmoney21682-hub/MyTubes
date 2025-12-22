// File: src/pages/Playlists.jsx
// PCC v2.0 — Stable playlists grid with navigation + debug logs

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaylists } from "../contexts/PlaylistContext";

export default function Playlists() {
  const { playlists, addPlaylist } = usePlaylists();
  const navigate = useNavigate();

  const log = (msg) => window.debugLog?.(`PlaylistsPage: ${msg}`);

  // Log page mount
  useEffect(() => {
    log("Page mounted");
  }, []);

  // Log playlist changes
  useEffect(() => {
    log(`Playlists count = ${playlists?.length ?? 0}`);
    log(JSON.stringify(playlists, null, 2));
  }, [playlists]);

  const handleAdd = () => {
    const name = prompt("Enter new playlist name:");
    if (!name) return;

    const trimmed = name.trim();
    if (!trimmed) return;

    const created = addPlaylist(trimmed);
    log(`Created playlist "${trimmed}" with id=${created.id}`);
  };

  const handleOpen = (id) => {
    log(`Opening playlist ${id}`);
    navigate(`/playlist/${id}`);
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
      <div style={{ padding: "1rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Playlists</h2>

        <button
          onClick={handleAdd}
          style={{
            background: "#ff0000",
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          + New Playlist
        </button>
      </div>

      {(!playlists || playlists.length === 0) ? (
        <p style={{ padding: "0 1rem", opacity: 0.7 }}>
          No playlists yet. Create one to get started.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "16px",
            padding: "1rem",
            width: "100%", // Safari fix
            boxSizing: "border-box",
          }}
        >
          {playlists.map((p) =>
            p ? (
              <div
                key={p.id}
                onClick={() => handleOpen(p.id)}
                style={{
                  background: "#111",
                  borderRadius: "12px",
                  padding: "16px",
                  cursor: "pointer",
                  border: "1px solid #222",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 90,
                }}
              >
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  📁 {p.name}
                </div>

                <div style={{ opacity: 0.6, fontSize: 13 }}>
                  {(p.videos?.length ?? 0)} video
                  {(p.videos?.length ?? 0) === 1 ? "" : "s"}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
