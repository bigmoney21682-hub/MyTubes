// src/pages/Home.jsx

import { useEffect, useState } from "react";
import Header from "../components/Header";
import VideoCard from "../components/VideoCard";
import Spinner from "../components/Spinner";
import { API_BASE } from "../config";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);

  // -----------------------------
  // SEARCH
  // -----------------------------
  async function search(q) {
    if (!q.trim()) return;

    setLoadingSearch(true);
    setVideos([]);

    try {
      const res = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(q.trim())}&filter=videos`
      );
      const data = await res.json();

      // Piped returns { items: [...] }
      setVideos(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("Search failed:", err);
      setVideos([]);
    } finally {
      setLoadingSearch(false);
    }
  }

  // -----------------------------
  // TRENDING
  // -----------------------------
  useEffect(() => {
    (async () => {
      setLoadingTrending(true);
      try {
        const res = await fetch(`${API_BASE}/trending?region=US`);
        const data = await res.json();

        // Piped trending is already an array
        setTrending(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Trending failed:", err);
        setTrending([]);
      } finally {
        setLoadingTrending(false);
      }
    })();
  }, []);

  // Prefer search results, fallback to trending
  const list = videos.length > 0 ? videos : trending;

  return (
    <div>
      {(loadingSearch || loadingTrending) && (
        <Spinner
          message={loadingSearch ? "Searching…" : "Loading trending…"}
        />
      )}

      <Header onSearch={search} />

      {videos.length === 0 && !loadingTrending && list.length > 0 && (
        <h3 style={{ padding: "1rem", opacity: 0.8 }}>👀 Trending</h3>
      )}

      <div className="grid">
        {list.map((v) => {
          /**
           * -----------------------------
           * VIDEO ID NORMALIZATION
           * -----------------------------
           * Piped may return:
           *  - v.id
           *  - v.url = https://youtube.com/watch?v=XXXX
           */
          const id =
            v.id ||
            (typeof v.url === "string"
              ? new URL(v.url).searchParams.get("v")
              : null);

          if (!id) return null; // Hard guard, prevents crashes

          return (
            <VideoCard
              key={id}
              video={{
                id,
                title: v.title || "Untitled",
                thumbnail: v.thumbnail || null, // let VideoCard normalize
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
        <p
          style={{
            textAlign: "center",
            padding: "3rem",
            opacity: 0.7,
          }}
        >
          No videos found.
        </p>
      )}
    </div>
  );
}
