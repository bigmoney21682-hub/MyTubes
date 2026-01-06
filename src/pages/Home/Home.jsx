/**
 * File: Home.jsx
 * Path: src/pages/Home/Home.jsx
 * Description:
 *   Master page of the app.
 *   - Player stays mounted at all times
 *   - Autonext source selector
 *   - Dynamic content area
 *   - Supplies MiniPlayer meta
 *   - Registers state with AutonextEngine
 */

import React, { useState, useEffect, useContext } from "react";

import { PlayerContext } from "../../player/PlayerContext.jsx";
import { usePlaylists } from "../../contexts/PlaylistContext.jsx";
import { AutonextEngine } from "../../player/AutonextEngine.js";

import { fetchTrending } from "../../api/trending.js";
import { fetchRelatedVideos } from "../../api/related.js";

export default function Home() {
  const { currentId, loadVideo } = useContext(PlayerContext);
  const { playlists } = usePlaylists();

  // ⭐ autonext source
  const [source, setSource] = useState("trending");

  // ⭐ dynamic content list
  const [items, setItems] = useState([]);

  // ⭐ selected playlist (if source === "playlist")
  const [activePlaylistId, setActivePlaylistId] = useState(null);

  // ⭐ metadata for MiniPlayer
  const [meta, setMeta] = useState(null);

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
        const list = await fetchRelatedVideos(currentId);
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
     Update MiniPlayer meta when currentId changes
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!currentId) return;

    const item = items.find(
      (v) => (v.id || v.videoId) === currentId
    );

    if (item) {
      setMeta({
        title: item.title || item.snippet?.title || "",
        thumbnail:
          item.thumbnail ||
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          ""
      });
    }
  }, [currentId, items]);

  /* ------------------------------------------------------------
     Register autonext state with AutonextEngine
  ------------------------------------------------------------ */
  useEffect(() => {
    AutonextEngine.registerStateGetter(() => ({
      source,
      items,
      currentId,
      loadVideo
    }));
  }, [source, items, currentId, loadVideo]);

  /* ------------------------------------------------------------
     Handle clicking a video in the content area
  ------------------------------------------------------------ */
  function handleSelect(item) {
    const id = item.id || item.videoId;
    if (!id) return;

    loadVideo(id);

    // Lock source based on where the user clicked
    if (source === "playlist") return;
    if (source === "trending") return;
    if (source === "related") return;
  }

  /* ------------------------------------------------------------
     Render
  ------------------------------------------------------------ */
  return (
    <div style={{ padding: "12px", color: "#fff" }}>

      {/* ⭐ GlobalPlayerFix iframe mount point */}
      <div
        id="yt-player"
        style={{
          width: "100%",
          height: "220px",
          background: "#000",
          position: "relative",
          zIndex: 5
        }}
      ></div>

      {/* ⭐ Autonext Source Selector */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          marginTop: "12px",
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

      {/* ⭐ Playlist selector */}
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
