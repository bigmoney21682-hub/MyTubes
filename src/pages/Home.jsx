// File: src/pages/Home.jsx

import { useEffect, useState } from "react";
import Header from "../components/Header";
import VideoCard from "../components/VideoCard";
import Spinner from "../components/Spinner";
import RelatedVideos from "../components/RelatedVideos";

export default function Home({ apiKey }) {
  const [videos, setVideos] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);

  /** Search YouTube via API key */
  async function search(q) {
    if (!q.trim()) return;

    setLoadingSearch(true);
    setVideos([]);

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(
          q.trim()
        )}&key=${apiKey}`
      );
      const data = await res.json();
      const items = data.items || [];
      setVideos(
        items.map((item) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          author: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.high.url,
        }))
      );
    } catch (err) {
      console.error("Search failed:", err);
      setVideos([]);
    } finally {
      setLoadingSearch(false);
    }
  }

  /** Fetch trending videos */
  useEffect(() => {
    (async () => {
      setLoadingTrending(true);
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=US&maxResults=20&key=${apiKey}`
        );
        const data = await res.json();
        const items = data.items || [];
        setTrending(
          items.map((item) => ({
            id: item.id,
            title: item.snippet.title,
            author: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.high.url,
          }))
        );
      } catch (err) {
        console.error("Trending fetch failed:", err);
        setTrending([]);
      } finally {
        setLoadingTrending(false);
      }
    })();
  }, [apiKey]);

  const list = videos.length > 0 ? videos : trending;

  return (
    <div>
      {(loadingSearch || loadingTrending) && (
        <Spinner
          message={loadingSearch ? "Searching…" : "Loading trending…"}
        />
      )}

      {/* Header with search bar */}
      <Header onSearch={search} />

      {/* Trending label */}
      {videos.length === 0 && !loadingTrending && list.length > 0 && (
        <h3 style={{ padding: "1rem", opacity: 0.8 }}>👀 Trending</h3>
      )}

      {/* Video grid */}
      <div className="grid">
        {list.map((v, index) => (
          <VideoCard key={`${v.id}-${index}`} video={v} />
        ))}
      </div>

      {!loadingSearch && !loadingTrending && list.length === 0 && (
        <p style={{ textAlign: "center", padding: "3rem", opacity: 0.7 }}>
          No videos found.
        </p>
      )}
    </div>
  );
}
