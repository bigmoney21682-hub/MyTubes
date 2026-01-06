/**
 * File: Home.jsx
 * Path: src/pages/Home/Home.jsx
 * Description:
 *   The master page of the app.
 *   - Player stays mounted at all times
 *   - Autonext source selector (Playlist / Related / Trending)
 *   - Dynamic content area based on source
 *   - loadVideo() never unmounts the iframe
 *   - Continuous play from any source
 */

import React, { useState, useEffect, useContext } from "react";

import { PlayerContext } from "../../player/PlayerContext.jsx";
import { usePlaylists } from "../../contexts/PlaylistContext.jsx";

import { fetchTrending } from "../../api/trending.js";
import { fetchRelated } from "../../api/related.js";

export default function Home() {
  const { currentId, loadVideo } = useContext(PlayerContext);
  const { playlists } = usePlaylists();

  // ⭐ autonext source: "trending" | "related" | "playlist"
  const [source, setSource] = useState("trending");

  // ⭐ dynamic content list
  const [items, setItems] = useState([]);

  // ⭐ selected playlist (if source === "playlist")
  const [activePlaylistId, setActivePlaylistId] = useState(null);

  /* ------------------------------------------------------------
     Load content based on source
  ------------------------------------------------------------ */
  useEffect(() => {
    async function load() {
      if (source === "trending") {
        const list = await fetchTrending();
        setItems(list || []);
      }

      if (source === "related" && currentId) {
        const list = await fetchRelated(currentId);
        setItems(list || []);
      }

      if (source === "playlist" && activePlaylistId) {
        const pl = playlists.find((p) => p.id === activePlaylistId);
        setItems(pl ? pl.videos : []);
      }
    }

    load();
  }, [source, currentId, activePlaylistId, playlists]);

  /* ------------------------------------------------------------
     Handle clicking a video in the content area
  ------------------------------------------------------------ */
  function handleSelect(item) {
    const id = item.id || item.videoId;
    if (!id) return;

    loadVideo(id);

    // If user clicked a playlist item → lock source to playlist
    if (source === "playlist") return;

    // If user clicked trending → lock source to trending
    if (source === "trending") return;

    // If user clicked related → lock source to related
    if (source === "related") return;
  }

  /* ------------------------------------------------------------
     Render
  ------------------------------------------------------------ */
  return (
    <div style={{ padding: "12px", color: "#fff" }}>
      {/* ⭐ Autonext Source Selector */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          justifyContent: "center"
        }}
      >
        <button
          onClick={() => setSource("trending")}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            background: source === "trending" ? "#ff0000" : "#333",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Trending
        </button>

        <button
          onClick={() => setSource("related")}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            background: source === "related" ? "#ff0000" : "#333",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Related
        </button>

        <button
          onClick={() => {
            setSource("playlist");
            if (!activePlaylistId && playlists.length > 0) {
              setActivePlaylistId(playlists[0].id);
            }
          }}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            background: source === "playlist" ? "#ff0000" : "#333",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Playlist
        </button>
      </div>

      {/* ⭐ Playlist selector (only when source === playlist) */}
      {source === "playlist" && playlists.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "16px",
            overflowX: "auto"
          }}
        >
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => setActivePlaylistId(pl.id)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                background: activePlaylistId === pl.id ? "#3ea6ff" : "#333",
                color: "#fff",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {pl.name}
            </button>
          ))}
        </div>
      )}

      {/* ⭐ Content Area */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {items.map((item) => {
          const id = item.id || item.videoId;
          const thumb =
            item.thumbnail ||
            item.snippet?.thumbnails?.medium?.url ||
            item.snippet?.thumbnails?.default?.url;

          return (
            <div
              key={id}
              onClick={() => handleSelect(item)}
              style={{
                cursor: "pointer",
                background: "#111",
                padding: "8px",
                borderRadius: "8px"
              }}
            >
              <img
                src={thumb}
                alt=""
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  objectFit: "cover",
                  borderRadius: "6px",
                  marginBottom: "8px"
                }}
              />

              <div style={{ fontSize: "15px", fontWeight: 600 }}>
                {item.title || item.snippet?.title}
              </div>

              <div style={{ fontSize: "13px", opacity: 0.7 }}>
                {item.channelTitle || item.snippet?.channelTitle}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
