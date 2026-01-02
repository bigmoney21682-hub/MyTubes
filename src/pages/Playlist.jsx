import React from "react";
import { Link, useParams } from "react-router-dom";
import { usePlaylists } from "../contexts/PlaylistContext.jsx";
import VideoActions from "../components/VideoActions.jsx";

export default function Playlist() {
  const { id } = useParams();
  const { playlists } = usePlaylists();

  const playlist = playlists.find((p) => p.id === id);

  if (!playlist) {
    return <div style={{ padding: 20 }}>Playlist not found.</div>;
  }

  return (
    <div style={{ padding: "12px" }}>
      <h2 style={{ marginBottom: 12 }}>{playlist.name}</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {playlist.videos.map((v) => (
          <div key={v.id}>
            <Link
              to={`/watch/${v.id}`}
              style={{
                textDecoration: "none",
                color: "#fff",
                display: "block"
              }}
            >
              <img
                src={v.thumbnail}
                alt={v.title}
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "8px"
                }}
              />

              <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 4 }}>
                {v.title}
              </div>

              <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>
                {v.author}
              </div>
            </Link>

            <VideoActions
              videoId={v.id}
              videoSnippet={{
                title: v.title,
                channelTitle: v.author,
                thumbnails: { medium: { url: v.thumbnail } }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
