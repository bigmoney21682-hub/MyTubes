// File: src/components/RelatedVideos.jsx
// PCC v1.1 — Extra debug logging for error, safe videoId handling

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function RelatedVideos({ videoId, apiKey, onDebugLog }) {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  const log = (msg) => {
    if (typeof onDebugLog === "function") onDebugLog(msg);
    else window.debugLog?.(msg);
  };

  useEffect(() => {
    const cleanId = String(videoId || "").trim();
    if (!cleanId || !apiKey) {
      if (!cleanId) log("DEBUG: RelatedVideos aborted: empty videoId");
      if (!apiKey) log("DEBUG: RelatedVideos aborted: missing apiKey");
      return;
    }

    const fetchRelated = async () => {
      log(`DEBUG: Fetching related videos for id: ${cleanId}`);

      try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${encodeURIComponent(
          cleanId
        )}&type=video&maxResults=5&key=${apiKey}`;

        log(`DEBUG: RelatedVideos request URL: ${url}`);

        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
          setError(data.error.message);
          log(
            `DEBUG: Related fetch error: ${data.error.message} (code: ${data.error.code})`
          );
          log(`DEBUG: Related fetch full error: ${JSON.stringify(data.error)}`);
          return;
        }

        const validVideos = (data.items || []).filter((item) => item.id?.videoId);
        setVideos(validVideos);
        log(`DEBUG: Related videos fetched: ${validVideos.length} items`);
        setError(null);
      } catch (err) {
        setError(err.message);
        log(`DEBUG: Related fetch exception: ${err}`);
      }
    };

    fetchRelated();
  }, [videoId, apiKey]);

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
      {videos.map((video, index) => (
        <Link
          key={video.id.videoId || index}
          to={`/watch/${video.id.videoId}`}
          style={{ color: "#fff", textDecoration: "none" }}
          onClick={() =>
            log(`DEBUG: Related video clicked: ${video.snippet.title}`)
          }
        >
          <div
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            <img
              src={video.snippet.thumbnails.default.url}
              alt={video.snippet.title}
              width={80}
              height={45}
            />
            <span>{video.snippet.title}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
