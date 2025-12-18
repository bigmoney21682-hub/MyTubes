// src/pages/Playlist.jsx

import { useNavigate, useParams } from "react-router-dom";
import { usePlaylists } from "../components/PlaylistContext";
import Header from "../components/Header";
import VideoCard from "../components/VideoCard";
import Spinner from "../components/Spinner";

export default function Playlist() {
  const navigate = useNavigate();
  const { id } = useParams(); // if you switch to /playlist/:id routing
  const { playlists, currentPlaylist, setCurrentPlaylist } = usePlaylists();

  // If your routing is /playlist/:id, find the playlist by id
  // (Recommended change – see note below)
  // const playlist = playlists.find(p => p.id === id) || currentPlaylist;

  // Current approach: relies on currentPlaylist being set
  const playlist = currentPlaylist;

  // Optional: auto-set currentPlaylist if coming from /playlist/:id
  // useEffect(() => {
  //   if (id && !playlist) {
  //     const found = playlists.find(p => p.id === id);
  //     if (found) setCurrentPlaylist(found);
  //   }
  // }, [id, playlists]);

  if (!playlist) {
    return (
      <div>
        <Header />
        <div style={{ padding: "2rem", textAlign: "center", opacity: 0.8 }}>
          Playlist not found
        </div>
      </div>
    );
  }

  const { name, videos } = playlist;

  if (videos.length === 0) {
    return (
      <div>
        <Header />

        <h3 style={{ padding: "1rem", opacity: 0.8 }}>
          {name} — Empty
        </h3>

        <p style={{ padding: "0 1rem", opacity: 0.7 }}>
          Add some videos to this playlist to see them here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Header /* onSearch={yourSearchFunc if needed} */ />

      <h3 style={{ padding: "1rem", opacity: 0.8 }}>
        📁 {name} ({videos.length} videos)
      </h3>

      {/* Optional back button */}
      {/* <button
        onClick={() => navigate("/playlists")}
        style={{ margin: "0 1rem 1rem", padding: "8px 12px" }}
      >
        ← Back to Playlists
      </button> */}

      <div className="grid">
        {videos.map((video, index) => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={() =>
              navigate(`/watch/${video.id}?pl=1&index=${index}`)
            }
          />
        ))}
      </div>
    </div>
  );
}
