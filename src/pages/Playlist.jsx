/**
 * File: Playlist.jsx
 * Path: src/pages/Playlist.jsx
 * Description: Polished playlist detail page with clean video rows,
 *              right‑aligned remove buttons, and modern layout.
 */

import React from "react";
import { useParams, Link } from "react-router-dom";
import { usePlaylists } from "../contexts/PlaylistContext.jsx";

export default function Playlist() {
  const { id } = useParams();
  const { playlists, removeVideoFromPlaylist } = usePlaylists();

  const playlist = playlists.find((p) => p.id === id);

  if (!playlist) {
    return (
      <div style={{ padding: "16px", color: "#fff" }}>
        <h2>Playlist not found</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      {/* Title */}
      <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "6px" }}>
        {playlist.name}
      </h2>

      {/* Video count */}
      <div style={{ opacity: 0.7, fontSize: "14px", marginBottom: "20px" }}>
        {playlist.videos.length} videos
      </div>

      {/* Video list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {playlist.videos.map((v) => (
          <div
            key={v.id}
            style={{
              display: "flex",
              alignItems: "center",
              paddingBottom: "14px",
              borderBottom: "1px solid #2a2a2a",
              gap: "12px"
            }}
          >
            {/* Thumbnail */}
            <Link
              to={`/watch/${v.id}?src=playlist&pl=${playlist.id}`}
              style={{ flexShrink: 0 }}
            >
              <img
                src={v.thumbnail}
                alt={v.title}
                style={{
                  width: "140px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "6px"
                }}
              />
            </Link>

            {/* Title + channel */}
            <div style={{ flexGrow: 1 }}>
              <Link
                to={`/watch/${v.id}?src=playlist&pl=${playlist.id}`}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "15px",
                  fontWeight: "600",
                  display: "block",
                  marginBottom: "4px"
                }}
              >
                {v.title}
              </Link>

              <div style={{ fontSize: "13px", opacity: 0.7 }}>
                {v.author}
              </div>
            </div>

            {/* Remove button */}
            <button
              onClick={() => removeVideoFromPlaylist(playlist.id, v.id)}
              style={{
                padding: "7px 12px",
                background: "#3a0000",
                color: "#fff",
                border: "1px solid #660000",
                borderRadius: "6px",
                fontSize: "13px",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.15s, border-color 0.15s"
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
