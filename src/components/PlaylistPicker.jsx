// File: src/components/PlaylistPicker.jsx
// PCC v2.0 — Stable modal for adding videos to playlists

import { useState } from "react";
import { usePlaylists } from "../contexts/PlaylistContext";

export default function PlaylistPicker({ video, onClose }) {
  const { playlists, addPlaylist, addToPlaylist } = usePlaylists();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const log = (msg) => window.debugLog?.(`PlaylistPicker: ${msg}`);

  const handleAddTo = (playlistId) => {
    log(`Adding video "${video.title}" to playlist ${playlistId}`);
    addToPlaylist(playlistId, video);
    onClose();
  };

  const handleCreate = () => {
    setCreating(true);
  };

  const handleCreateSubmit = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const created = addPlaylist(trimmed);
    log(`Created playlist "${trimmed}" (id=${created.id})`);

    addToPlaylist(created.id, video);
    log(`Added video to new playlist "${trimmed}"`);

    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111",
          padding: 20,
          borderRadius: 12,
          width: "90%",
          maxWidth: 360,
          color: "#fff",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Add to Playlist</h3>

        {/* Existing playlists */}
        {playlists.length > 0 ? (
          <div style={{ marginBottom: 16 }}>
            {playlists.map((p) => (
              <div
                key={p.id}
                onClick={() => handleAddTo(p.id)}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #333",
                  cursor: "pointer",
                }}
              >
                📁 {p.name}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ opacity: 0.7, marginBottom: 16 }}>
            No playlists yet. Create one below.
          </p>
        )}

        {/* Create new playlist */}
        {!creating ? (
          <button
            onClick={handleCreate}
            style={{
              width: "100%",
              padding: 10,
              background: "#ff0000",
              border: "none",
              color: "#fff",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            + New Playlist
          </button>
        ) : (
          <div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Playlist name"
              autoFocus
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 10,
                borderRadius: 6,
                border: "1px solid #333",
                background: "#000",
                color: "#fff",
              }}
            />

            <button
              onClick={handleCreateSubmit}
              style={{
                width: "100%",
                padding: 10,
                background: "#ff0000",
                border: "none",
                color: "#fff",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Create & Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
