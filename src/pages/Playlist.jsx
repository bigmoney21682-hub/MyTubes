/**
 * File: Playlist.jsx
 * Path: src/pages/Playlist.jsx
 */

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlaylists } from "../contexts/PlaylistContext.jsx";
import { normalizeId } from "../utils/normalizeId.js";

export default function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playlists, removeVideoFromPlaylist } = usePlaylists();

  const playlist = playlists.find((p) => p.id === id);

  if (!playlist) {
    return (
      <div style={{ paddingTop: "60px", padding: "16px" }}>
        <h2>Playlist not found</h2>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "60px", padding: "16px", color: "#fff" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>{playlist.name}</h2>

      {playlist.videos.length === 0 && (
        <div style={{ opacity: 0.7 }}>No videos in this playlist.</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {playlist.videos.map((v) => {
          const vidId = normalizeId(v);

          if (!vidId) {
            console.warn("Playlist.jsx → Skipped invalid playlist entry:", v);
            return null;
          }

          return (
            <div
              key={vidId}
              style={{
                display: "flex",
                gap: "12px",
                background: "#111",
                padding: "10px",
                borderRadius: "8px"
              }}
            >
              <img
                src={v.thumbnail}
                alt={v.title}
                style={{
                  width: "140px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
                onClick={() =>
                  navigate(`/watch/${vidId}?src=playlist&pl=${id}`)
                }
              />

              <div style={{ flex: 1 }}>
                <div
                  onClick={() =>
                    navigate(`/watch/${vidId}?src=playlist&pl=${id}`)
                  }
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  {v.title}
                </div>

                <button
                  onClick={() => removeVideoFromPlaylist(id, vidId)}
                  style={{
                    marginTop: "8px",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#b91c1c",
                    color: "#fff",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
