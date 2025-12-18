import { useEffect, useState } from "react";
import Header from "../components/Header";
import VideoCard from "../components/VideoCard";
import Spinner from "../components/Spinner";
import { API_BASE } from "../config";

/**
 * Normalize Piped thumbnails so they ALWAYS work on GitHub Pages
 */
function resolveThumbnail(video, id) {
  if (video.thumbnail) {
    // protocol-relative → force https
    if (video.thumbnail.startsWith("//")) {
      return "https:" + video.thumbnail;
    }

    // relative path → use YouTube CDN
    if (video.thumbnail.startsWith("/")) {
      return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    }

    // already valid
    return video.thumbnail;
  }

  // absolute fallback
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

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
        const res = await fetch(`${API_BASE}/trending?region=US`);
        const data = await res.json();
        setTrending(Array.isArray(data) ? data : []);
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
        {list.map((v, i) => {
          const id =
            v.videoId ||
            v.id ||
            v.url?.split("v=")[1] ||
            v.url?.split("/").pop();

          if (!id) return null;

          return (
            <VideoCard
              key={id + i}
              video={{
                id,
                title: v.title || "Untitled",
                thumbnail: resolveThumbnail(v, id),
                author: v.uploaderName || "Unknown",
                views: v.views,
                duration: v.duration > 0 ? v.duration : null,
              }}
            />
          );
        })}
      </div>

      {!loadingTrending && !loadingSearch && list.length === 0 && (
        <p style={{ textAlign: "center", padding: "4rem", opacity: 0.7 }}>
          No videos found.
        </p>
      )}
    </div>
  );
}
