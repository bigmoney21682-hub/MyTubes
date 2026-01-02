/**
 * File: Playlists.jsx
 * Path: src/pages/Playlists.jsx
 * Description: Lists all playlists with video counts, rename/delete
 *              controls, and navigation into individual Playlist pages.
 */

import React from "react";
import { Link } from "react-router-dom";
import { usePlaylists } from "../contexts/PlaylistContext.jsx";

export default function Playlists() {
  const { playlists, addPlaylist, renamePlaylist, deletePlaylist } = usePlaylists();

  function handleCreate() {
    const name = prompt("Name your playlist:");
    if (!name) return;
    addPlaylist(name);
  }

  function handleRename(id, currentName) {
    const name = prompt("Rename playlist:", currentName);
    if (!name) return;
    renamePlaylist(id, name);
  }

  function handleDelete(id) {
    if (!confirm("Delete this playlist?")) return;
    deletePlaylist(id);
  }

  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      <h2 style={{ marginBottom: "16px" }}>Your Playlists</h2>

      {/* Create new playlist */}
      <button
        onClick={handleCreate}
        style={{
          padding: "10px 16px",
          background: "#222",
          color: "#3ea6ff",
          border: "1px solid #444",
          borderRadius: "4px",
          marginBottom: "20px"
        }}
      >
        + New Playlist
      </button>

      {playlists.length === 0 && (
        <div style={{ opacity: 0.7 }}>You have no playlists yet.</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {playlists.map((p) => (
          <div
            key={p.id}
            style={{
              paddingBottom: "12px",
              borderBottom: "1px solid #333"
            }}
          >
            {/* Playlist name as a button */}
            <Link
              to={`/playlist/${p.id}`}
              style={{
                display: "inline-block",
                padding: "10px 14px",
                background: "#222",
                border: "1px solid #444",
                borderRadius: "6px",
                color: "#fff",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: "bold",
                marginBottom: "6px"
              }}
            >
              {p.name}
            </Link>

            {/* Video count */}
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: "4px" }}>
              {p.videos.length} videos
            </div>

            {/* Rename + Delete buttons */}
            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <button
                onClick={() => handleRename(p.id, p.name)}
                style={{
                  padding: "6px 10px",
                  background: "#333",
                  color: "#fff",
                  border: "1px solid #555",
                  borderRadius: "4px",
                  fontSize: "13px"
                }}
              >
                Rename
              </button>

              <button
                onClick={() => handleDelete(p.id)}
                style={{
                  padding: "6px 10px",
                  background: "#400",
                  color: "#fff",
                  border: "1px solid #600",
                  borderRadius: "4px",
                  fontSize: "13px"
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
