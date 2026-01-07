/**
 * File: Playlists.jsx
 * Path: src/pages/Playlists.jsx
 * Description:
 *   Corrected to avoid overlap with sticky Header + Player + MiniPlayer.
 *   Adds proper top offset so content begins below the player stack.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlaylists } from "../contexts/PlaylistContext.jsx";

export default function Playlists() {
  const navigate = useNavigate();
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist
  } = usePlaylists();

  function handleCreate() {
    const name = prompt("New playlist name:");
    if (!name) return;
    createPlaylist(name);
  }

  function handleRename(id, oldName) {
    const name = prompt("Rename playlist:", oldName);
    if (!name) return;
    renamePlaylist(id, name);
  }

  return (
    <div
      style={{
        paddingTop: "300px",   // ⭐ FIXED: content starts below sticky player stack
        padding: "16px",
        color: "#fff"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px"
        }}
      >
        <h2 style={{ fontSize: "20px" }}>Playlists</h2>

        <button
          onClick={handleCreate}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            background: "#3b82f6",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          + New
        </button>
      </div>

      {playlists.length === 0 && (
        <div style={{ opacity: 0.7 }}>No playlists yet.</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {playlists.map((pl) => (
          <div
            key={pl.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              background: "#111",
              borderRadius: "8px"
            }}
          >
            <div
              onClick={() => navigate(`/playlist/${pl.id}`)}
              style={{ flex: 1, cursor: "pointer" }}
            >
              <div style={{ fontSize: "16px", fontWeight: 600 }}>{pl.name}</div>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                {pl.videos.length} videos
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleRename(pl.id, pl.name)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#4b5563",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                Rename
              </button>

              <button
                onClick={() => deletePlaylist(pl.id)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#b91c1c",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
