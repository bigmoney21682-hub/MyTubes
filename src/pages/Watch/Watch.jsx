/**
 * File: Watch.jsx
 * Path: src/pages/Watch.jsx
 * Description: Full video watch page. Loads video via PlayerContext + GlobalPlayer,
 *              fetches video details + related videos, registers autonext callback,
 *              and provides queue + autonext controls.
 */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePlayer } from "../../player/PlayerContext.jsx";
import { AutonextEngine } from "../player/AutonextEngine.js";
import { debugBus } from "../debug/debugBus.js";

const API_KEY = import.meta.env.VITE_YT_API_KEY;

export default function Watch() {
  const { id } = useParams();
  const {
    loadVideo,
    queueAdd,
    autonextMode,
    setAutonextMode
  } = usePlayer();

  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);

  // ------------------------------------------------------------
  // Load video on route change
  // ------------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    debugBus.player("Watch.jsx → loadVideo(" + id + ")");
    loadVideo(id);

    fetchVideoDetails(id);
    fetchRelated(id);

    // Register autonext callback for "related" mode
    AutonextEngine.registerRelatedCallback(() => {
      debugBus.player("Watch.jsx → Autonext (related) triggered");

      if (related.length > 0) {
        const next = related[0].id.videoId;
        debugBus.player("Watch.jsx → Autonext → " + next);
        loadVideo(next);
      } else {
        debugBus.player("Watch.jsx → No related videos available");
      }
    });
  }, [id]);

  // ------------------------------------------------------------
  // Fetch video details
  // ------------------------------------------------------------
  async function fetchVideoDetails(videoId) {
  try {
    const url =
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet,statistics&id=${videoId}&key=${API_KEY}`;


      const res = await fetch(url);
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        setVideo(data.items[0]);
      }
    } catch (err) {
      debugBus.player("Watch.jsx → fetchVideoDetails error: " + err?.message);
    }
  }

  // ------------------------------------------------------------
  // Fetch related videos
  // ------------------------------------------------------------
  async function fetchRelated(videoId) {
    try {
      const url =
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&relatedToVideoId=${videoId}&key=${API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.items) {
        setRelated(data.items);
      }
    } catch (err) {
      debugBus.player("Watch.jsx → fetchRelated error: " + err?.message);
    }
  }

  if (!video) {
    return (
      <div style={{ padding: "16px", color: "#fff" }}>
        Loading video…
      </div>
    );
  }

  const snippet = video.snippet;

  return (
    <div style={{ paddingBottom: "80px", color: "#fff" }}>
      {/* Title */}
      <h2 style={{ padding: "16px" }}>{snippet.title}</h2>

      {/* Autonext toggle */}
      <div style={{ padding: "16px" }}>
        <label style={{ marginRight: "12px" }}>Autonext:</label>
        <select
          value={autonextMode}
          onChange={(e) => setAutonextMode(e.target.value)}
          style={{ padding: "6px" }}
        >
          <option value="related">Related</option>
          <option value="playlist">Playlist</option>
        </select>
      </div>

      {/* Add to queue */}
      <div style={{ padding: "16px" }}>
        <button
          onClick={() => queueAdd(id)}
          style={{
            padding: "10px 16px",
            background: "#222",
            color: "#fff",
            border: "1px solid #444",
            borderRadius: "4px"
          }}
        >
          + Add to Queue
        </button>
      </div>

      {/* Related videos */}
      <div style={{ padding: "16px" }}>
        <h3>Related Videos</h3>

        {related.map((item) => {
          const vid = item.id.videoId;
          const sn = item.snippet;

          return (
            <a
              key={vid}
              href={`/watch/${vid}`}
              style={{
                display: "flex",
                marginBottom: "12px",
                textDecoration: "none",
                color: "#fff"
              }}
            >
              <img
                src={sn.thumbnails.medium.url}
                alt=""
                style={{
                  width: "168px",
                  height: "94px",
                  objectFit: "cover",
                  borderRadius: "4px",
                  marginRight: "12px"
                }}
              />
              <div>
                <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                  {sn.title}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.7 }}>
                  {sn.channelTitle}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
