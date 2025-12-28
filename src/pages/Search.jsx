/**
 * File: Search.jsx
 * Path: src/pages/Search.jsx
 * Description: Search results page with safe destructuring and shared API key.
 */

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePlayer } from "../player/PlayerContext.jsx";
import { debugBus } from "../debug/debugBus.js";
import { getApiKey } from "../api/getApiKey.js";

const API_KEY = getApiKey();

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";
  const navigate = useNavigate();

  const player = usePlayer() ?? {};
  const loadVideo = player.loadVideo ?? (() => {});
  const queueAdd = player.queueAdd ?? (() => {});

  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return;
    fetchResults(query);
  }, [query]);

  async function fetchResults(q) {
    try {
      debugBus.player("Search.jsx → Searching: " + q);

      const url =
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&maxResults=25&q=${encodeURIComponent(q)}&key=${API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      setResults(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      debugBus.player("Search.jsx → fetchResults error: " + (err?.message || err));
      setResults([]);
    }
  }

  function openVideo(id) {
    if (!id) return;
    navigate(`/watch/${id}`);
    loadVideo(id);
  }

  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      <h2>Search results for: {query}</h2>

      {results.map((item, i) => {
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
