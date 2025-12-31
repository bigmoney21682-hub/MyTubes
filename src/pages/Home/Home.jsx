/**
 * File: Home.jsx
 * Path: src/pages/Home/Home.jsx
 * Description: Home page showing trending videos (most popular) with
 *              stacked 16:9 thumbnails, collapsible descriptions,
 *              and minimal quota usage.
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiKey } from "../../api/getApiKey.js";

const API_KEY = getApiKey();

/* ------------------------------------------------------------
   Shared card styles
------------------------------------------------------------- */
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

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    fetchTrending();
  }, []);

  async function fetchTrending() {
    try {
      const url =
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,statistics&chart=mostPopular&maxResults=5&regionCode=US&key=${API_KEY}`;

      // Correct logger
      window.bootDebug?.player("Home.jsx → fetchTrending: " + url);

      const res = await fetch(url);
      const data = await res.json();

      const items = Array.isArray(data?.items) ? data.items : [];
      setVideos(items);

      if (!items.length) {
        window.bootDebug?.player("Home.jsx → fetchTrending returned 0 items");
      }
    } catch (err) {
      window.bootDebug?.player(
        "Home.jsx → fetchTrending error: " + (err?.message || err)
      );
      setVideos([]);
    }
  }

  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      <h2 style={{ marginBottom: "12px" }}>Trending</h2>

      {videos.map((item, i) => {
        const vid = item?.id;
        const sn = item?.snippet ?? {};
        const thumb = sn?.thumbnails?.medium?.url ?? "";

        if (!vid) return null;

        const isExpanded = expandedIndex === i;

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

            {/* Collapsible description */}
            <div
              style={{
                ...descStyle,
                maxHeight: isExpanded ? "none" : "3.6em",
                overflow: "hidden",
                transition: "max-height 0.2s ease"
              }}
            >
              {sn.description ?? ""}
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                setExpandedIndex(isExpanded ? null : i);
              }}
              style={{
                marginTop: "6px",
                background: "none",
                border: "none",
                color: "#3ea6ff",
                fontSize: "14px",
                cursor: "pointer",
                padding: 0
              }}
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          </Link>
        );
      })}
    </div>
  );
}
