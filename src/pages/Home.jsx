// File: src/pages/Home.jsx

import { useEffect, useState } from "react";
import Header from "../components/Header";
import VideoCard from "../components/VideoCard";
import Spinner from "../components/Spinner";
import { API_KEY } from "../config";

function extractVideoId(v) {
  if (!v) return null;
  if (v.id?.videoId) return v.id.videoId;
  if (typeof v.id === "string" && v.id.length > 5) return v.id;
  return null;
}

function getThumbnail(v, id) {
  if (v.snippet?.thumbnails?.high?.url) return v.snippet.thumbnails.high.url;
  if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
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
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(
          q.trim()
        )}&key=${API_KEY}`
      );
      const data = await res.json();
      setVideos(Array.isArray(data.items) ? data.items : []);
    } catch {
      setVideos([]);
    } finally {
      setLoadingSearch(false);
    }
  }

  useEffect(() => {
    (async () => {
      setLoadingTrending(true);
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=20&regionCode=US&key=${API_KEY}`
        );
        const data = await res.json();
        setTrending(Array.isArray(data.items) ? data.items : []);
      } finally {
        setLoadingTrending(false);
      }
    })();
  }, []);

  const list = videos.length > 0 ? videos : trending;

  return (
    <div>
      {(loadingSearch || loadingTrending) && (
        <Spinner message={loadingSearch ? "Searching…" : "Loading trending…"} />
      )}

      <Header onSearch={search} />

      {videos.length === 0 && !loadingTrending && list.length > 0 && (
        <h3 style={{ padding: "1rem", opacity: 0.8 }}>👀 Trending</h3>
      )}

      {/* 1x1 vertical list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {list.map((v, index) => {
          const id = extractVideoId(v);
          if (!id) return null;

          return (
            <VideoCard
              key={`${id}-${index}`}
              video={{
                id,
                title: v.snippet?.title || "Untitled",
                thumbnail: getThumbnail(v, id),
                author: v.snippet?.channelTitle || "Unknown",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
