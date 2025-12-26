// File: src/pages/Watch.jsx
// Clean YouTube-only Watch page aligned with PlayerContext.playVideo
// and fixed GlobalPlayer layout (16:9, fixed position)

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";

export default function Watch() {
  const [params] = useSearchParams();
  const id = params.get("v");

  const navigate = useNavigate();
  const { playVideo } = usePlayer();

  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // ------------------------------------------------------------
  // Fetch main video details (YouTube Data API)
  // ------------------------------------------------------------
  async function fetchVideo() {
    if (!id) return;

    setLoadingVideo(true);
    setVideo(null);

    try {
      const key = import.meta.env.VITE_YT_API_PRIMARY;

      const yt = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${id}&key=${key}`
      );

      const data = await yt.json();
      window.debugApi?.("/youtube/video", key);

      if (!data.items || data.items.length === 0) {
        window.debugLog?.(`No video found for id=${id}`, "ERROR");
        setLoadingVideo(false);
        return;
      }

      const v = data.items[0];

      const videoObj = {
        id,
        title: v.snippet.title,
        channel: v.snippet.channelTitle,
        thumbnail: v.snippet.thumbnails?.medium?.url,
      };

      setVideo(videoObj);

      // Tell GlobalPlayer to play this video
      playVideo({
        id,
        title: v.snippet.title,
        channelTitle: v.snippet.channelTitle,
        thumbnail: v.snippet.thumbnails?.medium?.url,
      });

      setLoadingVideo(false);
    } catch (err) {
      window.debugLog?.(
        `Error fetching video for id=${id}: ${err.message}`,
        "ERROR"
      );
      setLoadingVideo(false);
    }
  }

  // ------------------------------------------------------------
  // Fetch related videos (YouTube Data API)
  // ------------------------------------------------------------
  async function fetchRelated() {
    if (!id) return;

    setLoadingRelated(true);
    setRelated([]);

    try {
      const key = import.meta.env.VITE_YT_API_PRIMARY;

      // FIXED: YouTube requires BOTH "relatedToVideoId" AND "type=video"
      const yt = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${id}&type=video&maxResults=25&key=${key}`
      );

      const data = await yt.json();
      window.debugApi?.("/youtube/related", key);

      if (!data.items) {
        window.debugLog?.(`No related videos for id=${id}`, "ERROR");
        setLoadingRelated(false);
        return;
      }

      const mapped = data.items.map((v) => ({
        id: v.id.videoId,
        title: v.snippet.title,
        channel: v.snippet.channelTitle,
        thumbnail: v.snippet.thumbnails?.medium?.url,
      }));

      setRelated(mapped);
      setLoadingRelated(false);
    } catch (err) {
      window.debugLog?.(
        `Error fetching related for id=${id}: ${err.message}`,
        "ERROR"
      );
      setLoadingRelated(false);
    }
  }

  // ------------------------------------------------------------
  // React to ID changes
  // ------------------------------------------------------------
  useEffect(() => {
    if (!id) return;
    window.debugLog?.(`Watch mounted for id=${id}`, "WATCH");
    fetchVideo();
    fetchRelated();
  }, [id]);

  if (!id) {
    return (
      <div style={{ color: "#fff", padding: 16 }}>
        Invalid video
      </div>
    );
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div
      style={{
        // Leave space for the fixed GlobalPlayer (16:9) + header
        paddingTop: "calc(56.25vw + var(--header-height))",
        paddingBottom: "var(--footer-height)",
      }}
    >
      {/* Main video metadata */}
      {loadingVideo && (
        <div style={{ color: "#fff", padding: 16 }}>Loading…</div>
      )}

      {!loadingVideo && video && (
        <div style={{ padding: 12 }}>
          <div
            style={{
              color: "#fff",
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            {video.title}
          </div>
          <div style={{ color: "#aaa" }}>{video.channel}</div>
        </div>
      )}

      {/* Related section */}
      <div style={{ padding: 12, color: "#fff", fontSize: 18 }}>
        Related
      </div>

      {loadingRelated && (
        <div style={{ color: "#fff", padding: 16 }}>Loading related…</div>
      )}

      {!loadingRelated &&
        related.map((v) => (
          <div
            key={v.id}
            onClick={() => navigate(`/watch?v=${v.id}`)}
            style={{
              display: "flex",
              marginBottom: 12,
              cursor: "pointer",
            }}
          >
            <img
              src={v.thumbnail}
              style={{
                width: 160,
                height: 90,
                borderRadius: 8,
                objectFit: "cover",
                marginRight: 12,
              }}
              alt=""
            />

            <div style={{ flexGrow: 1 }}>
              <div
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {v.title}
              </div>
              <div style={{ color: "#aaa", fontSize: 13 }}>
                {v.channel}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
