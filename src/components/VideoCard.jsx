// File: src/components/VideoCard.jsx

import { useNavigate } from "react-router-dom";
import { usePlaylists } from "./PlaylistContext";

export default function VideoCard({ video, onClick }) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = usePlaylists();

  function handleClick() {
    // ✅ If parent provided a click handler, use it
    if (typeof onClick === "function") {
      onClick(video.id);
      return;
    }

    // ✅ Default Musi-style behavior: navigate to watch page
    navigate(`/watch/${video.id}`);
  }

  return (
    <div className="video-card" onClick={handleClick}>
      <img
        src={video.thumbnail}
        alt={video.title}
        loading="lazy"
      />

      <div className="video-info">
        <h4>{video.title}</h4>
        <p>{video.author}</p>

        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent navigation
            toggleFavorite(video);
          }}
        >
          {isFavorite(video.id) ? "★" : "☆"}
        </button>
      </div>
    </div>
  );
}
