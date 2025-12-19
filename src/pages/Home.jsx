import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://mytube-python-backend.onrender.com/trending");
        const data = await res.json();
        setVideos(data);
      } catch (err) {
        console.error("Error fetching trending videos:", err);
      }
    })();
  }, []);

  const formatViews = (views) => {
    if (views >= 1e9) return (views / 1e9).toFixed(1) + "B views";
    if (views >= 1e6) return (views / 1e6).toFixed(1) + "M views";
    if (views >= 1e3) return (views / 1e3).toFixed(1) + "K views";
    return views + " views";
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="trending-container">
      {videos.map((video) => (
        <Link
          to={`/watch/${video.id}`}
          key={video.id}
          className="video-card"
        >
          <img
            src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
            alt={video.title}
          />
          <div className="video-info">
            <h4>{video.title}</h4>
            <p>{video.uploaderName}</p>
            <p>{formatViews(video.views)} • {formatDuration(video.duration)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
