// File: src/pages/Watch.jsx
// PCC v10.0 — Immediate player, fixed 16:9, stable GlobalPlayer reactivation

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DebugOverlay from "../components/DebugOverlay";
import Player from "../components/Player";
import { usePlayer } from "../contexts/PlayerContext";

const INVIDIOUS_BASE = "https://yewtu.be";

export default function Watch() {
  const { id } = useParams();
  const { playVideo, playing } = usePlayer();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sourceUsed, setSourceUsed] = useState(null);

  const log = (msg) => window.debugLog?.(`Watch: ${msg}`);

  // Disable GlobalPlayer while Watch is active
  useEffect(() => {
    window.__GLOBAL_AUDIO_ENABLED = false;
    log("Global audio engine disabled for Watch page");

    return () => {
      window.__GLOBAL_AUDIO_ENABLED = true;
      log("Global audio engine re-enabled after leaving Watch page");
    };
  }, []);

  // -------------------------------
  // Fetchers
  // -------------------------------
  async function fetchFromInvidious(id) {
    const url = `${INVIDIOUS_BASE}/api/v1/videos/${id}`;
    log(`Trying Invidious: ${url}`);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      log(`Invidious failed: ${err}`);
      return null;
    }
  }

  async function fetchFromYouTube(id) {
    log("Fallback → YouTube API");

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${id}&key=${window.YT_API_KEY}`
      );
      const data = await res.json();
      return data.items?.[0] || null;
    } catch (err) {
      log(`YouTube failed: ${err}`);
      return null;
    }
  }

  // -------------------------------
  // Thumbnail resolver
  // -------------------------------
  const getThumbnail = (v) => {
    if (!v) return null;

    if (Array.isArray(v.videoThumbnails) && v.videoThumbnails.length > 0) {
      const best = v.videoThumbnails[v.videoThumbnails.length - 1];
      if (best?.url) {
        if (best.url.startsWith("http")) return best.url;
        return `${INVIDIOUS_BASE}${best.url}`;
      }
    }

    if (typeof v.thumbnail === "string") {
      if (v.thumbnail.startsWith("http")) return v.thumbnail;
      if (v.thumbnail.startsWith("/")) return `${INVIDIOUS_BASE}${v.thumbnail}`;
      return v.thumbnail;
    }

    const thumbs = v.snippet?.thumbnails;
    if (thumbs?.maxres?.url) return thumbs.maxres.url;
    if (thumbs?.high?.url) return thumbs.high.url;
    if (thumbs?.medium?.url) return thumbs.medium.url;
    if (thumbs?.default?.url) return thumbs.default.url;

    return null;
  };

  // -------------------------------
  // Normalizer
  // -------------------------------
  const normalizeVideo = (v) => {
    if (!v) return null;

    if (v.videoId || v.formatStreams || v.adaptiveFormats) {
      const thumb = getThumbnail(v);
      log(`Resolved Invidious thumbnail: ${thumb}`);

      return {
        id: v.videoId || id,
        title: v.title,
        author: v.author,
        description: v.description,
        thumbnail: thumb,
        invidious: v,
      };
    }

    if (v.id && v.snippet) {
      const vid = typeof v.id === "string" ? v.id : v.id.videoId;
      const thumb = getThumbnail(v);
      log(`Resolved YouTube thumbnail: ${thumb}`);

      return {
        id: vid,
        title: v.snippet.title,
        author: v.snippet.channelTitle,
        description: v.snippet.description,
        thumbnail: thumb,
        youtube: v,
      };
    }

    return null;
  };

  // -------------------------------
  // Loader
  // -------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);
      setSourceUsed(null);

      let raw = await fetchFromInvidious(id);
      if (raw && raw.title) {
        setSourceUsed("INVIDIOUS");
      } else {
        raw = await fetchFromYouTube(id);
        if (raw) setSourceUsed("YOUTUBE_API");
      }

      log("Raw video object: " + JSON.stringify(raw)?.slice(0, 300));

      const normalized = normalizeVideo(raw);
      setVideo(normalized);

      if (normalized) {
        log(`Calling playVideo for id=${normalized.id}`);
        playVideo(normalized);
      } else {
        log("No video data available after all fallbacks");
      }

      setLoading(false);
    }

    load();
  }, [id]);

  // -------------------------------
  // Derived embed URL
  // -------------------------------
  const embedUrl =
    video && video.id
      ? `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1`
      : null;

  // -------------------------------
  // Render
  // -------------------------------
  if (loading) {
    return (
      <>
        <DebugOverlay pageName="Watch" sourceUsed={sourceUsed} />
        <p style={{ color: "#fff", padding: 16 }}>Loading…</p>
      </>
    );
  }

  if (!video) {
    return (
      <>
        <DebugOverlay pageName="Watch" sourceUsed={sourceUsed} />
        <p style={{ color: "#fff", padding: 16 }}>Unable to load this video.</p>
      </>
    );
  }

  return (
    <>
      <DebugOverlay pageName="Watch" sourceUsed={sourceUsed} />

      <div style={{ padding: 16, color: "#fff" }}>
        {/* Immediate Player */}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%", // 16:9
            borderRadius: 12,
            overflow: "hidden",
            background: "#000",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
            }}
          >
            <Player embedUrl={embedUrl} playing={playing} />
          </div>
        </div>

        <h2>{video.title}</h2>
        <p style={{ opacity: 0.7 }}>{video.author}</p>
      </div>
    </>
  );
}
