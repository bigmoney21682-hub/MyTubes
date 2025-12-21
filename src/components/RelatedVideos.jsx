// File: src/components/RelatedVideos.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function RelatedVideos({ videoId, apiKey }) {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoId || !apiKey) {
      console.warn("DEBUG: RelatedVideos skipped: missing videoId or apiKey");
      return;
    }

    const fetchRelated = async () => {
      console.log("DEBUG: Fetching related videos for:", videoId);

      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=5&key=${apiKey}`
        );
        const data = await res.json();

        console.log("DEBUG: Related videos API response:", data);

        if (data.error) {
          setError(data.error.message);
          console.error("DEBUG: RelatedVideos API error:", data.error.message);
          return;
        }

        const validVideos = (data.items || []).filter(
          (item) => item.id?.videoId
        );

        console.log("DEBUG: Filtered valid related videos:", validVideos);

        setVideos(validVideos);
        setError(null);
      } catch (err) {
        console.error("DEBUG: RelatedVideos fetch error:", err);
        setError(err.message);
      }
    };

    fetchRelated();
  }, [videoId, apiKey]);

  if (error)
    return (
      <p style={{ color: "red" }}>
        Error loading related videos: {error}
      </p>
    );

  if (!videos.length)
    return <p>DEBUG: RelatedVideos loading…</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      {videos.map((video) => (
        <Link
          key={video.id.videoId}
          to={`/watch/${video.id.videoId}`}
          style={{ color: "#fff" }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <img
              src={video.snippet.thumbnails.default.url}
              alt={video.snippet.title}
            />
            <span>{video.snippet.title}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
