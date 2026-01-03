/**
 * File: src/pages/Watch/Watch.jsx
 * Description:
 *   YouTube-only Watch page.
 *   - Fetches video metadata via YouTube Data API v3
 *   - Fetches related videos
 *   - Fetches playlist items
 *   - Registers autonext callbacks (playlist or related)
 *   - Integrates with GlobalPlayer + AutonextEngine
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { GlobalPlayer } from "../../player/GlobalPlayer.js";
import { AutonextEngine } from "../../player/AutonextEngine.js";
import { debugBus } from "../../debug/debugBus.js";

// ⭐ Force Vite to include AutonextEngine
console.log("AutonextEngine loaded:", AutonextEngine);

// API keys
const API_KEYS = [
  import.meta.env.VITE_YT_API_PRIMARY,
  import.meta.env.VITE_YT_API_FALLBACK1
];

// Helper: try primary key, fallback if quota exceeded
async function ytFetch(urlBuilder) {
  for (const key of API_KEYS) {
    const url = urlBuilder(key);
    const res = await fetch(url);
    const json = await res.json();

    // Quota exceeded or error?
    if (json.error) {
      console.warn("YouTube API error:", json.error);
      continue;
    }

    return json;
  }

  return null;
}

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [videoData, setVideoData] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [playlistId, setPlaylistId] = useState(null);
  const [playlistItems, setPlaylistItems] = useState([]);

  /* ------------------------------------------------------------
     Extract playlist ID from query string
  ------------------------------------------------------------ */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get("list");
    setPlaylistId(pid || null);
  }, [location.search]);

  /* ------------------------------------------------------------
     Fetch video metadata
  ------------------------------------------------------------ */
  useEffect(() => {
    async function fetchVideo() {
      debugBus.player("Watch.jsx → fetching video metadata");

      const json = await ytFetch(
        (key) =>
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${key}`
      );

      if (!json || !json.items || !json.items.length) {
        debugBus.error("Watch.jsx → video fetch error", json);
        return;
      }

      setVideoData(json.items[0]);
    }

    fetchVideo();
  }, [id]);

  /* ------------------------------------------------------------
     Fetch related videos
  ------------------------------------------------------------ */
  useEffect(() => {
    async function fetchRelated() {
      debugBus.player("Watch.jsx → fetching related videos");

      const json = await ytFetch(
        (key) =>
          `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${id}&type=video&maxResults=20&key=${key}`
      );

      if (!json || !json.items) return;

      setRelatedVideos(json.items);
    }

    fetchRelated();
  }, [id]);

  /* ------------------------------------------------------------
     Fetch playlist items (if in playlist mode)
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!playlistId) {
      setPlaylistItems([]);
      return;
    }

    async function fetchPlaylist() {
      debugBus.player("Watch.jsx → fetching playlist items");

      const json = await ytFetch(
        (key) =>
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${key}`
      );

      if (!json || !json.items) return;

      setPlaylistItems(json.items);
    }

    fetchPlaylist();
  }, [playlistId]);

  /* ------------------------------------------------------------
     Autonext: playlist mode
  ------------------------------------------------------------ */
  function goToNextPlaylistVideo() {
    debugBus.player("Watch.jsx → goToNextPlaylistVideo()");

    if (!playlistItems.length) return;

    const index = playlistItems.findIndex(
      (v) => v.contentDetails.videoId === id
    );

    const next = playlistItems[index + 1];
    if (!next) return;

    navigate(`/watch/${next.contentDetails.videoId}?list=${playlistId}`);
  }

  /* ------------------------------------------------------------
     Autonext: related mode
  ------------------------------------------------------------ */
  function goToNextRelatedVideo() {
    debugBus.player("Watch.jsx → goToNextRelatedVideo()");

    if (!relatedVideos.length) return;

    const next = relatedVideos[0];
    if (!next) return;

    navigate(`/watch/${next.id.videoId}`);
  }

  /* ------------------------------------------------------------
     Register autonext callbacks
  ------------------------------------------------------------ */
  useEffect(() => {
    debugBus.player("Watch.jsx → registering autonext callbacks");

    AutonextEngine.registerPlaylistCallback(null);
    AutonextEngine.registerRelatedCallback(null);

    if (playlistId) {
      AutonextEngine.registerPlaylistCallback(() => {
        goToNextPlaylistVideo();
      });
    } else {
      AutonextEngine.registerRelatedCallback(() => {
        goToNextRelatedVideo();
      });
    }

    return () => {
      debugBus.player("Watch.jsx → cleanup autonext callbacks");
      AutonextEngine.registerPlaylistCallback(null);
      AutonextEngine.registerRelatedCallback(null);
    };
  }, [id, playlistId, playlistItems, relatedVideos]);

  /* ------------------------------------------------------------
     Render
  ------------------------------------------------------------ */
  if (!videoData) {
    return (
      <div style={{ padding: "20px", color: "#fff" }}>
        Loading video…
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: "80px" }}>
      <GlobalPlayer videoId={id} />

      <div style={{ padding: "16px" }}>
        <h2>{videoData.snippet.title}</h2>
        <p>{videoData.snippet.channelTitle}</p>
      </div>

      {/* Related videos */}
      {!playlistId && (
        <div style={{ padding: "16px" }}>
          <h3>Related</h3>
          {relatedVideos.map((v) => (
            <div
              key={v.id.videoId}
              style={{ marginBottom: "12px", cursor: "pointer" }}
              onClick={() => navigate(`/watch/${v.id.videoId}`)}
            >
              {v.snippet.title}
            </div>
          ))}
        </div>
      )}

      {/* Playlist items */}
      {playlistId && (
        <div style={{ padding: "16px" }}>
          <h3>Playlist</h3>
          {playlistItems.map((v) => (
            <div
              key={v.contentDetails.videoId}
              style={{ marginBottom: "12px", cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `/watch/${v.contentDetails.videoId}?list=${playlistId}`
                )
              }
            >
              {v.snippet.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
