// File: src/pages/Playlist.jsx
// PCC v1.0 — Preservation-First Mode

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePlaylists } from "../contexts/PlaylistContext";
import Header from "../components/Header";
import Spinner from "../components/Spinner";

export default function Playlist() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { playlists, currentPlaylist, setCurrentPlaylist, removeFromPlaylist } =
    usePlaylists();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (playlists.length > 0) {
      const found = playlists.find((p) => p.id === id);
      if (found) setCurrentPlaylist(found);
      setLoading(false);
    }
  }, [id, playlists]);

  if (loading) {
    return (
      <div style={{ paddingTop: "var(--header-height)" }}>
        <Header />
        <Spinner message="Loading playlist…" />
      </div>
    );
  }

  const playlist = playlists.find((p) => p.id === id) || currentPlaylist;
  if (!playlist) return null;

  const { name, videos = [] } = playlist;

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
      <Header />

      <h3 style={{ padding: "1rem" }}>
        📁 {name} ({videos.length})
      </h3>

      {videos.length === 0 ? (
        <p style={{ padding: "0 1rem", opacity: 0.7 }}>
          No videos in this playlist yet.
        </p>
      ) : (
        <div style={{ padding: "0 1rem" }}>
          {videos.map((v, i) => (
            <div
              key={v.id}
              style={{
                padding: 12,
                background: "#111",
                marginBottom: 8,
                borderRadius: 8,
                cursor: "pointer",
              }}
              onClick={() => navigate(`/watch/${v.id}?pl=1&index=${i}`)}
            >
              {v.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
