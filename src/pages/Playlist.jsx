// src/pages/Playlist.jsx

import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { usePlaylists } from "../components/PlaylistContext";
import Header from "../components/Header";
import VideoCard from "../components/VideoCard";

export default function Playlist() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { playlists, currentPlaylist, setCurrentPlaylist } = usePlaylists();

  const playlist =
    playlists.find(p => p.id === id) || currentPlaylist;

  useEffect(() => {
    if (id) {
      const found = playlists.find(p => p.id === id);
      if (found) setCurrentPlaylist(found);
    }
  }, [id, playlists]);

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

  const { name, videos = [] } = playlist;

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
      <Header />
      <h3 style={{ padding: "1rem", opacity: 0.8 }}>
        📁 {name} ({videos.length} videos)
      </h3>

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
