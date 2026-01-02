/**
 * File: Home.jsx
 * Path: src/pages/Home/Home.jsx
 * Description: Home page showing trending videos (most popular) with
 *              stacked 16:9 thumbnails, collapsible descriptions,
 *              and minimal quota usage.
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchTrending } from "../../api/trending.js";

console.log("TRENDING ITEM SAMPLE", trending[0]);

import VideoActions from "../../components/VideoActions.jsx";

/* ------------------------------------------------------------
   Shared card styles
------------------------------------------------------------- */
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
    loadTrending();
  }, []);

  async function loadTrending() {
    try {
      const list = await fetchTrending("US");

      if (!Array.isArray(list)) {
        window.bootDebug?.player("Home.jsx → fetchTrending returned invalid list");
        setVideos([]);
        return;
      }

      const normalized = list.map((item) => ({
        id: item.id,
        snippet: {
          title: item.title,
          channelTitle: item.author,
          description: "",
          thumbnails: {
            medium: { url: item.thumbnail }
          }
        }
      }));

      window.bootDebug?.player(
        `Home.jsx → Trending loaded (${normalized.length} items)`
      );

      setVideos(normalized);
    } catch (err) {
      window.bootDebug?.player("Home.jsx → loadTrending error: " + err?.message);
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
          <div key={vid + "_" + i} style={{ marginBottom: "24px" }}>
            {/* Thumbnail + Title clickable */}
            <Link
              to={`/watch/${vid}`}
              style={{ textDecoration: "none", color: "#fff" }}
            >
              <img
                src={thumb}
                alt={sn.title ?? "Video thumbnail"}
                style={thumbStyle}
              />

              <div style={titleStyle}>{sn.title ?? "Untitled"}</div>
              <div style={channelStyle}>{sn.channelTitle ?? "Unknown Channel"}</div>
            </Link>

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
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
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

            {/* ⭐ Add to Queue + Playlist */}
            <VideoActions videoId={vid} videoSnippet={sn} />
          </div>
        );
      })}
    </div>
  );
}
