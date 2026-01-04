/**
 * ------------------------------------------------------------
 * File: NowPlaying.jsx
 * Path: src/pages/Home/NowPlaying.jsx
 * Description:
 *   Unified Now Playing section for Home page.
 *
 *   Contains:
 *     - Title + channel
 *     - Autonext source picker
 *     - Add to playlist
 *     - Related / Playlist list
 *     - Playlist hydration
 *     - AutonextEngine callback registration
 *
 *   Notes:
 *     - No navigation
 *     - No route params
 *     - Uses PlayerContext + PlaylistContext
 *     - Uses GlobalPlayer_v2
 * ------------------------------------------------------------
 */

import React, { useEffect, useMemo, useRef, useState } from "react";

import { usePlayer } from "../../player/PlayerContext.jsx";
import { usePlaylists } from "../../contexts/PlaylistContext.jsx";
import { AutonextEngine } from "../../player/AutonextEngine.js";

import { fetchVideo, fetchRelated, fetchTrending } from "../../api/YouTubeAPI.js";
import normalizeId from "../../utils/normalizeId.js";

import { GlobalPlayer } from "../../player/GlobalPlayer_v2.js";

/* ------------------------------------------------------------
   Shared pill-style button (from Watch.jsx)
------------------------------------------------------------- */
const pillButton = {
  padding: "4px 10px",
  fontSize: "11px",
  borderRadius: "999px",
  background: "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
  color: "#fff",
  border: "none",
  fontWeight: "600",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  cursor: "pointer",
  boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
  transition: "transform 0.15s ease"
};

export default function NowPlaying() {
  const {
    activeVideoId,
    autonextMode,
    setAutonextMode,
    activePlaylistId,
    setActivePlaylistId,
    setPlayerMeta,
    expandPlayer
  } = usePlayer();

  const { playlists, openAddToPlaylist } = usePlaylists();

  const [videoData, setVideoData] = useState(null);
  const [related, setRelated] = useState([]);
  const [trending, setTrending] = useState([]);

  const [uiTick, setUiTick] = useState(0);

  // Local UI state for modals
  const showSourceMenuRef = useRef(false);
  const showPlaylistPickerRef = useRef(false);

  function openSourceMenu() {
    showSourceMenuRef.current = true;
    setUiTick((x) => x + 1);
  }

  function closeSourceMenu() {
    showSourceMenuRef.current = false;
    setUiTick((x) => x + 1);
  }

  function openPlaylistPicker() {
    showPlaylistPickerRef.current = true;
    setUiTick((x) => x + 1);
  }

  function closePlaylistPicker() {
    showPlaylistPickerRef.current = false;
    setUiTick((x) => x + 1);
  }

  /* ------------------------------------------------------------
     Load metadata + related + trending when activeVideoId changes
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!activeVideoId) return;

    async function loadAll() {
      const video = await fetchVideo(activeVideoId);
      setVideoData(video);

      // Update PlayerContext meta for MiniPlayer + FullPlayer
      setPlayerMeta({
        title: video?.snippet?.title ?? "",
        thumbnail: video?.snippet?.thumbnails?.medium?.url ?? "",
        channel: video?.snippet?.channelTitle ?? ""
      });

      const rel = await fetchRelated(activeVideoId);
      setRelated(rel);

      const trend = await fetchTrending("US");
      setTrending(trend);
    }

    loadAll();
  }, [activeVideoId, setPlayerMeta]);

  /* ------------------------------------------------------------
     Playlist hydration (same as Watch.jsx)
  ------------------------------------------------------------ */
  useEffect(() => {
    if (autonextMode !== "playlist") return;
    if (!activePlaylistId) return;

    const pl = playlists.find((p) => p.id === activePlaylistId);
    if (!pl) return;

    async function hydrate() {
      let changed = false;

      for (const item of pl.videos) {
        if (!item.snippet) {
          const meta = await fetchVideo(item.id);
          if (meta?.snippet) {
            item.snippet = meta.snippet;
            changed = true;
          }
        }
      }

      if (changed) {
        setUiTick((x) => x + 1);
      }
    }

    hydrate();
  }, [autonextMode, activePlaylistId, playlists]);

  /* ------------------------------------------------------------
     AutonextEngine callback registration
     (rewritten to use loadVideo instead of navigation)
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!activeVideoId) return;

    // PLAYLIST AUTONEXT
    if (autonextMode === "playlist" && activePlaylistId) {
      const playlistHandler = () => {
        const playlist = playlists.find((p) => p.id === activePlaylistId);
        if (!playlist) return;

        const index = playlist.videos.findIndex((v) => v.id === activeVideoId);
        if (index === -1) return;

        const nextIndex = (index + 1) % playlist.videos.length;
        const nextVideo = playlist.videos[nextIndex];

        const nextId = normalizeId(nextVideo);
        if (!nextId) return;

        // Load next video (no navigation)
        GlobalPlayer.load(nextId);

        setPlayerMeta({
          title: nextVideo.snippet?.title ?? "",
          thumbnail: nextVideo.snippet?.thumbnails?.medium?.url ?? "",
          channel: nextVideo.snippet?.channelTitle ?? ""
        });

        expandPlayer();
      };

      AutonextEngine.registerPlaylistCallback(playlistHandler);
      AutonextEngine.registerRelatedCallback(null);

      return () => {
        AutonextEngine.registerPlaylistCallback(null);
        AutonextEngine.registerRelatedCallback(null);
      };
    }

    // RELATED AUTONEXT
    const relatedHandler = () => {
      const list = related.length ? related : trending;
      if (!list.length) return;

      const next = list[0];
      const vidId = normalizeId(next);
      if (!vidId) return;

      GlobalPlayer.load(vidId);

      setPlayerMeta({
        title: next.snippet?.title ?? "",
        thumbnail: next.snippet?.thumbnails?.medium?.url ?? "",
        channel: next.snippet?.channelTitle ?? ""
      });

      expandPlayer();
    };

    AutonextEngine.registerPlaylistCallback(null);
    AutonextEngine.registerRelatedCallback(relatedHandler);

    return () => {
      AutonextEngine.registerPlaylistCallback(null);
      AutonextEngine.registerRelatedCallback(null);
    };
  }, [
    activeVideoId,
    autonextMode,
    activePlaylistId,
    playlists,
    related.length,
    trending.length,
    setPlayerMeta,
    expandPlayer
  ]);

  /* ------------------------------------------------------------
     Related / Playlist list (same logic as Watch.jsx)
  ------------------------------------------------------------ */
  const relatedList = useMemo(() => {
    if (autonextMode === "playlist" && activePlaylistId) {
      const pl = playlists.find((p) => p.id === activePlaylistId);
      return pl ? pl.videos : [];
    }
    if (autonextMode === "related") {
      if (related.length) return related;
      return trending;
    }
    return related;
  }, [autonextMode, activePlaylistId, playlists, related, trending]);

  const relatedTitle = useMemo(() => {
    if (autonextMode === "playlist" && activePlaylistId) {
      const pl = playlists.find((p) => p.id === activePlaylistId);
      return pl ? pl.name : "Playlist";
    }
    return "Related";
  }, [autonextMode, activePlaylistId, playlists]);

  /* ------------------------------------------------------------
     UI Rendering
  ------------------------------------------------------------ */

  if (!activeVideoId || !videoData) return null;

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  };

  const menuStyle = {
    background: "#111827",
    padding: "16px",
    borderRadius: "12px",
    width: "260px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
  };

  const menuButton = {
    width: "100%",
    padding: "8px 10px",
    marginBottom: "8px",
    borderRadius: "999px",
    border: "none",
    background: "#1f2937",
    color: "#fff",
    textAlign: "left",
    fontSize: "14px",
    cursor: "pointer"
  };

  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      {/* Autonext Source Menu */}
      {showSourceMenuRef.current && (
        <div style={overlayStyle} onClick={closeSourceMenu}>
          <div style={menuStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "12px", fontSize: "16px" }}>
              Autonext Source
            </h3>

            <button
              style={menuButton}
              onClick={() => {
                setAutonextMode("related");
                closeSourceMenu();
              }}
            >
              Related
            </button>

            <button
              style={menuButton}
              onClick={() => {
                closeSourceMenu();
                openPlaylistPicker();
              }}
            >
              Playlist...
            </button>
          </div>
        </div>
      )}

      {/* Playlist Picker */}
      {showPlaylistPickerRef.current && (
        <div style={overlayStyle} onClick={closePlaylistPicker}>
          <div style={menuStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "12px", fontSize: "16px" }}>
              Choose Playlist
            </h3>

            {playlists.length === 0 && (
              <div style={{ fontSize: "13px", opacity: 0.7 }}>
                No playlists yet.
              </div>
            )}

            {playlists.map((pl) => (
              <button
                key={pl.id}
                style={menuButton}
                onClick={() => {
                  setActivePlaylistId(pl.id);
                  setAutonextMode("playlist");
                  closePlaylistPicker();
                }}
              >
                {pl.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video Info */}
      <div style={{ marginBottom: "12px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
          {videoData.snippet.title}
        </h2>
        <div style={{ opacity: 0.7, fontSize: "13px" }}>
          {videoData.snippet.channelTitle}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center" }}>
        {/* Autonext button */}
        <button
          onClick={openSourceMenu}
          style={pillButton}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.94)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Autonext: {autonextMode}
        </button>

        {/* Add to Playlist button */}
        <button
          onClick={() =>
            openAddToPlaylist({
              id: activeVideoId,
              title: videoData?.snippet?.title,
              thumbnail: videoData?.snippet?.thumbnails?.medium?.url
            })
          }
          style={pillButton}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.94)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          + Add to playlist
        </button>
      </div>

      {/* Related / Playlist List */}
      {relatedList.length > 0 && (
        <div style={{ marginTop: "8px" }}>
          <h3 style={{ fontSize: "14px", marginBottom: "8px" }}>
            {relatedTitle}
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            {relatedList.map((item) => {
              const vidId = normalizeId(item);
              if (!vidId) return null;

              const thumb = item.snippet?.thumbnails?.medium?.url;
              const title = item.snippet?.title;

              return (
                <div
                  key={vidId}
                  style={{
                    display: "flex",
                    gap: "8px",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    GlobalPlayer.load(vidId);

                    setPlayerMeta({
                      title: item.snippet?.title ?? "",
                      thumbnail: item.snippet?.thumbnails?.medium?.url ?? "",
                      channel: item.snippet?.channelTitle ?? ""
                    });

                    expandPlayer();
                  }}
                >
                  <img
                    src={thumb}
                    alt={title}
                    style={{
                      width: "160px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "8px"
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center"
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 500 }}>
                      {title}
                    </div>
                    <div style={{ fontSize: "11px", opacity: 0.7 }}>
                      {item.snippet?.channelTitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
