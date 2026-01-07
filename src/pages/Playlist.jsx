/**
 * ------------------------------------------------------------
 * File: Playlist.jsx
 * Path: src/pages/Playlist.jsx
 * Description:
 *   Corrected to avoid overlap with sticky Header + Player + MiniPlayer.
 *   Adds proper top offset so content begins below the player stack.
 * ------------------------------------------------------------
 */

import React from "react";
import { useParams } from "react-router-dom";

import { usePlaylists } from "../contexts/PlaylistContext.jsx";
import { usePlayer } from "../player/PlayerContext.jsx";
import { playVideo } from "../utils/playVideo.js";

import normalizeId from "../utils/normalizeId.js";

export default function Playlist() {
  const { id } = useParams();
  const { playlists, removeVideoFromPlaylist } = usePlaylists();
  const player = usePlayer();

  const playlist = playlists.find((p) => p.id === id);

  if (!playlist) {
    return (
      <div style={{ paddingTop: "300px", padding: "16px", color: "#fff" }}>
        <h2>Playlist not found</h2>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "300px", padding: "16px", color: "#fff" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
        {playlist.name}
      </h2>

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

          const title = v.title ?? v.snippet?.title ?? "";
          const thumbnail =
            v.thumbnail ?? v.snippet?.thumbnails?.medium?.url ?? "";
          const channel =
            v.channelTitle ?? v.snippet?.channelTitle ?? "";

          function handlePlay() {
            playVideo({
              id: vidId,
              title,
              thumbnail,
              channel,
              player,
              playlistId: id,
              autonext: "playlist"
            });
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
                src={thumbnail}
                alt={title}
                style={{
                  width: "140px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
                onClick={handlePlay}
              />

              <div style={{ flex: 1 }}>
                <div
                  onClick={handlePlay}
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  {title}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginTop: "4px"
                  }}
                >
                  {channel}
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
