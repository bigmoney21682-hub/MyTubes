// src/components/VideoCard.jsx

import { useNavigate } from "react-router-dom";
import { usePlaylists } from "./PlaylistContext";
import { API_BASE } from "../config";

export default function VideoCard({ video, onClick }) {
  const navigate = useNavigate();
  const { addToPlaylist, playlists } = usePlaylists();

  const handleCardClick = () => {
    if (onClick) onClick();
    else navigate(`/watch/${video.id}`);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();

    if (playlists.length === 0) {
      alert("No playlists available. Create one first!");
      return;
    }

    if (playlists.length === 1) {
      addToPlaylist(playlists[0].id, video);
      alert(`Added "${video.title}" to ${playlists[0].name}`);
      return;
    }

    const list = playlists
      .map((p, i) => `${i + 1}. ${p.name}`)
      .join("\n");

    const choice = prompt(`Choose playlist:\n\n${list}`);
    const index = parseInt(choice, 10) - 1;

    if (index >= 0 && index < playlists.length) {
      addToPlaylist(playlists[index].id, video);
      alert(`Added to ${playlists[index].name}`);
    }
  };

  /** 🔧 THUMBNAIL NORMALIZATION (CRITICAL FIX) */
  const resolvedThumbnail = (() => {
    if (!video.thumbnail) return "/fallback.jpg";
    if (video.thumbnail.startsWith("http")) return video.thumbnail;
    return `${API_BASE}${video.thumbnail}`;
  })();

  return (
    <div
      onClick={handleCardClick}
      style={{
        cursor: "pointer",
        borderRadius: 12,
        overflow: "hidden",
        background: "#111",
        marginBottom: 24,
      }}
    >
      <img
        src={resolvedThumbnail}
        alt={video.title}
        style={{ width: "100%", display: "block" }}
        onError={(e) => {
          const resolvedThumbnail = "https://i.ytimg.com/vi/${video.id}/hqdefault.jpg";
        }}
      />

      <div style={{ padding: 12 }}>
        <h4 style={{ margin: "0 0 6px", color: "#fff" }}>
          {video.title}
        </h4>

        <p style={{ opacity: 0.7, fontSize: "0.85rem" }}>
          {video.author || "Unknown"} • {video.views || "—"}
        </p>

        <button
          onClick={handleAddClick}
          style={{
            marginTop: 8,
            background: "#ff0000",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          ➕ Add to Playlist
        </button>
      </div>
    </div>
  );
}
