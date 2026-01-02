/**
 * File: src/pages/Watch/Watch.jsx
 * Description:
 *   Stable Watch page with:
 *   - Playlist + Related autonext
 *   - Autonext toggle
 *   - Add to playlist button
 *   - Correct autonext lifecycle (prevents stale callbacks)
 *   - Correct defaulting logic
 *   - Stable video loading
 */

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { usePlayer } from "../../player/PlayerContext.jsx";
import { AutonextEngine } from "../../player/AutonextEngine.js";
import { GlobalPlayer } from "../../player/GlobalPlayer.js";

import { usePlaylists } from "../../contexts/PlaylistContext.jsx";
import { debugBus } from "../../debug/debugBus.js";

export default function Watch() {
  /* ------------------------------------------------------------
     1. Normalize route ID
  ------------------------------------------------------------- */
  const params = useParams();
  const rawId = params.id;

  const id =
    typeof rawId === "string"
      ? rawId
      : rawId?.id || rawId?.videoId || "";

  const navigate = useNavigate();
  const location = useLocation();

  const {
    loadVideo,
    setAutonextMode,
    setActivePlaylistId
  } = usePlayer();

  const { playlists, openAddToPlaylist } = usePlaylists();

  const [videoData, setVideoData] = useState(null);
  const [related, setRelated] = useState([]);

  const [autonextEnabled, setAutonextEnabled] = useState(true);

  /* Detect playlist mode */
  const playlistIdFromURL = useMemo(() => {
    return new URLSearchParams(location.search).get("pl");
  }, [location.search]);

  const isPlaylistMode = Boolean(playlistIdFromURL);

  /* ------------------------------------------------------------
     2. Ensure GlobalPlayer mounts
  ------------------------------------------------------------- */
  useEffect(() => {
    GlobalPlayer.ensureMounted();
  }, []);

  /* ------------------------------------------------------------
     3. Determine autonext mode (playlist or related)
  ------------------------------------------------------------- */
  useEffect(() => {
    if (isPlaylistMode) {
      setAutonextMode("playlist");
      setActivePlaylistId(playlistIdFromURL);
      debugBus.log("Mode set → playlist");
    } else {
      setAutonextMode("related");
      setActivePlaylistId(null);
      debugBus.log("Mode set → related");
    }
  }, [isPlaylistMode, playlistIdFromURL, setAutonextMode, setActivePlaylistId]);

  /* ------------------------------------------------------------
     4. Load video (once per ID)
  ------------------------------------------------------------- */
  useEffect(() => {
    if (!id) return;
    debugBus.log("Watch.jsx → load(" + id + ")");
    loadVideo(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ------------------------------------------------------------
     5. Fetch video details + related fallback
  ------------------------------------------------------------- */
  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        const videoRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${id}&key=AIzaSyA-TNtGohJAO_hsZW6zp9FcSOdfGV7VJW0`
        );
        const videoJson = await videoRes.json();
        setVideoData(videoJson.items?.[0] || null);

        const relatedRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=20&regionCode=US&key=AIzaSyA-TNtGohJAO_hsZW6zp9FcSOdfGV7VJW0`
        );

        if (!relatedRes.ok) {
          setRelated([]);
          return;
        }

        const relatedJson = await relatedRes.json();
        setRelated(relatedJson.items || []);
      } catch {
        setRelated([]);
      }
    }

    fetchData();
  }, [id]);

  /* ------------------------------------------------------------
     6. FULL AUTONEXT LIFECYCLE (restored)
     - Prevents stale callbacks
     - Prevents "r is not a function"
     - Re-registers on ID change, mode change, related change
  ------------------------------------------------------------- */
  useEffect(() => {
    debugBus.log("Autonext lifecycle → registering callbacks");

    const playlistHandler = () => {
      if (!autonextEnabled) return;

      const playlist = playlists.find((p) => p.id === playlistIdFromURL);
      if (!playlist || !playlist.videos.length) return;

      const index = playlist.videos.findIndex((v) => v.id === id);
      if (index === -1) return;

      const nextIndex = (index + 1) % playlist.videos.length;
      const nextVideo = playlist.videos[nextIndex];

      navigate(`/watch/${nextVideo.id}?src=playlist&pl=${playlistIdFromURL}`);
      loadVideo(nextVideo.id);
    };

    const relatedHandler = () => {
      if (!autonextEnabled) return;
      if (!related.length) return;

      const next = related[0];
      const nextId = next?.id;
      if (!nextId) return;

      navigate(`/watch/${nextId}?src=related`);
      loadVideo(nextId);
    };

    AutonextEngine.registerPlaylistCallback(playlistHandler);
    AutonextEngine.registerRelatedCallback(relatedHandler);

    return () => {
      debugBus.log("Autonext lifecycle → cleanup");
      AutonextEngine.registerPlaylistCallback(null);
      AutonextEngine.registerRelatedCallback(null);
    };
  }, [
    id,
    related,
    playlists,
    playlistIdFromURL,
    autonextEnabled,
    navigate,
    loadVideo
  ]);

  /* ------------------------------------------------------------
     7. UI Handlers
  ------------------------------------------------------------- */
  const handleToggleAutonext = () => {
    const next = !autonextEnabled;
    setAutonextEnabled(next);
    debugBus.log("Autonext → " + (next ? "enabled" : "disabled"));
  };

  const handleAddToPlaylist = () => {
    if (!id || !videoData) return;

    openAddToPlaylist({
      id,
      title: videoData.snippet.title,
      thumbnail: videoData.snippet.thumbnails?.medium?.url
    });
  };

  /* ------------------------------------------------------------
     8. Render
  ------------------------------------------------------------- */
  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      {/* Player container */}
      <div
        id="player"
        style={{
          width: "100%",
          height: "220px",
          background: "#000",
          marginBottom: "12px"
        }}
      />

      {/* Video title */}
      {videoData && (
        <div style={{ marginBottom: "12px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
            {videoData.snippet.title}
          </h2>
          <div style={{ opacity: 0.7, marginTop: "4px", fontSize: "13px" }}>
            {videoData.snippet.channelTitle}
          </div>
        </div>
      )}

      {/* Controls row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px"
        }}
      >
        <button
          onClick={handleToggleAutonext}
          style={{
            padding: "6px 10px",
            borderRadius: "999px",
            border: "none",
            fontSize: "13px",
            background: autonextEnabled ? "#22c55e" : "#4b5563",
            color: "#fff"
          }}
        >
          Autonext: {autonextEnabled ? "On" : "Off"}
        </button>

        <button
          onClick={handleAddToPlaylist}
          style={{
            padding: "6px 10px",
            borderRadius: "999px",
            border: "none",
            fontSize: "13px",
            background: "#3b82f6",
            color: "#fff"
          }}
        >
          + Add to playlist
        </button>

        <span style={{ fontSize: "11px", opacity: 0.7 }}>
          Source: {isPlaylistMode ? "Playlist" : "Related"}
        </span>
      </div>

      {/* Related list */}
      <h3 style={{ marginBottom: "10px" }}>Related Videos</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {related.map((item) => {
          const vid = item.id;
          if (!vid) return null;

          return (
            <div
              key={vid}
              onClick={() => navigate(`/watch/${vid}?src=related`)}
              style={{
                display: "flex",
                gap: "12px",
                cursor: "pointer"
              }}
            >
              <img
                src={item.snippet.thumbnails.medium.url}
                alt=""
                style={{
                  width: "140px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "6px"
                }}
              />
              <div>
                <div style={{ fontWeight: "600", fontSize: "14px" }}>
                  {item.snippet.title}
                </div>
                <div
                  style={{
                    opacity: 0.7,
                    fontSize: "12px",
                    marginTop: "2px"
                  }}
                >
                  {item.snippet.channelTitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
