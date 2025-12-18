// src/pages/Watch.jsx

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Player from "../components/Player";
import VideoCard from "../components/VideoCard";
import Spinner from "../components/Spinner";
import { API_BASE } from "../config";

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [hlsUrl, setHlsUrl] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/streams/${id}`);
        if (!res.ok) throw new Error("Video unavailable");

        const data = await res.json();
        setVideo(data);

        // CRITICAL FIX: Prepend backend base to relative HLS path
        if (data.hls) {
          setHlsUrl(`${API_BASE}${data.hls}`);
        } else {
          throw new Error("No HLS stream available");
        }

        setRelated((data.relatedStreams || []).filter(s => s.type === "stream"));
      } catch (err) {
        setError(err.message || "Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const playNext = () => {
    if (related.length > 0) {
      const nextId = related[0].url.split("v=")[1];
      navigate(`/watch/${nextId}`);
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {loading && <Spinner message="Loading video…" />}

      {error && <div style={{ padding: "2rem", textAlign: "center", color: "#ff4444" }}>⚠️ {error}</div>}

      {hlsUrl && (
        <>
          <Player src={hlsUrl} onEnded={playNext} />

          {video && (
            <div style={{ padding: "12px 16px", background: "#000", color: "#fff" }}>
              <h2 style={{ margin: "8px 0", fontSize: "1.3rem" }}>{video.title}</h2>
              <p style={{ margin: 0, opacity: 0.8 }}>{video.uploaderName} • {video.views} views</p>
            </div>
          )}
        </>
      )}

      {related.length > 0 && (
        <div style={{ padding: "0 12px 80px" }}>
          <h3 style={{ padding: "12px", margin: "24px 0 12px" }}>Up Next</h3>
          {related.map(v => (
            <VideoCard
              key={v.url.split("v=")[1]}
              video={{
                id: v.url.split("v=")[1],
                title: v.title,
                thumbnail: v.thumbnail,
                author: v.uploaderName,
                views: v.views,
                duration: v.duration,
              }}
              onClick={() => navigate(`/watch/${v.url.split("v=")[1]}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
