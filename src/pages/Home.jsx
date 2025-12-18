import { useEffect, useState } from "react";
import Header from "../components/Header";
import VideoCard from "../components/VideoCard";
import Spinner from "../components/Spinner";
import { API_BASE } from "../config";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

  async function search(q) {
    if (!q.trim()) return;

    setLoadingSearch(true);
    setVideos([]);

    try {
      const res = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(q.trim())}&filter=videos`
      );
      const data = await res.json();
      setVideos(data.items || []);
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
        const res = await fetch(`${API_BASE}/trending?region=US`);
        const data = await res.json();
        setTrending(data || []);
      } catch {
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

      <Header onSearch={search} />

      {videos.length === 0 && !loadingTrending && (
        <h3 style={{ padding: "1rem", opacity: 0.8 }}>👀 Trending</h3>
      )}

      <div className="grid">
        {list
          .filter(v => v && v.id && v.title)
          .map(v => (
            <VideoCard
              key={v.id}
              video={{
                id: v.id,
                title: v.title,
                thumbnail:
                  v.thumbnail ||
                  v.thumbnails?.[v.thumbnails.length - 1]?.url ||
                  null,
                author: v.uploaderName || v.uploader,
                views: v.views,
                duration: v.duration > 0 ? v.duration : null,
              }}
            />
          ))}
      </div>

      {!loadingTrending && !loadingSearch && list.length === 0 && (
        <p
          style={{
            textAlign: "center",
            padding: "4rem",
            opacity: 0.7,
          }}
        >
          No videos found.
        </p>
      )}
    </div>
  );
}
