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

  const handleAdd = (e) => {
    e.stopPropagation();

    if (playlists.length === 0) {
      const name = prompt("No playlists found. Enter name for a new playlist:");
      if (name) addToPlaylist(name, video);
      return;
    }

    // Scrollable selection prompt
    const playlistNames = playlists.map((p) => p.name);
    const choice = prompt(
      "Add to playlist:\n" + playlistNames.map((n, i) => `${i + 1}. ${n}`).join("\n")
    );

    const index = parseInt(choice) - 1;
    if (!isNaN(index) && playlists[index]) {
      addToPlaylist(playlists[index].id, video);
    }
  };

  return (
    <div className="video-card" onClick={handleClick}>
      <img src={video.thumbnail} alt={video.title} loading="lazy" />

      <div className="video-info">
        <h4>{video.title}</h4>
        <p>{video.author}</p>

        <button onClick={handleAdd}>+ Playlist</button>
      </div>
    </div>
  );
}
