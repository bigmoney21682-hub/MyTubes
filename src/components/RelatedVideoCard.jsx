// File: src/components/RelatedVideoCard.jsx
// PCC v13.0 — Compact horizontal card for related videos
// - Navigates to /watch?v=ID
// - Uses unified YouTube-only API shape

import { useNavigate } from "react-router-dom";

export default function RelatedVideoCard({ video }) {
  const navigate = useNavigate();

  const id =
    typeof video.id === "string"
      ? video.id
      : video.id?.videoId || video.videoId || null;

  const thumb =
    video.thumbnail ||
    video.snippet?.thumbnails?.medium?.url ||
    video.snippet?.thumbnails?.high?.url;

  const title = video.title || video.snippet?.title || "Untitled";
  const channel =
    video.channelTitle || video.snippet?.channelTitle || "Unknown Channel";

  return (
    <div
      onClick={() => navigate(`/watch?v=${id}`)}
      style={{
        display: "flex",
        gap: 12,
        cursor: "pointer",
      }}
    >
      {/* Thumbnail */}
      <img
        src={thumb}
        alt={title}
        style={{
          width: 140,
          height: 80,
          objectFit: "cover",
          borderRadius: 8,
          background: "#111",
        }}
      />

      {/* Text */}
      <div style={{ flex: 1 }}>
        <h4
          style={{
            margin: "0 0 4px 0",
            fontSize: 14,
            lineHeight: 1.3,
            color: "#fff",
            fontWeight: 500,
          }}
        >
          {title}
        </h4>

        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "#aaa",
          }}
        >
          {channel}
        </p>
      </div>
    </div>
  );
}
