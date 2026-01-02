/**
 * File: Playlist.jsx
 * Path: src/pages/Playlist.jsx
 * Description: Shows a single playlist with rename/delete/remove-video.
 */

import React from "react";
import { useParams, Link } from "react-router-dom";
import { usePlaylists } from "../contexts/PlaylistContext.jsx";

export default function Playlist() {
  const { id } = useParams();
  const { playlists, deletePlaylist, renamePlaylist, removeVideoFromPlaylist } =
    usePlaylists();

  const playlist = playlists.find((p) => p.id === id);

  if (!playlist) {
    return (
      <div style={{ padding: "16px", paddingTop: "var(--header-height)" }}>
        Playlist not found.
      </div>
    );
  }

  function handleRename() {
    const newName = prompt("Rename playlist:", playlist.name);
    if (newName && newName.trim()) renamePlaylist(id, newName.trim());
  }

  return (
    <div style={{ padding: "16px", paddingTop: "var(--header-height)" }}>
      <h2>{playlist.name}</h2>

      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <button
          onClick={handleRename}
          style={{
            background: "none",
            border: "1px solid #444",
            color: "#3ea6ff",
            padding: "6px 10px",
            borderRadius: "6px"
          }}
        >
          Rename
        </button>

        <button
          onClick={() => deletePlaylist(id)}
          style={{
            background: "none",
            border: "1px solid #444",
            color: "#ff4444",
            padding: "6px 10px",
            borderRadius: "6px"
          }}
        >
          Delete
        </button>
      </div>

      <h3 style={{ marginTop: "20px" }}>Videos</h3>

      {playlist.videos.length === 0 && (
        <div style={{ opacity: 0.7, marginTop: "8px" }}>No videos yet.</div>
      )}

      <div style={{ marginTop: "12px" }}>
        {playlist.videos.map((v) => (
          <div
            key={v.id}
            style={{
              padding: "12px 0",
              borderBottom: "1px solid #333",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <Link
              to={`/watch/${v.id}`}
              style={{ color: "#fff", textDecoration: "none" }}
            >
              {v.title}
            </Link>

            <button
              onClick={() => removeVideoFromPlaylist(id, v.id)}
              style={{
                background: "none",
                border: "1px solid #444",
                color: "#ff4444",
                padding: "4px 8px",
                borderRadius: "6px"
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
