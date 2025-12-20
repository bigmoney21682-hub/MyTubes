// File: src/components/RelatedVideos.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function RelatedVideos({ videoId, apiKey }) {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoId || !apiKey) return;

    const fetchRelated = async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=5&key=${apiKey}`
        );
        const data = await res.json();

        if (data.error) {
          setError(data.error.message);
          return;
        }

        const validVideos = (data.items || []).filter(
          (item) => item.id?.videoId
        );

        setVideos(validVideos);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRelated();
  }, [videoId, apiKey]);

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
