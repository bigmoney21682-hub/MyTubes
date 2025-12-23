// File: src/components/RelatedVideos.jsx
// PCC v4.0 — Piped → Invidious → YouTube keyword fallback (GitHub Pages safe)

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PIPED_BASE = "https://pipedapi.kavin.rocks";
const INVIDIOUS_BASE = "https://yewtu.be";

export default function RelatedVideos({ videoId, title, onDebugLog }) {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  const log = (msg) => {
    if (typeof onDebugLog === "function") onDebugLog(msg);
    else window.debugLog?.(msg);
  };

  useEffect(() => {
    const cleanId = String(videoId || "").trim();
    if (!cleanId) {
      log("RelatedVideos aborted: empty videoId");
      return;
    }

    async function load() {
      setError(null);
      setVideos([]);

      // -----------------------------------------
      // 1. Try Piped
      // -----------------------------------------
      try {
        const url = `${PIPED_BASE}/related/${cleanId}`;
        log(`RelatedVideos: Trying Piped → ${url}`);

        const res = await fetch(url);
        const data = await res.json();

        if (Array.isArray(data)) {
          const mapped = data
            .filter((v) => v?.url)
            .map((v) => ({
              id: v.url.replace("/watch?v=", ""),
              title: v.title,
              thumbnail: v.thumbnail,
            }));

          if (mapped.length > 0) {
            log(`RelatedVideos: Loaded ${mapped.length} from Piped`);
            setVideos(mapped);
            return;
          }
        }
      } catch (err) {
        log(`RelatedVideos: Piped failed → ${err}`);
      }

      // -----------------------------------------
      // 2. Try Invidious
      // -----------------------------------------
      try {
        const url = `${INVIDIOUS_BASE}/api/v1/related/${cleanId}`;
        log(`RelatedVideos: Trying Invidious → ${url}`);

        const res = await fetch(url);
        const data = await res.json();

        if (Array.isArray(data)) {
          const mapped = data
            .filter((v) => v?.videoId)
            .map((v) => ({
              id: v.videoId,
              title: v.title,
              thumbnail: v.videoThumbnails?.[0]?.url,
            }));

          if (mapped.length > 0) {
            log(`RelatedVideos: Loaded ${mapped.length} from Invidious`);
            setVideos(mapped);
            return;
          }
        }
      } catch (err) {
        log(`RelatedVideos: Invidious failed → ${err}`);
      }

      // -----------------------------------------
      // 3. YouTube API keyword fallback
      // -----------------------------------------
      const apiKey = window.YT_API_KEY; // <-- GitHub Pages safe

      if (!apiKey || !title) {
        log("RelatedVideos: Skipping YouTube fallback (missing apiKey or title)");
        return;
      }

      try {
        const query = encodeURIComponent(title);
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${query}&key=${apiKey}`;

        log(`RelatedVideos: YouTube fallback → ${url}`);

        const res = await fetch(url);
        const data = await res.json();

        if (data.items) {
          const mapped = data.items
            .filter((v) => v.id?.videoId)
            .map((v) => ({
              id: v.id.videoId,
              title: v.snippet.title,
              thumbnail: v.snippet.thumbnails.default.url,
            }));

          log(`RelatedVideos: Loaded ${mapped.length} from YouTube fallback`);
          setVideos(mapped);
        }
      } catch (err) {
        log(`RelatedVideos: YouTube fallback failed → ${err}`);
        setError(err.message);
      }
    }

    load();
  }, [videoId, title]);

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
          onClick={() => log(`RelatedVideos: clicked → ${v.title}`)}
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
