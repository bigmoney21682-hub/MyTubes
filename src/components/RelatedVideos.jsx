// File: src/components/RelatedVideos.jsx
// PCC v6.0 — YouTube API only + in-memory caching + autonext feed

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCached, setCached } from "../utils/youtubeCache";

export default function RelatedVideos({
  videoId,
  title,
  onDebugLog,
  onLoaded,
}) {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  const log = (msg) => {
    if (typeof onDebugLog === "function") onDebugLog(msg);
    else window.debugLog?.(`RelatedVideos: ${msg}`);
  };

  useEffect(() => {
    const cleanId = String(videoId || "").trim();
    const apiKey = window.YT_API_KEY;

    if (!cleanId) {
      log("RelatedVideos aborted: empty videoId");
      return;
    }

    if (!apiKey) {
      log("RelatedVideos aborted: missing YT_API_KEY");
      return;
    }

    async function load() {
      setError(null);
      setVideos([]);

      const cacheKey = `related_${cleanId}`;
      const cached = getCached(cacheKey);

      if (cached) {
        log("Using cached related videos");
        setVideos(cached);
        onLoaded?.(cached);
        return;
      }

      // -----------------------------------------
      // 1. Try relatedToVideoId
      // -----------------------------------------
      try {
        const url =
          "https://www.googleapis.com/youtube/v3/search" +
          `?part=snippet&type=video&maxResults=10&relatedToVideoId=${encodeURIComponent(
            cleanId
          )}&key=${apiKey}`;

        log(`Trying YouTube relatedToVideoId → ${url}`);

        const res = await fetch(url);
        const data = await res.json();

        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          const mapped = data.items
            .filter((v) => v.id?.videoId)
            .map((v) => ({
              id: v.id.videoId,
              title: v.snippet.title,
              thumbnail:
                v.snippet.thumbnails?.default?.url ||
                v.snippet.thumbnails?.medium?.url ||
                v.snippet.thumbnails?.high?.url,
            }));

          if (mapped.length > 0) {
            setCached(cacheKey, mapped);
            setVideos(mapped);
            onLoaded?.(mapped);
            log(`Applied ${mapped.length} items from YouTube relatedToVideoId`);
            return;
          }
        }
      } catch (err) {
        log(`YouTube relatedToVideoId failed → ${err}`);
      }

      // -----------------------------------------
      // 2. Fallback: keyword search by title
      // -----------------------------------------
      if (!title) {
        log("Skipping title-based fallback (no title provided)");
        return;
      }

      try {
        const query = encodeURIComponent(title);
        const url =
          "https://www.googleapis.com/youtube/v3/search" +
          `?part=snippet&type=video&maxResults=10&q=${query}&key=${apiKey}`;

        log(`YouTube fallback by title → ${url}`);

        const res = await fetch(url);
        const data = await res.json();

        if (data.items && Array.isArray(data.items)) {
          const mapped = data.items
            .filter((v) => v.id?.videoId)
            .map((v) => ({
              id: v.id.videoId,
              title: v.snippet.title,
              thumbnail:
                v.snippet.thumbnails?.default?.url ||
                v.snippet.thumbnails?.medium?.url ||
                v.snippet.thumbnails?.high?.url,
            }));

          setCached(cacheKey, mapped);
          setVideos(mapped);
          onLoaded?.(mapped);
          log(`Applied ${mapped.length} items from YouTube title fallback`);
        }
      } catch (err) {
        log(`YouTube fallback failed → ${err}`);
        setError(err.message);
      }
    }

    load();
  }, [videoId, title, onLoaded]);

  if (error)
    return (
      <p style={{ color: "red", padding: 8 }}>
        Error loading related videos: {error}
      </p>
    );

  if (!videos.length)
    return <p style={{ padding: 8 }}>Loading related…</p>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "12px",
        maxHeight: "300px",
        overflowY: "auto",
        borderTop: "1px solid #222",
      }}
    >
      {videos.map((v, index) => (
        <Link
          key={v.id || index}
          to={`/watch/${v.id}`}
          style={{ color: "#fff", textDecoration: "none" }}
          onClick={() => log(`clicked → ${v.title}`)}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <img
              src={v.thumbnail}
              alt={v.title}
              width={80}
              height={45}
              style={{ borderRadius: 4 }}
            />
            <span>{v.title}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
