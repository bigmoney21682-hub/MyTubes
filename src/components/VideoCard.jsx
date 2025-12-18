import { useNavigate } from "react-router-dom";
import { usePlaylists } from "./PlaylistContext";

export default function VideoCard({ video, onClick }) {
  const navigate = useNavigate();
  const { addToPlaylist, playlists } = usePlaylists();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/watch/${video.id}`);
    }
  };

  const handleAddClick = (e) => {
    e.stopPropagation();

    if (playlists.length === 0) {
      alert("No playlists available. Create one first!");
      return;
    }

    if (playlists.length === 1) {
      addToPlaylist(playlists[0].id, video);
      alert(`Added "${video.title}" to ${playlists[0].name}!`);
      return;
    }

    const playlistList = playlists
      .map((p, i) => `${i + 1}. ${p.name} (${p.videos.length} videos)`)
      .join("\n");

    const choice = prompt(
      `Choose a playlist to add "${video.title}" to:\n\n${playlistList}\n\nEnter number:`
    );

    const index = parseInt(choice, 10) - 1;
    if (index >= 0 && index < playlists.length) {
      addToPlaylist(playlists[index].id, video);
      alert(`Added to ${playlists[index].name}!`);
    } else if (choice !== null) {
      alert("Invalid choice.");
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        cursor: "pointer",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#111",
        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        marginBottom: 24,
        transition: "transform 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        loading="lazy"
        style={{
          width: "100%",
          display: "block",
          aspectRatio: "16 / 9",
          objectFit: "cover",
          backgroundColor: "#000",
        }}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/fallback.jpg";
        }}
      />

      <div style={{ padding: "12px" }}>
        <h4
          style={{
            margin: "0 0 8px",
            fontSize: "1rem",
            lineHeight: 1.3,
            color: "#fff",
          }}
        >
          {video.title}
        </h4>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              opacity: 0.7,
              fontSize: "0.85rem",
            }}
          >
            {video.author} • {video.views ?? "Views"}
          </p>

          <button
            onClick={handleAddClick}
            style={{
              background: "#ff0000",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            ➕ Add
          </button>
        </div>
      </div>
    </div>
  );
}
