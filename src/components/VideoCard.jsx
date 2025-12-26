// File: src/components/VideoCard.jsx
// PCC v13.0 — Modern YouTube-style video card
// - Works with unified YouTube-only API shape
// - Navigates to /watch?v=ID
// - Clean mobile-first layout
// - Safe thumbnail/title/channel extraction

import { useNavigate } from "react-router-dom";

export default function VideoCard({ video }) {
  const navigate = useNavigate();

  // ------------------------------------------------------------
  // Extract fields (YouTube-only API shape)
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div
      onClick={() => navigate(`/watch?v=${id}`)}
      style={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Thumbnail */}
      <img
        src={thumb}
        alt={title}
        style={{
          width: "100%",
          borderRadius: 12,
          background: "#111",
          objectFit: "cover",
        }}
      />

      {/* Title + Channel */}
      <div>
        <h3
          style={{
            margin: "4px 0 2px 0",
            fontSize: 16,
            lineHeight: 1.3,
            color: "#fff",
            fontWeight: 500,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "#aaa",
          }}
        >
          {channel}
        </p>
      </div>
    </div>
  );
}
