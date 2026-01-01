/**
 * File: Playlist.jsx
 * Path: src/pages/Playlist.jsx
 * Description: Individual playlist view with video listing,
 *              remove support, and play-from-playlist behavior.
 */

import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePlaylists } from "../contexts/PlaylistContext.jsx";
import { usePlayer } from "../player/PlayerContext.jsx";
import { debugBus } from "../debug/debugBus.js";

export default function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { playlists, removeVideoFromPlaylist } = usePlaylists();
  const { loadVideo } = usePlayer();

  const playlist = playlists.find((p) => p.id === id);

  const log = (msg) => debugBus.log("PLAYLIST", `Playlist.jsx → ${msg}`);

  useEffect(() => {
    if (!playlist) {
      log(`Playlist not found: ${id}`);
    } else {
      log(`Loaded playlist "${playlist.name}" (${playlist.videos.length} videos)`);
    }
  }, [playlist, id]);

  if (!playlist) {
    return (
      <div style={{ padding: 16, color: "#fff" }}>
        <h2>Playlist not found</h2>
        <p>The playlist you are looking for does not exist.</p>
      </div>
    );
  }

  function handlePlay(video)  
  {
    log(`Playing video ${video.id} from playlist ${id}`);

    // Load video into global player
    loadVideo(video.id);

    // Navigate to watch page
    navigate(`/watch/${video.id}`);
  }

  function handleRemove(videoId) {
    log(`Removing video ${videoId} from playlist ${id}`);
    removeVideoFromPlaylist(id, videoId);
  }

  return (
    <div
      style={{
        paddingTop: "var(--header-height)",
        paddingBottom: "var(--footer-height)",
        minHeight: "100vh",
        background: "var(--app-bg)",
        color: "#fff"
      }}
    >
      <div style={{ padding: "1rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>{playlist.name}</h2>
        <p style={{ opacity: 0.7 }}>
          {playlist.videos.length} video
          {playlist.videos.length === 1 ? "" : "s"}
        </p>
      </div>

      {playlist.videos.length === 0 ? (
        <p style={{ padding: "1rem", opacity: 0.7 }}>
          This playlist is empty.
        </p>
      ) : (
        <div style={{ padding: "1rem" }}>
          {playlist.videos.map((v, i) => (
            <div
              key={v.id + "_" + i}
              style={{
                display: "flex",
                marginBottom: "16px",
                background: "#111",
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid #222"
              }}
            >
              <img
                src={v.thumbnail}
                alt={v.title}
                style={{
                  width: "160px",
                  height: "90px",
                  objectFit: "cover"
                }}
                onClick={() => handlePlay(v)}
              />

              <div style={{ padding: "10px", flex: 1 }}>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    marginBottom: "4px",
                    cursor: "pointer"
                  }}
                  onClick={() => handlePlay(v)}
                >
                  {v.title}
                </div>

                <div style={{ fontSize: "13px", opacity: 0.7 }}>
                  {v.author}
                </div>

                <button
                  onClick={() => handleRemove(v.id)}
                  style={{
                    marginTop: "8px",
                    background: "none",
                    border: "1px solid #444",
                    color: "#ff5555",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
