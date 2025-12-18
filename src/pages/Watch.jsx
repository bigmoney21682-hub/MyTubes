// src/pages/Watch.jsx

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Player from "../components/Player";
import VideoCard from "../components/VideoCard";
import Spinner from "../components/Spinner"; // Our orange spinning wheel
import { API_BASE } from "../config";

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [stream, setStream] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Controls full-screen spinner

  const videoRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const fetchVideoData = async () => {
      // Reset everything and show spinner
      setVideo(null);
      setStream(null);
      setRelated([]);
      setError(null);
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE}/video?id=${id}`);
        if (!res.ok) throw new Error("Video unavailable");

        const data = await res.json();
        if (cancelled) return;

        setVideo(data);

        // Find best combined mp4 stream (video + audio)
        const playable = data.formats
          .filter(
            f =>
              f.url &&
              f.ext === "mp4" &&
              f.vcodec !== "none" &&
              f.acodec !== "none" &&
              !f.is_dash
          )
          .sort((a, b) => (b.height || 0) - (a.height || 0));

        if (playable.length === 0) throw new Error("No playable stream found");

        setStream(playable[0].url);

        // Fetch related videos
        const rel = await fetch(`${API_BASE}/related?id=${id}`);
        if (rel.ok) {
          const relData = await rel.json();
          if (!cancelled) {
            setRelated(relData.filter(v => v?.id));
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load video");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchVideoData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Skip controls
  const skipBack10 = () => {
    if (videoRef.current) videoRef.current.currentTime -= 10;
  };

  const skipForward10 = () => {
    if (videoRef.current) videoRef.current.currentTime += 10;
  };

  // Play next related video
  const playNextRelated = () => {
    if (related.length > 0) {
      navigate(`/watch/${related[0].id}`);
    }
  };

  const playPreviousRelated = () => {
    // Placeholder – can be enhanced later
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Full-screen centered spinner while loading */}
      {loading && <Spinner message="Loading video…" />}

      {/* Error message */}
      {error && !loading && (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "#ff4444",
            fontSize: "1.2rem",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Player (only shown when stream is ready) */}
      {stream && !loading && (
        <div style={{ position: "sticky", top: 0, background: "#000", zIndex: 10 }}>
          <div style={{ position: "relative" }}>
            <Player ref={videoRef} src={stream} onEnded={playNextRelated} />

            {/* Bottom controls overlay */}
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                pointerEvents: "none", // Allows clicks to pass through to video
              }}
            >
              <button
                onClick={playPreviousRelated}
                disabled
                style={{ pointerEvents: "auto" }}
              >
                ⏮
              </button>

              <button onClick={skipBack10} style={{ pointerEvents: "auto" }}>
                ⏪ 10s
              </button>

              <button onClick={skipForward10} style={{ pointerEvents: "auto" }}>
                10s ⏩
              </button>

              <button
                onClick={playNextRelated}
                disabled={!related.length}
                style={{ pointerEvents: "auto" }}
              >
                ⏭
              </button>
            </div>
          </div>

          {/* Video title */}
          {video && (
            <div style={{ padding: "12px 16px", color: "#fff" }}>
              <h2 style={{ margin: "0 0 8px", fontSize: "1.3rem" }}>
                {video.title}
              </h2>
              <p style={{ margin: 0, opacity: 0.8 }}>
                {video.author} • {video.views || "Views"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Related videos */}
      {!loading && related.length > 0 && (
        <div style={{ padding: "0 12px 80px" }}>
          <h3 style={{ padding: "0 12px", margin: "24px 0 12px" }}>
            Up Next
          </h3>
          {related.map(v => (
            <VideoCard
              key={v.id}
              video={v}
              onClick={() => navigate(`/watch/${v.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
