// File: src/pages/Home.jsx

import { useEffect, useState } from "react";
import Header from "../components/Header";
import VideoCard from "../components/VideoCard";
import Spinner from "../components/Spinner";
import { API_BASE } from "../config";

/**
 * Safely extract a YouTube video ID from backend objects
 */
function extractVideoId(v) {
  if (!v) return null;

  if (typeof v.id === "string" && v.id.length > 5) {
    return v.id;
  }

  if (typeof v.url === "string") {
    const match = v.url.match(/[?&]v=([^&]+)/);
    if (match) return match[1];
  }

  return null;
}

/**
 * Build a thumbnail URL.
 * Prefer backend-provided thumbnail.
 * Fallback to YouTube CDN.
 */
function getThumbnail(v, id) {
  if (typeof v.thumbnail === "string" && v.thumbnail.length > 0) {
    return v.thumbnail;
  }

  if (id) {
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }

  return null;
}

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);

  async function search(q) {
    if (!q.trim()) return;

    setLoadingSearch(true);
    setVideos([]);

    try {
      const res = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(q.trim())}&filter=videos`
      );
      const data = await res.json();
      setVideos(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("Search failed:", err);
      setVideos([]);
    } finally {
      setLoadingSearch(false);
    }
  }

  useEffect(() => {
    (async () => {
      setLoadingTrending(true);
      try {
        const res = await fetch(`${API_BASE}/trending?region=US`);
        const data = await res.json();
        setTrending(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Trending failed:", err);
        setTrending([]);
      } finally {
        setLoadingTrending(false);
      }
    })();
  }, []);

  const list = videos.length > 0 ? videos : trending;

  return (
    <div>
      {(loadingSearch || loadingTrending) && (
        <Spinner
          message={loadingSearch ? "Searching…" : "Loading trending…"}
        />
      )}

      {/* ✅ Header / Search / Banner */}
      <Header onSearch={search} />

      {/* ✅ Trending label */}
      {videos.length === 0 && !loadingTrending && list.length > 0 && (
        <h3 style={{ padding: "1rem", opacity: 0.8 }}>👀 Trending</h3>
      )}

      <div className="grid">
        {list.map((v, index) => {
          const id = extractVideoId(v);
          if (!id) return null;

          return (
            <VideoCard
              key={`${id}-${index}`}
              video={{
                id,
                title: v.title || "Untitled",
                thumbnail: getThumbnail(v, id),
                author: v.uploaderName || v.author || "Unknown",
                views: v.views,
                duration:
                  typeof v.duration === "number" && v.duration > 0
                    ? v.duration
                    : null,
              }}
            />
          );
        })}
      </div>

      {!loadingSearch && !loadingTrending && list.length === 0 && (
        <p style={{ textAlign: "center", padding: "3rem", opacity: 0.7 }}>
          No videos found.
        </p>
      )}
    </div>
  );
}
