// File: src/pages/Home.jsx
import { useEffect, useState } from "react";
import { fetchTrendingVideos } from "../api/youtube";
import VideoCard from "../components/VideoCard";

export default function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchTrendingVideos().then(setVideos);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  );
}
