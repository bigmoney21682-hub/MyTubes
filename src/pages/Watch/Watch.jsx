/**
 * File: Watch.jsx
 * Path: src/pages/Watch/Watch.jsx
 * Description: Video watch page with full DebugOverlay v3 player event logging.
 */

import { useEffect, useState, useRef } from "react";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";

import { getVideoDetails, getRelatedVideos } from "../../api/youtube";

export default function Watch() {
  const { id } = useParams();

  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const playerRef = useRef(null);

  // Helper to log player events
  const log = (msg, data = {}) => {
    window.bootDebug?.player(msg, data);
  };

  // Load video + related
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      log("load:start", { id });

      try {
        const details = await getVideoDetails(id);
        const relatedVideos = await getRelatedVideos(id);

        if (!mounted) return;

        setVideo(details?.items?.[0] || null);
        setRelated(relatedVideos?.items || []);

        log("load:success", {
          title: details?.items?.[0]?.snippet?.title,
          relatedCount: relatedVideos?.items?.length
        });
      } catch (err) {
        log("load:error", { error: err.message });
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Player event handlers
  const handlePlay = () => {
    const t = playerRef.current?.getCurrentTime?.() || 0;
    log("onPlay", { position: t });
  };

  const handlePause = () => {
    const t = playerRef.current?.getCurrentTime?.() || 0;
    log("onPause", { position: t });
  };

  const handleBuffer = () => {
    const t = playerRef.current?.getCurrentTime?.() || 0;
    log("onBuffer", { position: t });
  };

  const handleSeek = (seconds) => {
    const t = playerRef.current?.getCurrentTime?.() || 0;
    log("onSeek", { from: t, to: seconds });
  };

  const handleEnded = () => {
    log("onEnded");
  };

  const handleError = (e) => {
    log("onError", { error: e?.message || "Unknown error" });
  };

  if (loading) {
    return (
      <div style={{ padding: 20, color: "#ccc" }}>
        Loading video…
      </div>
    );
  }

  if (!video) {
    return (
      <div style={{ padding: 20, color: "#ccc" }}>
        Video not found.
      </div>
    );
  }

  const videoUrl = `https://www.youtube.com/watch?v=${id}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        padding: 20,
        color: "#fff"
      }}
    >
      {/* Player */}
      <div style={{ width: "100%", maxWidth: 900 }}>
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          controls
          playing={false}
          width="100%"
          height="500px"
          onPlay={handlePlay}
          onPause={handlePause}
          onBuffer={handleBuffer}
          onSeek={handleSeek}
          onEnded={handleEnded}
          onError={handleError}
        />
      </div>

      {/* Title */}
      <h2 style={{ margin: 0 }}>
        {video.snippet?.title}
      </h2>

      {/* Description */}
      <div style={{ opacity: 0.8, whiteSpace: "pre-wrap" }}>
        {video.snippet?.description}
      </div>

      {/* Related videos */}
      <div style={{ marginTop: 20 }}>
        <h3>Related Videos</h3>

        {related.length === 0 && (
          <div style={{ opacity: 0.6 }}>No related videos found.</div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 10
          }}
        >
          {related.map((item) => (
            <a
              key={item.id.videoId}
              href={`/watch/${item.id.videoId}`}
              style={{
                color: "#4ea3ff",
                textDecoration: "none",
                fontSize: 14
              }}
            >
              {item.snippet?.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
