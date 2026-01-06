/**
 * File: Home.jsx
 * Path: src/pages/Home/Home.jsx
 * Description:
 *   Home page showing:
 *     - NowPlaying section (title, channel, autonext, related/playlist)
 *     - PlayerShell (iframe container)
 *     - Trending videos (existing UI)
 *
 *   Notes:
 *     - No navigation to /watch
 *     - Clicking a trending video loads it into the global player
 */

import React, { useEffect, useState, useContext } from "react";

import { fetchTrending } from "../../api/trending.js";
import normalizeId from "../../utils/normalizeId.js";

import { PlayerContext } from "../../player/PlayerContext.jsx";
import PlayerShell from "../../player/PlayerShell.jsx";

// ❌ Temporarily removed to isolate black‑screen crash
// import VideoActions from "../../components/VideoActions.jsx";

import NowPlaying from "./NowPlaying.jsx";

/* ------------------------------------------------------------
   Shared card styles (unchanged)
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

  const { loadVideo } = useContext(PlayerContext);

  useEffect(() => {
    loadTrending();
  }, []);

  async function loadTrending() {
    try {
      const list = await fetchTrending("US");

      if (!Array.isArray(list)) {
        console.log("Home.jsx → fetchTrending returned invalid list");
        setVideos([]);
        return;
      }

      const normalized = list
        .map((item) => {
          const vid = normalizeId(item);
          if (!vid) {
            console.log("Home.jsx → Skipped trending item with invalid ID", item);
            return null;
          }

          return {
            id: vid,
            snippet: {
              title: item.title,
              channelTitle: item.author,
              description: "",
              thumbnails: {
                medium: { url: item.thumbnail }
              }
            }
          };
        })
        .filter(Boolean);

      console.log(`Home.jsx → Trending loaded (${normalized.length} items)`);

      setVideos(normalized);
    } catch (err) {
      console.log("Home.jsx → loadTrending error:", err?.message);
      setVideos([]);
    }
  }

  function handlePlay(item) {
    const vid = item?.id;
    if (!vid) return;
    loadVideo(vid);
  }

  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      {/* Now Playing metadata */}
      <NowPlaying />

      {/* 🔥 Actual iframe player container */}
      <PlayerShell />

      {/* Trending section */}
      <h2 style={{ marginBottom: "12px", marginTop: "12px" }}>Trending</h2>

      {videos.map((item, i) => {
        const vid = item?.id;
        const sn = item?.snippet ?? {};
        const thumb = sn?.thumbnails?.medium?.url ?? "";

        if (!vid) return null;

        const isExpanded = expandedIndex === i;

        return (
          <div key={vid + "_" + i} style={{ marginBottom: "24px" }}>
            <div
              onClick={() => handlePlay(item)}
              style={{ textDecoration: "none", color: "#fff", cursor: "pointer" }}
            >
              <img
                src={thumb}
                alt={sn.title ?? "Video thumbnail"}
                style={thumbStyle}
              />

              <div style={titleStyle}>{sn.title ?? "Untitled"}</div>
              <div style={channelStyle}>{sn.channelTitle ?? "Unknown Channel"}</div>
            </div>

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

            {/* ❌ Temporarily disabled to isolate crash */}
            {/* <VideoActions videoId={vid} videoSnippet={sn} /> */}
          </div>
        );
      })}
    </div>
  );
}
