// File: src/components/RelatedVideos.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function RelatedVideos({ videoId, apiKey, debug = false }) {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoId || !apiKey) return;

    const fetchRelated = async () => {
      try {
        if (debug) console.log("DEBUG: Fetching related videos for:", videoId);

        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=5&key=${apiKey}`
        );
        const data = await res.json();

        if (debug) console.log("DEBUG: Related videos response:", data);

        if (data.error) {
          setError(data.error.message);
          return;
        }

        const validVideos = (data.items || []).filter(
          (item) => item.id?.videoId
        );

        setVideos(validVideos);
        setError(null);

        if (debug) console.log("DEBUG: Valid related videos:", validVideos);
      } catch (err) {
        setError(err.message);
        if (debug) console.error("DEBUG: Related videos fetch error:", err);
      }
    };

    fetchRelated();
  }, [videoId, apiKey, debug]);

  if (error) return <p style={{ color: "red" }}>Error loading related videos: {error}</p>;
  if (!videos.length) return <p>Loading...</p>;

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
