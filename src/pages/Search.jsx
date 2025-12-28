/**
 * File: Search.jsx
 * Path: src/pages/Search.jsx
 * Description: YouTube Data API v3 search page.
 *              Normalized results, click-to-play, queue integration,
 *              and navigation to Watch page.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../player/PlayerContext.jsx";
import { debugBus } from "../debug/debugBus.js";

const API_KEY = import.meta.env.VITE_YT_API_KEY;

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const { loadVideo, queueAdd } = usePlayer();
  const navigate = useNavigate();

  async function performSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    debugBus.player("Search.jsx → Searching: " + query);

    try {
      const url =
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&maxResults=25&q=${encodeURIComponent(
          query
        )}&key=${API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.items) {
        setResults(data.items);
      }
    } catch (err) {
      debugBus.player("Search.jsx → Error: " + err?.message);
    }
  }

  function openVideo(id) {
    debugBus.player("Search.jsx → Navigate to /watch/" + id);
    navigate(`/watch/${id}`);
    loadVideo(id);
  }

  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      {/* Search bar */}
      <form onSubmit={performSearch} style={{ marginBottom: "16px" }}>
        <input
          type="text"
          value={query}
          placeholder="Search YouTube…"
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #444",
            background: "#111",
            color: "#fff",
            fontSize: "16px"
          }}
        />
      </form>

      {/* Results */}
      {results.map((item) => {
        const vid = item.id.videoId;
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
