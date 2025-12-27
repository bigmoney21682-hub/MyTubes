/**
 * File: Home.jsx
 * Path: src/pages/Home/Home.jsx
 * Description: Home page showing trending videos with API quota logging.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTrendingVideos } from "../../api/youtube";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.bootDebug?.home("Fetching trending…");

    fetchTrendingVideos().then((items) => {
      setVideos(items);
      window.bootDebug?.home(`Trending loaded: ${items.length}`);
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: "#fff" }}>Trending</h2>

      {videos.map((v) => (
        <div
          key={v.id}
          style={{
            display: "flex",
            marginBottom: 12,
            cursor: "pointer",
            color: "#fff",
          }}
          onClick={() => navigate(`/watch/${v.id}`)}
        >
          <img
            src={v.thumbnail}
            style={{ width: 160, height: 90, borderRadius: 6 }}
          />
          <div style={{ marginLeft: 12 }}>
            <div>{v.title}</div>
            <div style={{ opacity: 0.6, fontSize: 12 }}>{v.channel}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
