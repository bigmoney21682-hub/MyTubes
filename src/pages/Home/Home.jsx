/**
 * File: Home.jsx
 * Path: src/pages/Home/Home.jsx
 * Description: Trending page with fully safe destructuring for all API shapes.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../player/PlayerContext.jsx";
import { debugBus } from "../../debug/debugBus.js";

const API_KEY = import.meta.env.VITE_YT_API_KEY;

export default function Home() {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();
  const { loadVideo, queueAdd } = usePlayer();

  useEffect(() => {
    fetchTrending();
  }, []);

  async function fetchTrending() {
    try {
      debugBus.player("Home.jsx → Fetching trending videos");

      const url =
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,statistics&chart=mostPopular&maxResults=25&regionCode=US&key=${API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      setVideos(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      debugBus.player("Home.jsx → fetchTrending error: " + err?.message);
    }
  }

  function openVideo(id) {
    if (!id) return;
    debugBus.player("Home.jsx → Navigate to /watch/" + id);
    navigate(`/watch/${id}`);
    loadVideo(id);
  }

  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      <h2 style={{ marginBottom: "16px" }}>Trending</h2>

      {videos.map((item, i) => {
        const vid =
          item?.id?.videoId ??
          item?.id ??
          null;

        const sn = item?.snippet ?? {};
        const thumb = sn?.thumbnails?.medium?.url ?? "";

        if (!vid) return null;

        return (
          <div
            key={vid + "_" + i}
            style={{
              display: "flex",
              marginBottom: "16px",
              cursor: "pointer"
            }}
          >
            <img
              src={thumb}
              alt=""
              onClick={() => openVideo(vid)}
              style={{
                width: "168px",
                height: "94px",
                objectFit: "cover",
                borderRadius: "4px",
                marginRight: "12px"
              }}
            />

            <div style={{ flex: 1 }}>
              <div
                onClick={() => openVideo(vid)}
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  marginBottom: "4px"
                }}
              >
                {sn.title ?? "Untitled"}
              </div>

              <div style={{ fontSize: "13px", opacity: 0.7 }}>
                {sn.channelTitle ?? "Unknown Channel"}
              </div>

              <button
                onClick={() => queueAdd(vid)}
                style={{
                  marginTop: "8px",
                  padding: "6px 10px",
                  background: "#222",
                  color: "#fff",
                  border: "1px solid #444",
                  borderRadius: "4px"
                }}
              >
                + Queue
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
