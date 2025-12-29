/**
 * File: Search.jsx
 * Path: src/pages/Search.jsx
 * Description: Search results page using YouTube Data API.
 */

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { debugBus } from "../debug/debugBus.js";
import { getApiKey } from "../api/getApiKey.js";

const API_KEY = getApiKey();

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [results, setResults] = useState([]);

  const params = new URLSearchParams(location.search);
  const query = params.get("q") || "";

  useEffect(() => {
    if (!query) return;

    debugBus.player("Search.jsx → Searching: " + query);
    fetchResults(query);
  }, [query]);

  async function fetchResults(q) {
    try {
      const url =
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&videoEmbeddable=true&maxResults=25&q=${encodeURIComponent(
          q
        )}&key=${API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      setResults(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      debugBus.player("Search.jsx → fetchResults error: " + (err?.message || err));
      setResults([]);
    }
  }

  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      <h2>Search results for: {query}</h2>

      {results.map((item, i) => {
        const vid = item?.id?.videoId;
        const sn = item?.snippet ?? {};
        const thumb = sn?.thumbnails?.medium?.url ?? "";

        if (!vid) return null;

        return (
          <a
            key={vid + "_" + i}
            href={`/MyTube-Piped-Frontend/watch/${vid}`}
            style={{
              display: "flex",
              marginBottom: "12px",
              textDecoration: "none",
              color: "#fff"
            }}
          >
            <img
              src={thumb}
              alt=""
              style={{
                width: "168px",
                height: "94px",
                objectFit: "cover",
                borderRadius: "4px",
                marginRight: "12px"
              }}
            />
            <div>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                {sn.title ?? "Untitled"}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                {sn.channelTitle ?? "Unknown Channel"}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
