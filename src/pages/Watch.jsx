// File: src/pages/Watch.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import RelatedVideos from "../components/RelatedVideos";
import Spinner from "../components/Spinner";
import Player from "../components/Player";
import { API_KEY } from "../config";

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const playerRef = useRef(null);

  const log = (msg) => window.debugLog?.(msg);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    log(`DEBUG: Fetching video metadata for id: ${id}`);

    (async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${API_KEY}`
        );
        const data = await res.json();

        if (data.items?.length) {
          setVideo(data.items[0]);
        } else {
          setVideo(null);
        }
      } catch (err) {
        log(`DEBUG: Video fetch error: ${err}`);
        setVideo(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const videoUrl = video?.id
    ? `https://www.youtube.com/watch?v=${video.id}`
    : "";

  return (
    <div
      style={{
        paddingTop: "var(--header-height)",
        paddingBottom: "var(--footer-height)",
        minHeight: "100vh",
        background: "var(--app-bg)",
        color: "#fff",
      }}
    >
      <Header />

      {loading && <Spinner message="Loading video…" />}

      {!loading && !video && <p>Video unavailable.</p>}

      {!loading && video && (
        <>
          <h2>{video.snippet.title}</h2>
          <p style={{ opacity: 0.7 }}>{video.snippet.channelTitle}</p>

          <Player
            ref={playerRef}
            embedUrl={videoUrl}
            playing={true}
            controls
          />

          <RelatedVideos
            videoId={video.id}
            apiKey={API_KEY}
            onDebugLog={log}
          />
        </>
      )}
    </div>
  );
}
