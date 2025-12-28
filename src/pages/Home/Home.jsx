/**
 * File: Home.jsx
 * Path: src/pages/Home/Home.jsx
 * Description: App homepage showing trending videos using YouTube Data API v3.
 *              Fully wired to PlayerContext + GlobalPlayer.
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

  // ------------------------------------------------------------
  // Fetch trending videos on mount
  // ------------------------------------------------------------
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

      if (data.items) {
        setVideos(data.items);
      }
    } catch (err) {
      debugBus.player("Home.jsx → fetchTrending error: " + err?.message);
    }
  }

  function openVideo(id) {
    debugBus.player("Home.jsx → Navigate to /watch/" + id);
    navigate(`/watch/${id}`);
    loadVideo(id);
  }

  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      <h2 style={{ marginBottom: "16px" }}>Trending</h2>

      {videos.map((item) => {
        const vid = item.id;
        const sn = item.snippet;

        return (
          <div
            key={vid}
            style={{
              display: "flex",
              marginBottom: "16px",
              cursor: "pointer"
            }}
          >
            <img
              src={sn.thumbnails.medium.url}
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
                {sn.title}
              </div>

              <div style={{ fontSize: "13px", opacity: 0.7 }}>
                {sn.channelTitle}
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
