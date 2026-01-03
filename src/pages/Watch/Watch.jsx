/**
 * File: Watch.jsx
 * Path: src/pages/Watch/Watch.jsx
 * Description:
 *   Fully optimized Watch page with:
 *     - Full ID normalization
 *     - Crash-proof autonext
 *     - Crash-proof related list
 *     - Crash-proof playlist mode
 *     - Stable YouTube API loader
 *     - ⭐ ID-safe boot guard (prevents BOOT ERROR)
 */

import React, {
  useEffect,
  useState,
  useMemo,
  useRef
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { usePlayer } from "../../player/PlayerContext.jsx";
import { AutonextEngine } from "../../player/AutonextEngine.js";
import { GlobalPlayer } from "../../player/GlobalPlayer.js";

import { usePlaylists } from "../../contexts/PlaylistContext.jsx";
import { debugBus } from "../../debug/debugBus.js";

import {
  fetchVideo,
  fetchRelated,
  fetchTrending
} from "../../api/YouTubeAPI.js";

import normalizeId from "../../utils/normalizeId.js";

/* ------------------------------------------------------------
   MEMOIZED PLAYER CONTAINER
------------------------------------------------------------ */
const PlayerContainer = React.memo(() => {
  return (
    <div
      id="player"
      style={{
        width: "100%",
        height: "220px",
        background: "#000",
        marginBottom: "0px"
      }}
    />
  );
});

/* ------------------------------------------------------------
   MEMOIZED AUTONEXT BUTTON
------------------------------------------------------------ */
const AutonextButton = React.memo(function AutonextButton({
  sourceLabel,
  openSourceMenu
}) {
  return (
    <button
      onClick={openSourceMenu}
      style={{
        padding: "8px 14px",
        borderRadius: "999px",
        border: "none",
        fontSize: "14px",
        fontWeight: 600,
        color: "#fff",
        background: "radial-gradient(circle at 30% 30%, #ff7a18, #ff3f00)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
        cursor: "pointer"
      }}
    >
      Autonext: {sourceLabel}
    </button>
  );
});

export default function Watch() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  /* ------------------------------------------------------------
     ⭐ ID NORMALIZATION + JUNK-ID FILTER
     Prevents BOOT ERROR from malformed URLs
  ------------------------------------------------------------ */
  const rawId = params.id;

  // Boot-time log: raw param
  window.bootDebug?.router(
    "Watch.jsx → raw param id = " + JSON.stringify(rawId)
  );

  const id = useMemo(() => {
    const clean = normalizeId({ id: rawId });

    // Boot-time log: normalized ID
    window.bootDebug?.router(
      "Watch.jsx → normalized id (after normalizeId) = " +
        JSON.stringify(clean)
    );

    // Treat junk strings as invalid
    if (!clean) return null;
    if (clean === "undefined") return null;
    if (clean === "null") return null;
    if (clean === "[object Object]") return null;

    return clean;
  }, [rawId]);

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const srcParam = searchParams.get("src");
  const playlistIdFromURL = searchParams.get("pl");

  const isPlaylistMode = Boolean(playlistIdFromURL);

  const { loadVideo, setAutonextMode, setActivePlaylistId } = usePlayer();
  const { playlists, openAddToPlaylist } = usePlaylists();

  const [videoData, setVideoData] = useState(null);
  const [related, setRelated] = useState([]);
  const [trending, setTrending] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(
    playlistIdFromURL || null
  );

  const [autonextSource, setAutonextSource] = useState(
    isPlaylistMode ? "playlist" : "related"
  );

  /* ------------------------------------------------------------
     ⭐ BOOT GUARD — prevents BOOT ERROR
     If ID is invalid, stop everything and show fallback UI
  ------------------------------------------------------------ */
  if (!id) {
    window.bootDebug?.router(
      "Watch.jsx → INVALID OR MISSING ID. params = " +
        JSON.stringify(params) +
        ", rawId = " +
        JSON.stringify(rawId)
    );

    debugBus.error("Watch.jsx → Invalid or missing video id", {
      params,
      rawId
    });

    return (
      <div style={{ paddingTop: "60px", color: "#f87171", padding: "16px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>
          Invalid video
        </h2>
        <div style={{ fontSize: "14px", opacity: 0.8 }}>
          The video link is invalid or expired.
        </div>
      </div>
    );
  }

  window.bootDebug?.router(
    "Watch.jsx → VALID ID, continuing render. id = " + JSON.stringify(id)
  );

  /* ------------------------------------------------------------
     POPUP ISOLATION
  ------------------------------------------------------------ */
  const showSourceMenuRef = useRef(false);
  const showPlaylistPickerRef = useRef(false);
  const [uiTick, setUiTick] = useState(0);

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
     Autonext mode correction
  ------------------------------------------------------------ */
  useEffect(() => {
    setAutonextSource((prev) => {
      if (prev === "playlist" && !isPlaylistMode && !selectedPlaylistId) {
        return "related";
      }
      return prev;
    });
  }, [isPlaylistMode, selectedPlaylistId]);

  /* ------------------------------------------------------------
     YouTube API loader
  ------------------------------------------------------------ */
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      debugBus.log("YT API already loaded (Watch.jsx)");
      GlobalPlayer.onApiReady();
      return;
    }

    debugBus.log("Injecting YouTube API script (Watch.jsx)");

    const existing = document.getElementById("youtube-iframe-api");
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.id = "youtube-iframe-api";
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      debugBus.log("YouTube API ready (Watch.jsx callback)");
      GlobalPlayer.onApiReady();
    };
  }, []);

  /* ------------------------------------------------------------
     Autonext mode → PlayerContext
  ------------------------------------------------------------ */
  useEffect(() => {
    window.bootDebug?.router(
      "Watch.jsx → Autonext mode effect. autonextSource = " +
        autonextSource +
        ", selectedPlaylistId = " +
        JSON.stringify(selectedPlaylistId) +
        ", playlistIdFromURL = " +
        JSON.stringify(playlistIdFromURL)
    );

    if (autonextSource === "playlist" && (selectedPlaylistId || playlistIdFromURL)) {
      setAutonextMode("playlist");
      setActivePlaylistId(selectedPlaylistId || playlistIdFromURL);
    } else if (autonextSource === "related") {
      setAutonextMode("related");
      setActivePlaylistId(null);
    }
  }, [
    autonextSource,
    selectedPlaylistId,
    playlistIdFromURL,
    setAutonextMode,
    setActivePlaylistId
  ]);

  /* ------------------------------------------------------------
     Load video into GlobalPlayer
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!id) return;

    window.bootDebug?.router(
      "Watch.jsx → PlayerContext.loadVideo(" + JSON.stringify(id) + ")"
    );

    debugBus.player("PlayerContext → loadVideo(" + id + ")");
    loadVideo(id);
  }, [id, loadVideo]);

  /* ------------------------------------------------------------
     Fetch video + related + trending
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!id) return;

    window.bootDebug?.router(
      "Watch.jsx → Fetching video + related + trending for id = " +
        JSON.stringify(id)
    );

    async function loadAll() {
      const video = await fetchVideo(id);
      setVideoData(video);

      const rel = await fetchRelated(id);
      setRelated(rel);

      const trend = await fetchTrending("US");
      setTrending(trend);
    }

    loadAll();
  }, [id]);

  /* ------------------------------------------------------------
     Effective playlist ID
  ------------------------------------------------------------ */
  const effectivePlaylistId = useMemo(
    () => selectedPlaylistId || playlistIdFromURL || null,
    [selectedPlaylistId, playlistIdFromURL]
  );

  /* ------------------------------------------------------------
     Playlist Metadata Hydration
  ------------------------------------------------------------ */
  useEffect(() => {
    if (autonextSource !== "playlist") return;
    if (!effectivePlaylistId) return;

    const pl = playlists.find((p) => p.id === effectivePlaylistId);
    if (!pl) return;

    window.bootDebug?.router(
      "Watch.jsx → Hydrating playlist metadata for playlistId = " +
        JSON.stringify(effectivePlaylistId)
    );

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
  }, [autonextSource, effectivePlaylistId, playlists]);

  /* ------------------------------------------------------------
     AutonextEngine callback registration
  ------------------------------------------------------------ */
  useEffect(() => {
    // PLAYLIST MODE
    if (autonextSource === "playlist" && effectivePlaylistId) {
      window.bootDebug?.router(
        "Watch.jsx → AutonextEngine playlist mode. effectivePlaylistId = " +
          JSON.stringify(effectivePlaylistId) +
          ", current id = " +
          JSON.stringify(id)
      );

      const playlistHandler = () => {
        const playlist = playlists.find((p) => p.id === effectivePlaylistId);
        if (!playlist) return;

        const index = playlist.videos.findIndex((v) => v.id === id);
        if (index === -1) return;

        const nextIndex = (index + 1) % playlist.videos.length;
        const nextVideo = playlist.videos[nextIndex];

        const nextId = normalizeId(nextVideo);

        window.bootDebug?.router(
          "Watch.jsx → Autonext playlist handler. nextVideo = " +
            JSON.stringify(nextVideo) +
            ", nextId = " +
            JSON.stringify(nextId)
        );

        if (!nextId) return;

        const url = `/watch/${nextId}?src=playlist&pl=${effectivePlaylistId}`;
        window.bootDebug?.router(
          "Watch.jsx → Autonext playlist navigate(" + JSON.stringify(url) + ")"
        );

        navigate(url);
      };

      AutonextEngine.registerPlaylistCallback(playlistHandler);
      AutonextEngine.registerRelatedCallback(null);

      return () => {
        AutonextEngine.registerPlaylistCallback(null);
        AutonextEngine.registerRelatedCallback(null);
      };
    }

    // RELATED MODE
    const relatedHandler = () => {
      const list = related.length ? related : trending;
      if (!list.length) return;

      const next = list[0];
      const vidId = normalizeId(next);

      window.bootDebug?.router(
        "Watch.jsx → Autonext related handler. next = " +
          JSON.stringify(next) +
          ", vidId = " +
          JSON.stringify(vidId)
      );

      if (!vidId) return;

      const url = `/watch/${vidId}?src=related`;
      window.bootDebug?.router(
        "Watch.jsx → Autonext related navigate(" + JSON.stringify(url) + ")"
      );

      navigate(url);
    };

    AutonextEngine.registerPlaylistCallback(null);
    AutonextEngine.registerRelatedCallback(relatedHandler);

    return () => {
      AutonextEngine.registerPlaylistCallback(null);
      AutonextEngine.registerRelatedCallback(null);
    };
  }, [
    id,
    autonextSource,
    effectivePlaylistId,
    playlists,
    navigate,
    related.length,
    trending.length
  ]);

  /* ------------------------------------------------------------
     Related / Playlist List
  ------------------------------------------------------------ */
  const relatedList = useMemo(() => {
    if (autonextSource === "playlist" && effectivePlaylistId) {
      const pl = playlists.find((p) => p.id === effectivePlaylistId);
      return pl ? pl.videos : [];
    }
    if (autonextSource === "related") {
      if (related.length) return related;
      return trending;
    }
    return related;
  }, [autonextSource, effectivePlaylistId, playlists, related, trending]);

  const relatedTitle = useMemo(() => {
    if (autonextSource === "playlist" && effectivePlaylistId) {
      const pl = playlists.find((p) => p.id === effectivePlaylistId);
      return pl ? pl.name : "Playlist";
    }
    return "Related";
  }, [autonextSource, effectivePlaylistId, playlists]);

  const currentOriginLabel = useMemo(() => {
    if (effectivePlaylistId) return "Playlist";
    if (srcParam === "related") return "Related";
    if (srcParam === "trending") return "Trending";
    return "Trending";
  }, [effectivePlaylistId, srcParam]);

  const sourceLabel = useMemo(() => {
    if (autonextSource === "playlist") return "Playlist";
    return "Related";
  }, [autonextSource]);

  /* ------------------------------------------------------------
     Popup styles
  ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
     Render
  ------------------------------------------------------------ */
  return (
    <div style={{ paddingTop: "60px", color: "#fff" }}>
      {/* PLAYER PINNED UNDER HEADER */}
      <div
        style={{
          position: "fixed",
          top: "60px",
          left: 0,
          right: 0,
          zIndex: 900,
          background: "#000"
        }}
      >
        <PlayerContainer />
      </div>

      {/* SCROLLABLE CONTENT BELOW PLAYER */}
      <div
        style={{
          marginTop: "220px",
          height: "calc(100vh - 60px - 220px)",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "16px",
          paddingBottom: "40px"
        }}
      >
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
                  setAutonextSource("related");
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
                Playlist…
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
                    setSelectedPlaylistId(pl.id);
                    setAutonextSource("playlist");
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
        {videoData && (
          <div style={{ marginBottom: "12px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
              {videoData.snippet.title}
            </h2>
            <div style={{ opacity: 0.7, fontSize: "13px" }}>
              {videoData.snippet.channelTitle}
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <AutonextButton
            sourceLabel={sourceLabel}
            openSourceMenu={openSourceMenu}
          />

          <button
            onClick={() =>
              openAddToPlaylist({
                id,
                title: videoData?.snippet?.title,
                thumbnail: videoData?.snippet?.thumbnails?.medium?.url
              })
            }
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              background: "#3b82f6",
              color: "#fff"
            }}
          >
            + Add to playlist
          </button>

          <span style={{ fontSize: "11px", opacity: 0.7 }}>
            Source: {currentOriginLabel}
          </span>
        </div>

        {/* Related / Playlist List */}
        {relatedList.length > 0 && (
          <div style={{ marginTop: "8px" }}>
            <h3 style={{ fontSize: "14px", marginBottom: "8px" }}>
              {relatedTitle}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {relatedList.map((item) => {
                const vidId = normalizeId(item);

                window.bootDebug?.router(
                  "Watch.jsx → relatedList item normalizeId(item) = " +
                    JSON.stringify(vidId) +
                    ", item = " +
                    JSON.stringify(item)
                );

                if (!vidId) {
                  console.warn("Invalid related item:", item);
                  return null;
                }

                const thumb = item.snippet?.thumbnails?.medium?.url;
                const title = item.snippet?.title;

                const url = `/watch/${vidId}?src=${autonextSource}${
                  effectivePlaylistId ? `&pl=${effectivePlaylistId}` : ""
                }`;

                return (
                  <div
                    key={vidId}
                    style={{
                      display: "flex",
                      gap: "8px",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      window.bootDebug?.router(
                        "Watch.jsx → relatedList CLICK navigate(" +
                          JSON.stringify(url) +
                          ")"
                      );
                      navigate(url);
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
    </div>
  );
}
