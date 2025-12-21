import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePlaylists } from "../contexts/PlaylistContext";
import Spinner from "../components/Spinner";

export default function Playlist() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { playlists, currentPlaylist, setCurrentPlaylist, removeFromPlaylist } = usePlaylists();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (playlists.length > 0) {
      const found = playlists.find((p) => p.id === id);
      if (found) setCurrentPlaylist(found);
      setLoading(false);
    }
  }, [id, playlists]);

  const playlist = playlists?.find((p) => p.id === id) || currentPlaylist;

  if (loading) return <Spinner message="Loading playlist…" />;

  if (!playlist) return <p style={{ padding: "2rem", textAlign: "center", opacity: 0.8 }}>Playlist not found</p>;

  const { name, videos = [] } = playlist;

  const moveVideo = (index, direction) => {
    if (!playlist.videos) return;
    if (direction === "up" && index > 0) [playlist.videos[index - 1], playlist.videos[index]] = [playlist.videos[index], playlist.videos[index - 1]];
    else if (direction === "down" && index < playlist.videos.length - 1) [playlist.videos[index + 1], playlist.videos[index]] = [playlist.videos[index + 1], playlist.videos[index]];
    setCurrentPlaylist({ ...playlist });
  };

  return (
    <div style={{ paddingTop: "var(--header-height)", paddingBottom: "var(--footer-height)", minHeight: "100vh", background: "var(--app-bg)", color: "#fff" }}>
      <h3>📁 {name} ({videos.length} videos)</h3>

      {videos.length === 0 ? <p style={{ padding: "0 1rem", opacity: 0.7 }}>Add some videos to this playlist to see them here.</p> :
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "0 16px" }}>
          {videos.map((video, index) => (
            <div key={video.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111", padding: 12, borderRadius: 8 }}>
              <span style={{ flex: 1, cursor: "pointer" }} onClick={() => navigate(`/watch/${video.id}?pl=1&index=${index}`)}>{video.title}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => moveVideo(index, "up")} disabled={index === 0}>↑</button>
                <button onClick={() => moveVideo(index, "down")} disabled={index === videos.length - 1}>↓</button>
                <button onClick={() => removeFromPlaylist(playlist.id, video.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
