// File: src/components/VideoCard.jsx

import { useNavigate } from "react-router-dom";
import { usePlaylists } from "../contexts/PlaylistContext";

export default function VideoCard({ video, onClick }) {
  const navigate = useNavigate();
  const { playlists, addToPlaylist } = usePlaylists();

  function handleClick() {
    if (typeof onClick === "function") {
      onClick(video.id);
      return;
    }
    navigate(`/watch/${video.id}`);
  }

  function handleAddToPlaylist(e) {
    e.stopPropagation();

    if (!playlists || playlists.length === 0) {
      alert("No playlists yet. Create one first.");
      return;
    }

    const names = playlists.map(
      (p, i) => `${i + 1}. ${p.name}`
    ).join("\n");

    const choice = prompt(
      `Add to which playlist?\n\n${names}`
    );

    const index = Number(choice) - 1;

    if (!playlists[index]) return;

    addToPlaylist(playlists[index].id, video);
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

        <button onClick={handleAddToPlaylist}>
          + Playlist
        </button>
      </div>
    </div>
  );
}
