import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import RelatedVideos from "../components/RelatedVideos";
import Spinner from "../components/Spinner";
import Player from "../components/Player";
import DebugOverlay from "../components/DebugOverlay";
import { API_KEY } from "../config";

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const playerRef = useRef(null);

  const log = (msg) => window.debugLog?.(msg);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    log(`DEBUG: Fetching video metadata for id: ${id}`);

    (async () => {
      try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${API_KEY}`);
        const data = await res.json();
        log(`DEBUG: Video fetch response: ${JSON.stringify(data)}`);
        setVideo(data.items?.[0] || null);
      } catch (err) {
        log(`DEBUG: Video fetch error: ${err}`);
        setVideo(null);
      } finally {
        setLoading(false);
        log("DEBUG: Watch loading complete");
      }
    })();
  }, [id]);

  useEffect(() => {
    if (video) {
      setPlaylist([video]);
      setCurrentIndex(0);
      log(`DEBUG: Playlist set with video: ${video.snippet?.title || "Unknown"}`);
    }
  }, [video]);

  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
      log(`DEBUG: Track ended, advancing to index ${currentIndex + 1}`);
    } else log("DEBUG: Playlist ended");
  };

  const currentTrack = playlist[currentIndex];
  const snippet = currentTrack?.snippet || {};
  const embedUrl = currentTrack?.id ? `https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&controls=1&playsinline=1` : "";

  return (
    <div style={{ paddingTop: "var(--header-height)", paddingBottom: "var(--footer-height)", minHeight: "100vh", background: "var(--app-bg)", color: "#fff" }}>
      <DebugOverlay pageName="Watch" />

      {loading && <Spinner message="Loading video…" />}

      {!loading && !currentTrack && <p style={{ padding: 16 }}>Video not found or unavailable.</p>}

      {!loading && currentTrack && (
        <>
          <h2>{snippet.title}</h2>
          <p style={{ opacity: 0.7 }}>by {snippet.channelTitle}</p>

          {embedUrl && <Player ref={playerRef} embedUrl={embedUrl} playing={true} onEnded={handleEnded} pipMode={false} draggable={false} trackTitle={snippet.title} />}

          {currentTrack.id && <RelatedVideos videoId={currentTrack.id} apiKey={API_KEY} onDebugLog={log} />}
        </>
      )}
    </div>
  );
}
