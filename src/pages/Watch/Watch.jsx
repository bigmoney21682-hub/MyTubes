/**
 * File: Watch.jsx
 * Path: src/pages/Watch.jsx
 * Description: Fully optimized Watch page using YouTubeAPI.js
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

// NEW optimized API layer
import {
  fetchVideo,
  fetchRelated,
  fetchTrending
} from "../api/YouTubeAPI.js";

/* ------------------------------------------------------------
   MEMOIZED PLAYER CONTAINER (prevents iframe unmount)
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

  const rawId = params.id;

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const srcParam = searchParams.get("src");
  const playlistIdFromURL = searchParams.get("pl");

  const id = useMemo(() => {
    if (!rawId) return "";
    if (typeof rawId === "string") return rawId;
    if (rawId.videoId) return rawId.videoId;
    if (rawId.id) return rawId.id;
    return String(rawId);
  }, [rawId]);

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
    debugBus.player("PlayerContext → loadVideo(" + id + ")");
    loadVideo(id);
  }, [id, loadVideo]);

  /* ------------------------------------------------------------
     Fetch video + related + trending (optimized)
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!id) return;

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
     AutonextEngine callback registration (STABLE)
  ------------------------------------------------------------ */
  useEffect(() => {
    const effectivePlaylistId = selectedPlaylistId || playlistIdFromURL || null;

    // PLAYLIST MODE
    if (autonextSource === "playlist" && effectivePlaylistId) {
      const playlistHandler = () => {
        const playlist = playlists.find((p) => p.id === effectivePlaylistId);
        if (!playlist) return;

        const index = playlist.videos.findIndex((v) => v.id === id);
        if (index === -1) return;

        const nextIndex = (index + 1) % playlist.videos.length;
        const nextVideo = playlist.videos[nextIndex];

        navigate(`/watch/${nextVideo.id}?src=playlist&pl=${effectivePlaylistId}`);
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
      const vidId = next.id?.videoId || next.id;
      if (!vidId) return;

      navigate(`/watch/${vidId}?src=related`);
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
    selectedPlaylistId,
    playlistIdFromURL,
    playlists,
    navigate,
    related,
    trending
  ]);

  /* ------------------------------------------------------------
     Related list selection
  ------------------------------------------------------------ */
  const effectivePlaylistId = selectedPlaylistId || playlistIdFromURL || null;

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
                const vidId = item.id?.videoId || item.id;
                const thumb = item.snippet?.thumbnails?.medium?.url;
                const title = item.snippet?.title;

                if (!vidId) return null;

                return (
                  <div
                    key={vidId}
                    style={{
                      display: "flex",
                      gap: "8px",
                      cursor: "pointer"
                    }}
                    onClick={() =>
                      navigate(`/watch/${vidId}?src=${autonextSource}`)
                    }
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
