// File: src/pages/Watch/Watch.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { usePlayer } from "../../player/PlayerContext.jsx";
import { AutonextEngine } from "../../player/AutonextEngine.js";
import { GlobalPlayer } from "../../player/GlobalPlayer.js";

import { usePlaylists } from "../../contexts/PlaylistContext.jsx";
import { debugBus } from "../../debug/debugBus.js";

export default function Watch() {
  // ------------------------------------------------------------
  // 1. Normalize route ID
  // ------------------------------------------------------------
  const params = useParams();
  const rawId = params.id;

  const id = useMemo(() => {
    if (!rawId) return "";
    if (typeof rawId === "string") return rawId;

    // Handles cases like { videoId: "abc" } or { id: "abc" }
    if (rawId.videoId) return rawId.videoId;
    if (rawId.id) return rawId.id;

    return String(rawId);
  }, [rawId]);

  const navigate = useNavigate();
  const location = useLocation();

  const { loadVideo, setAutonextMode, setActivePlaylistId } = usePlayer();
  const { playlists, openAddToPlaylist } = usePlaylists();

  const [videoData, setVideoData] = useState(null);
  const [related, setRelated] = useState([]);
  const [autonextEnabled, setAutonextEnabled] = useState(true);

  const playlistIdFromURL = useMemo(() => {
    return new URLSearchParams(location.search).get("pl");
  }, [location.search]);

  const isPlaylistMode = Boolean(playlistIdFromURL);

  // ------------------------------------------------------------
  // 2. Ensure GlobalPlayer mounts
  // ------------------------------------------------------------
  useEffect(() => {
    GlobalPlayer.ensureMounted();
  }, []);

  // ------------------------------------------------------------
  // 3. Set autonext mode based on URL
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // 4. Load video when ID changes
  // ------------------------------------------------------------
  useEffect(() => {
    if (!id) return;
    debugBus.log("Watch.jsx → load(" + id + ")");
    loadVideo(id);
  }, [id, loadVideo]);

  // ------------------------------------------------------------
  // 5. Fetch video details + related
  // ------------------------------------------------------------
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
      } catch (err) {
        debugBus.error("Watch.jsx → fetch error", err);
        setRelated([]);
      }
    }

    fetchData();
  }, [id]);

  // ------------------------------------------------------------
  // 6. Autonext lifecycle (playlist + related)
  // ------------------------------------------------------------
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
    };

    const relatedHandler = () => {
      if (!autonextEnabled) return;
      if (!related.length) return;

      const next = related[0];
      const nextId = next?.id;
      if (!nextId) return;

      navigate(`/watch/${nextId}?src=related`);
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
    navigate
  ]);

  // ------------------------------------------------------------
  // 7. UI handlers
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // 8. Render
  // ------------------------------------------------------------
  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      <div
        id="player"
        style={{
          width: "100%",
          height: "220px",
          background: "#000",
          marginBottom: "12px"
        }}
      />

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
