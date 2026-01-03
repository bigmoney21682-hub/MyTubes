/**
 * File: src/pages/Watch/Watch.jsx
 * Description:
 *   Video watch page.
 *   Handles:
 *     - fetching video data
 *     - playlist mode vs related mode
 *     - registering autonext callbacks
 *     - cleaning up callbacks on unmount
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import GlobalPlayer from "../../player/GlobalPlayer.js";
import { AutonextEngine } from "../../player/AutonextEngine.js";
import { debugBus } from "../../debug/debugBus.js";

// ⭐ Force Vite to include AutonextEngine
console.log("AutonextEngine loaded:", AutonextEngine);

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [videoData, setVideoData] = useState(null);
  const [playlistId, setPlaylistId] = useState(null);
  const [playlistItems, setPlaylistItems] = useState([]);

  // Extract playlist ID from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get("list");
    setPlaylistId(pid || null);
  }, [location.search]);

  /**
   * Fetch video data
   */
  useEffect(() => {
    async function fetchVideo() {
      try {
        const res = await fetch(
          `https://pipedapi.kavin.rocks/streams/${id}`
        );
        const json = await res.json();
        setVideoData(json);
      } catch (err) {
        debugBus.error("Watch.jsx → video fetch error", err);
      }
    }

    fetchVideo();
  }, [id]);

  /**
   * Fetch playlist items if in playlist mode
   */
  useEffect(() => {
    if (!playlistId) {
      setPlaylistItems([]);
      return;
    }

    async function fetchPlaylist() {
      try {
        const res = await fetch(
          `https://pipedapi.kavin.rocks/playlists/${playlistId}`
        );
        const json = await res.json();
        setPlaylistItems(json.relatedStreams || []);
      } catch (err) {
        debugBus.error("Watch.jsx → playlist fetch error", err);
      }
    }

    fetchPlaylist();
  }, [playlistId]);

  /**
   * Autonext: playlist mode
   */
  function goToNextPlaylistVideo() {
    debugBus.player("Watch.jsx → goToNextPlaylistVideo()");

    if (!playlistItems.length) return;

    const index = playlistItems.findIndex((v) => v.url.includes(id));
    const next = playlistItems[index + 1];

    if (!next) {
      debugBus.player("Playlist ended");
      return;
    }

    navigate(`/watch/${next.url.split("/").pop()}?list=${playlistId}`);
  }

  /**
   * Autonext: related mode
   */
  function goToNextRelatedVideo() {
    debugBus.player("Watch.jsx → goToNextRelatedVideo()");

    if (!videoData?.relatedStreams?.length) return;

    const next = videoData.relatedStreams[0];
    if (!next) return;

    navigate(`/watch/${next.url.split("/").pop()}`);
  }

  /**
   * Register autonext callbacks
   */
  useEffect(() => {
    debugBus.player("Watch.jsx → registering autonext callbacks");

    // Clear both first
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
  }, [id, playlistId, playlistItems, videoData]);

  /**
   * Render
   */
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
        <h2>{videoData.title}</h2>
        <p>{videoData.uploader}</p>
      </div>

      {/* Related videos */}
      {!playlistId && (
        <div style={{ padding: "16px" }}>
          <h3>Related</h3>
          {videoData.relatedStreams?.map((v) => (
            <div
              key={v.url}
              style={{ marginBottom: "12px", cursor: "pointer" }}
              onClick={() =>
                navigate(`/watch/${v.url.split("/").pop()}`)
              }
            >
              {v.title}
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
              key={v.url}
              style={{ marginBottom: "12px", cursor: "pointer" }}
              onClick={() =>
                navigate(`/watch/${v.url.split("/").pop()}?list=${playlistId}`)
              }
            >
              {v.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
