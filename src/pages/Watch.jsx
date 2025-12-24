// File: src/pages/Watch.jsx
// PCC v10.0 — Crash‑proof, ID‑safe, metadata‑safe Watch page

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";

export default function Watch() {
  const { id: rawId } = useParams();

  // ------------------------------------------------------------
  // SAFELY normalize the ID
  // ------------------------------------------------------------
  const cleanId =
    typeof rawId === "string" && rawId.trim().length > 0
      ? rawId.trim()
      : null;

  const log = (msg) => window.debugLog?.(`Watch(${cleanId}): ${msg}`);

  const playerCtx = usePlayer() || {};
  const { playVideo = () => {}, setRelatedList = () => {} } = playerCtx;

  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState("");

  // ------------------------------------------------------------
  // Fetch main video metadata
  // ------------------------------------------------------------
  useEffect(() => {
    if (!cleanId) {
      log("INVALID VIDEO ID");
      setError("Invalid video ID");
      return;
    }

    const key = window.__ytKey;
    if (!key) {
      log("Missing API key");
      setError("Missing API key");
      return;
    }

    const fetchVideo = async () => {
      try {
        log("Fetching video metadata…");

        const url =
          "https://www.googleapis.com/youtube/v3/videos" +
          `?part=snippet,contentDetails,statistics&id=${cleanId}` +
          `&key=${key}`;

        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          log(`Metadata fetch failed: ${res.status} ${text}`);
          setError("Metadata fetch failed");
          return;
        }

        const data = await res.json();
        const item = data.items?.[0];

        if (!item) {
          log("No metadata found — using fallback");
          setVideo({
            id: cleanId,
            title: "Unknown Video",
            author: "Unknown",
            description: "",
          });
          return;
        }

        const mapped = {
          id: cleanId,
          title: item.snippet?.title || "Untitled",
          author: item.snippet?.channelTitle || "Unknown",
          description: item.snippet?.description || "",
        };

        log("Metadata loaded");
        setVideo(mapped);
      } catch (err) {
        log(`Exception: ${err.message}`);
        setError("Network error");
      }
    };

    fetchVideo();
  }, [cleanId]);

  // ------------------------------------------------------------
  // Fetch related videos
  // ------------------------------------------------------------
  useEffect(() => {
    if (!cleanId) return;

    const key = window.__ytKey;
    if (!key) return;

    const fetchRelated = async () => {
      try {
        log("Fetching related videos…");

        const url =
          "https://www.googleapis.com/youtube/v3/search" +
          `?part=snippet&type=video&maxResults=20&relatedToVideoId=${cleanId}` +
          `&key=${key}`;

        const res = await fetch(url);
        if (!res.ok) {
          log("Related fetch failed");
          return;
        }

        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];

        const mapped = items.map((item) => ({
          id: item.id?.videoId || null,
          title: item.snippet?.title || "",
          author: item.snippet?.channelTitle || "",
          thumbnail:
            item.snippet?.thumbnails?.medium?.url ||
            item.snippet?.thumbnails?.default?.url ||
            "",
        }));

        log(`Loaded ${mapped.length} related videos`);
        setRelated(mapped);
        setRelatedList(mapped);
      } catch (err) {
        log(`Related exception: ${err.message}`);
      }
    };

    fetchRelated();
  }, [cleanId]);

  // ------------------------------------------------------------
  // Auto‑play when metadata is ready
  // ------------------------------------------------------------
  useEffect(() => {
    if (!cleanId) return;
    if (!video) return;

    log("Calling playVideo()");
    playVideo(video);
  }, [video]);

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  if (!cleanId) {
    return (
      <div style={{ padding: 20, color: "#fff" }}>
        INVALID VIDEO ID
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: "#fff" }}>
        Error: {error}
      </div>
    );
  }

  if (!video) {
    return (
      <div style={{ padding: 20, color: "#fff" }}>
        Loading video…
      </div>
    );
  }

  return (
    <div style={{ padding: 16, color: "#fff" }}>
      <h2>{video.title}</h2>
      <div style={{ opacity: 0.7 }}>{video.author}</div>

      <div style={{ marginTop: 20 }}>
        <h3>Related Videos</h3>
        {related.map((v) => (
          <div
            key={v.id}
            onClick={() => (v.id ? playVideo(v) : null)}
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 16,
              cursor: "pointer",
            }}
          >
            <img
              src={v.thumbnail}
              alt=""
              style={{ width: 160, height: 90, borderRadius: 6 }}
            />
            <div>
              <div style={{ fontWeight: "bold" }}>{v.title}</div>
              <div style={{ opacity: 0.7 }}>{v.author}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
