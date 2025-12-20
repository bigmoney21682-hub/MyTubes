// File: src/pages/Home.jsx
import { useEffect, useState } from "react";
import Header from "../components/Header";
import VideoCard from "../components/VideoCard";
import Spinner from "../components/Spinner";
import { API_KEY } from "../config";

export default function Home({ bootSplashReady }) {
  const [videos, setVideos] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Only fetch trending AFTER bootSplashReady
  useEffect(() => {
    if (!bootSplashReady) return;

    setLoadingTrending(true);
    (async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=20&regionCode=US&key=${API_KEY}`
        );
        const data = await res.json();
        setTrending(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        console.error("Trending fetch failed:", err);
        setTrending([]);
      } finally {
        setLoadingTrending(false);
      }
    })();
  }, [bootSplashReady]);

  const list = videos.length > 0 ? videos : trending;

  if (!bootSplashReady) return null; // Prevent any render until BootSplash finishes

  return (
    <div>
      {(loadingSearch || loadingTrending) && <Spinner message="Loading…" />}

      <Header onSearch={() => {}} />

      <div className="grid">
        {list.map((v, idx) => (
          <VideoCard
            key={v.id || idx}
            video={{
              id: v.id,
              title: v.snippet?.title || "Untitled",
              thumbnail: v.snippet?.thumbnails?.high?.url || "",
              author: v.snippet?.channelTitle || "Unknown",
            }}
          />
        ))}
      </div>
    </div>
  );
}
