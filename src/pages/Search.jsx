/**
 * File: Search.jsx
 * Path: src/pages/Search.jsx
 * Description: Search results page using YouTube Data API with stacked
 *              16:9 thumbnails and limited results to reduce quota usage.
 */

import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { debugBus } from "../debug/debugBus.js";
import { getApiKey } from "../api/getApiKey.js";

const API_KEY = getApiKey();

const cardStyle = {
  width: "100%",
  marginBottom: "20px",
  textDecoration: "none",
  color: "#fff",
  display: "block"
};

const thumbStyle = {
  width: "100%",
  aspectRatio: "16 / 9",
  objectFit: "cover",
  borderRadius: "8px",
  marginBottom: "8px"
};

const titleStyle = {
  fontSize: "16px",
  fontWeight: "bold",
  marginBottom: "4px"
};

const channelStyle = {
  fontSize: "13px",
  opacity: 0.7,
  marginBottom: "6px"
};

const descStyle = {
  fontSize: "13px",
  opacity: 0.8,
  lineHeight: 1.4
};

export default function Search() {
  const location = useLocation();
  const [results, setResults] = useState([]);

  const params = new URLSearchParams(location.search);
  const query = params.get("q") || "";

  useEffect(() => {
    if (!query) return;

    debugBus.log("PLAYER", "Search.jsx → Searching: " + query);
    fetchResults(query);
  }, [query]);

  async function fetchResults(q) {
    try {
      const url =
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&videoEmbeddable=true&maxResults=5&q=${encodeURIComponent(
          q
        )}&key=${API_KEY}`;

      debugBus.log("PLAYER", "Search.jsx → fetchResults: " + url);

      const res = await fetch(url);
      const data = await res.json();

      const items = Array.isArray(data?.items) ? data.items : [];
      setResults(items);

      if (!items.length) {
        debugBus.log("PLAYER", "Search.jsx → fetchResults returned 0 items");
      }
    } catch (err) {
      debugBus.log(
        "PLAYER",
        "Search.jsx → fetchResults error: " + (err?.message || err)
      );
      setResults([]);
    }
  }

  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      <h2 style={{ marginBottom: "12px" }}>
        Search results for: {query || "…"}
      </h2>

      {results.map((item, i) => {
        const vid = item?.id?.videoId;
        const sn = item?.snippet ?? {};
        const thumb = sn?.thumbnails?.medium?.url ?? "";

        if (!vid) return null;

        return (
          <Link
            key={vid + "_" + i}
            to={`/watch/${vid}`}
            style={cardStyle}
          >
            <img
              src={thumb}
              alt={sn.title ?? "Video thumbnail"}
              style={thumbStyle}
            />

            <div style={titleStyle}>{sn.title ?? "Untitled"}</div>
            <div style={channelStyle}>{sn.channelTitle ?? "Unknown Channel"}</div>
            <div style={descStyle}>{sn.description ?? ""}</div>
          </Link>
        );
      })}
    </div>
  );
}
