/**
 * File: Watch.jsx
 * Path: src/pages/Watch/Watch.jsx
 * Description: Full video watch page with safe destructuring, normalized IDs,
 *              YouTube-only related fallback, autonext integration, collapsible
 *              description, and tap-to-show skip controls overlay.
 */

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePlayer } from "../../player/PlayerContext.jsx";
import { AutonextEngine } from "../../player/AutonextEngine.js";
import { getApiKey } from "../../api/getApiKey.js";
import { GlobalPlayer } from "../../player/GlobalPlayer.js";
import { debugBus } from "../../debug/debugBus.js";

const API_KEY = getApiKey();

/* ------------------------------------------------------------
   Shared card styles for Related videos
------------------------------------------------------------- */
const cardStyle = {
  width: "100%",
  marginBottom: "16px",
  textDecoration: "none",
  color: "#fff",
  display: "block"
};

const thumbStyle = {
  width: "100%",
  aspectRatio: "16 / 9",
  objectFit: "cover",
  borderRadius: "8px",
  marginBottom: "8px"
};

const titleStyle = {
  fontSize: "14px",
  fontWeight: "bold",
  marginBottom: "4px"
};

const channelStyle = {
  fontSize: "12px",
  opacity: 0.7,
  marginBottom: "4px"
};

const descStyle = {
  fontSize: "12px",
  opacity: 0.8,
  lineHeight: 1.4
};

/* ------------------------------------------------------------
   Component
------------------------------------------------------------- */
export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const player = usePlayer() ?? {};
  const loadVideo = player.loadVideo ?? (() => {});
  const queueAdd = player.queueAdd ?? (() => {});
  const autonextMode = player.autonextMode ?? "related";
  const setAutonextMode = player.setAutonextMode ?? (() => {});

  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [descExpanded, setDescExpanded] = useState(false);

  const relatedRef = useRef([]);
  useEffect(() => {
    relatedRef.current = related;
  }, [related]);

  /* ------------------------------------------------------------
     Ensure GlobalPlayer knows #player exists (retry loop)
  ------------------------------------------------------------- */
  useEffect(() => {
    GlobalPlayer.ensureMounted();
  }, []);

  /* ------------------------------------------------------------
     Load video + fetch metadata when ID changes
  ------------------------------------------------------------- */
  useEffect(() => {
    if (!id) return;

    debugBus.log("PLAYER", `Watch.jsx → loadVideo(${id})`);
    loadVideo(id);

    fetchVideoDetails(id);
    fetchRelated(id);
  }, [id]);

  /* ------------------------------------------------------------
     Autonext (related)
  ------------------------------------------------------------- */
  useEffect(() => {
    AutonextEngine.registerRelatedCallback(() => {
      debugBus.log("PLAYER", "Watch.jsx → Autonext (related) triggered");

      const list = relatedRef.current;
      if (!Array.isArray(list) || list.length === 0) {
        debugBus.log("PLAYER", "Watch.jsx → No related videos available");
        return;
      }

      const next = list[0]?.id ?? null;

      if (!next) {
        debugBus.log("PLAYER", "Watch.jsx → Related[0] missing ID");
        return;
      }

      debugBus.log("PLAYER", `Watch.jsx → Autonext → ${next}`);
      navigate(`/watch/${next}`);
      loadVideo(next);
    });
  }, [navigate, loadVideo]);

  /* ------------------------------------------------------------
     Fetch video details
  ------------------------------------------------------------- */
  async function fetchVideoDetails(videoId) {
    try {
      const url =
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,statistics&id=${videoId}&key=${API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      const items = Array.isArray(data?.items) ? data.items : [];
      setVideo(items[0] ?? null);

      if (!items.length) {
        debugBus.log("PLAYER", "Watch.jsx → fetchVideoDetails returned 0 items");
      }
    } catch (err) {
      debugBus.log(
        "PLAYER",
        "Watch.jsx → fetchVideoDetails error: " + (err?.message || err)
      );
      setVideo(null);
    }
  }

  /* ------------------------------------------------------------
     Fetch related videos (YouTube-only fallback)
  ------------------------------------------------------------- */
  async function fetchRelated(videoId) {
    try {
      const urlRelated =
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&videoEmbeddable=true&relatedToVideoId=${videoId}` +
        `&maxResults=10&key=${API_KEY}`;

      const res1 = await fetch(urlRelated);
      const data1 = await res1.json();

      const items1 = Array.isArray(data1?.items) ? data1.items : [];

      if (items1.length > 0) {
        const normalized = items1.map((item) => ({
          id: item.id?.videoId ?? item.id ?? null,
          snippet: item.snippet ?? {}
        }));

        debugBus.log(
          "NETWORK",
          `Watch.jsx → Related API returned ${normalized.length} items`
        );
        setRelated(normalized);
        return;
      }

      debugBus.log(
        "NETWORK",
        "Watch.jsx → relatedToVideoId returned 0 items, falling back to keyword search"
      );

      const title = video?.snippet?.title;

      if (!title) {
        debugBus.log(
          "NETWORK",
          "Watch.jsx → Waiting for video title before fallback"
        );
        return;
      }

      const urlKeyword =
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&videoEmbeddable=true&q=${encodeURIComponent(
          title
        )}` +
        `&maxResults=10&key=${API_KEY}`;

      const res2 = await fetch(urlKeyword);
      const data2 = await res2.json();

      const items2 = Array.isArray(data2?.items) ? data2.items : [];

      if (items2.length === 0) {
        debugBus.log(
          "NETWORK",
          "Watch.jsx → Keyword fallback also returned 0 items"
        );
        setRelated([]);
        return;
      }

      const normalizedFallback = items2.map((item) => ({
        id: item.id?.videoId ?? item.id ?? null,
        snippet: item.snippet ?? {}
      }));

      debugBus.log(
        "NETWORK",
        `Watch.jsx → Keyword fallback returned ${normalizedFallback.length} items`
      );
      setRelated(normalizedFallback);
    } catch (err) {
      debugBus.log(
        "NETWORK",
        "Watch.jsx → fetchRelated error: " + (err?.message || err)
      );
      setRelated([]);
    }
  }

  /* ------------------------------------------------------------
     2nd attempt: run fallback AFTER video details load
  ------------------------------------------------------------- */
  useEffect(() => {
    if (video && id) {
      debugBus.log(
        "NETWORK",
        "Watch.jsx → Retrying related fetch after video loaded"
      );
      fetchRelated(id);
    }
  }, [video]);

  /* ------------------------------------------------------------
     Loading state
  ------------------------------------------------------------- */
  if (!video) {
    return (
      <div style={{ padding: "16px", color: "#fff", marginTop: "60px" }}>
        Loading video…
      </div>
    );
  }

  /* ------------------------------------------------------------
     Render
  ------------------------------------------------------------- */
  const sn = video?.snippet ?? {};
  const title = sn?.title ?? "Untitled";
  const description = sn?.description ?? "";

  return (
    <div
      style={{
        paddingBottom: "80px",
        color: "#fff",
        marginTop: "60px"
      }}
    >
      {/* Player container (16:9) */}
      <div
        style={{
          width: "100%",
          position: "relative",
          paddingTop: "56.25%",
          background: "#000"
        }}
      >
        <div
          id="player"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%"
          }}
        ></div>

        {/* Tap overlay with skip controls */}
        <PlayerOverlay related={related} navigate={navigate} />
      </div>

      <h2 style={{ padding: "16px" }}>{title}</h2>

      {/* Collapsible description */}
      <div style={{ padding: "0 16px 16px" }}>
        <div
          style={{
            opacity: 0.85,
            lineHeight: 1.4,
            maxHeight: descExpanded ? "none" : "3.6em",
            overflow: "hidden",
            transition: "max-height 0.2s ease"
          }}
        >
          {description}
        </div>

        <button
          onClick={() => setDescExpanded(!descExpanded)}
          style={{
            marginTop: "6px",
            background: "none",
            border: "none",
            color: "#3ea6ff",
            fontSize: "14px",
            cursor: "pointer",
            padding: 0
          }}
        >
          {descExpanded ? "Show less" : "Show more"}
        </button>
      </div>

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
        <h3 style={{ marginBottom: "12px" }}>Related Videos</h3>

        {related.map((item, i) => {
          const vid = item?.id ?? null;
          const rsn = item?.snippet ?? {};
          const thumb = rsn?.thumbnails?.medium?.url ?? "";

          if (!vid) return null;

          return (
            <Link
              key={vid + "_" + i}
              to={`/watch/${vid}`}
              style={cardStyle}
            >
              <img
                src={thumb}
                alt={rsn.title ?? "Video thumbnail"}
                style={thumbStyle}
              />

              <div style={titleStyle}>{rsn.title ?? "Untitled"}</div>
              <div style={channelStyle}>
                {rsn.channelTitle ?? "Unknown Channel"}
              </div>
              <div style={descStyle}>{rsn.description ?? ""}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Tap-to-show overlay with skip controls
------------------------------------------------------------- */
function PlayerOverlay({ related, navigate }) {
  const [visible, setVisible] = React.useState(false);
  const hideTimer = React.useRef(null);

  function show() {
    setVisible(true);

    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
    }, 2000);
  }

  function skipBack() {
    const t = GlobalPlayer.player?.getCurrentTime?.() || 0;

    if (t < 3 && related.length > 1) {
      const prev = related[1]?.id;
      if (prev) navigate(`/watch/${prev}`);
    } else {
      GlobalPlayer.player?.seekTo?.(0, true);
    }
  }

  function skipNext() {
    const next = related[0]?.id;
    if (next) navigate(`/watch/${next}`);
  }

  return (
    <div
      onClick={show}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 20,
        cursor: "pointer",
        pointerEvents: visible ? "auto" : "none"   // ⭐ FIX: YouTube play button works again
      }}
    >
      {visible && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "20px",
            zIndex: 30
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              skipBack();
            }}
            style={{
              padding: "10px 16px",
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              border: "1px solid #444",
              borderRadius: "6px"
            }}
          >
            ⏮ Back
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              skipNext();
            }}
            style={{
              padding: "10px 16px",
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              border: "1px solid #444",
              borderRadius: "6px"
            }}
          >
            ⏭ Next
          </button>
        </div>
      )}
    </div>
  );
}
