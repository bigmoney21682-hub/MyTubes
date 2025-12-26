// File: src/pages/Home.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchTrending() {
    setLoading(true);

    try {
      // PIPED
      const piped = await fetch("https://pipedapi.kavin.rocks/trending");
      if (piped.ok) {
        const data = await piped.json();
        window.debugApi("/piped/trending", "PIPED");
        setVideos(
          data.map((v) => ({
            id: v.url.split("v=")[1],
            title: v.title,
            channel: v.uploaderName,
            thumbnail: v.thumbnail,
          }))
        );
        setLoading(false);
        return;
      }
    } catch {}

    try {
      // INVIDIOUS
      const inv = await fetch("https://yewtu.be/api/v1/trending");
      if (inv.ok) {
        const data = await inv.json();
        window.debugApi("/invidious/trending", "INVIDIOUS");
        setVideos(
          data.map((v) => ({
            id: v.videoId,
            title: v.title,
            channel: v.author,
            thumbnail: v.videoThumbnails?.[0]?.url,
          }))
        );
        setLoading(false);
        return;
      }
    } catch {}

    try {
      // YOUTUBE DATA API
      const key = import.meta.env.VITE_YT_API_PRIMARY;
      const yt = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=25&key=${key}`
      );
      const data = await yt.json();
      window.debugApi("/youtube/trending", key);

      setVideos(
        data.items.map((v) => ({
          id: v.id,
          title: v.snippet.title,
          channel: v.snippet.channelTitle,
          thumbnail: v.snippet.thumbnails.medium.url,
        }))
      );
    } catch {}

    setLoading(false);
  }

  useEffect(() => {
    fetchTrending();
  }, []);

  return (
    <div style={{ paddingTop: 68, paddingBottom: 68 }}>
      {loading && <div style={{ color: "#fff", padding: 16 }}>Loading…</div>}

      {videos.map((v) => (
        <div
          key={v.id}
          onClick={() => navigate(`/watch?v=${v.id}`)}
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: 16,
            cursor: "pointer",
          }}
        >
          <img
            src={v.thumbnail}
            style={{ width: "100%", borderRadius: 8 }}
            alt=""
          />

          <div style={{ padding: "8px 4px" }}>
            <div
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {v.title}
            </div>
            <div style={{ color: "#aaa", fontSize: 14 }}>{v.channel}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
