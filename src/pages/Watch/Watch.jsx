/**
 * File: src/pages/Watch/Watch.jsx
 * Description:
 *   Stable Watch page with:
 *   - YouTube API script loader
 *   - Lazy player creation
 *   - Playlist + Related autonext
 *   - Autonext toggle
 *   - Add to playlist button
 */

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
  // 2. Load YouTube API script (correct place)
  // ------------------------------------------------------------
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      debugBus.log("YT API already loaded");
      GlobalPlayer.ensureMounted();
      return;
    }

    debugBus.log("Injecting YouTube API script");

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.id = "youtube-iframe-api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      debugBus.log("YouTube API ready (Watch.jsx)");
      GlobalPlayer.ensureMounted();
    };
  }, []);

  // ------------------------------------------------------------
  // 3. Set autonext mode
  // ------------------------------------------------------------
  useEffect(() => {
    if (isPlaylistMode) {
      setAutonextMode("playlist");
      setActivePlaylistId(playlistIdFromURL);
    } else {
      setAutonextMode("related");
      setActivePlaylistId(null);
    }
  }, [isPlaylistMode, playlistIdFromURL, setAutonextMode, setActivePlaylistId]);

  // ------------------------------------------------------------
  // 4. Load video
  // ------------------------------------------------------------
  useEffect(() => {
    if (!id) return;
    debugBus.log("Watch.jsx → load(" + id + ")");
    loadVideo(id);
  }, [id, loadVideo]);

  // ------------------------------------------------------------
  // 5. Fetch video + related
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
        const relatedJson = await relatedRes.json();
        setRelated(relatedJson.items || []);
      } catch (err) {
        debugBus.error("Watch.jsx fetch error", err);
      }
    }

    fetchData();
  }, [id]);

  // ------------------------------------------------------------
  // 6. Autonext lifecycle
  // ------------------------------------------------------------
  useEffect(() => {
    const playlistHandler = () => {
      if (!autonextEnabled) return;

      const playlist = playlists.find((p) => p.id === playlistIdFromURL);
      if (!playlist) return;

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
      if (!next?.id) return;

      navigate(`/watch/${next.id}?src=related`);
    };

    AutonextEngine.registerPlaylistCallback(playlistHandler);
    AutonextEngine.registerRelatedCallback(relatedHandler);

    return () => {
      AutonextEngine.registerPlaylistCallback(null);
      AutonextEngine.registerRelatedCallback(null);
    };
  }, [id, related, playlists, playlistIdFromURL, autonextEnabled, navigate]);

  // ------------------------------------------------------------
  // 7. UI
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
          <div style={{ opacity: 0.7, fontSize: "13px" }}>
            {videoData.snippet.channelTitle}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <button
          onClick={() => setAutonextEnabled(!autonextEnabled)}
          style={{
            padding: "6px 10px",
            borderRadius: "999px",
            background: autonextEnabled ? "#22c55e" : "#4b5563",
            color: "#fff"
          }}
        >
          Autonext: {autonextEnabled ? "On" : "Off"}
        </button>

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
          Source: {isPlaylistMode ? "Playlist" : "Related"}
        </span>
      </div>
    </div>
  );
}
