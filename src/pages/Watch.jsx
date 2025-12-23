// File: src/pages/Watch.jsx
// PCC v14.0 — YouTube API only + in-memory caching + global player

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DebugOverlay from "../components/DebugOverlay";
import Player from "../components/Player";
import RelatedVideos from "../components/RelatedVideos";
import { usePlayer } from "../contexts/PlayerContext";
import { getCached, setCached } from "../utils/youtubeCache";

export default function Watch() {
  const { id } = useParams();

  const {
    playVideo,
    playing,
    setAutonextMode,
    setRelatedList,
    setPlaylist,
    setCurrentIndex,
  } = usePlayer();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sourceUsed, setSourceUsed] = useState(null);

  const log = (msg) => window.debugLog?.(`Watch: ${msg}`);

  // -------------------------------
  // YouTube fetcher (with caching)
  // -------------------------------
  async function fetchFromYouTube(videoId) {
    const apiKey = window.YT_API_KEY;
    const cacheKey = `video_${videoId}`;

    const cached = getCached(cacheKey);
    if (cached) {
      log("DEBUG: Using cached video details");
      setSourceUsed("CACHE");
      return cached;
    }

    log("DEBUG: Fetching video details via YouTube API");

    try {
      const url =
        "https://www.googleapis.com/youtube/v3/videos" +
        `?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;

      log(`DEBUG: Video details URL → ${url}`);

      const res = await fetch(url);
      const data = await res.json();

      if (!data.items || !data.items.length) {
        log("ERROR: YouTube returned no items for this id");
        log("RAW: " + JSON.stringify(data).slice(0, 300));
        return null;
      }

      const item = data.items[0];
      setCached(cacheKey, item);
      setSourceUsed("YOUTUBE_API");
      return item;
    } catch (err) {
      log(`ERROR: YouTube failed: ${err}`);
      return null;
    }
  }

  // -------------------------------
  // Thumbnail resolver
  // -------------------------------
  const getThumbnail = (v) => {
    const t = v.snippet?.thumbnails;
    return (
      t?.maxres?.url ||
      t?.high?.url ||
      t?.medium?.url ||
      t?.default?.url ||
      null
    );
  };

  // -------------------------------
  // Normalizer
  // -------------------------------
  const normalizeVideo = (v) => {
    if (!v || !v.id || !v.snippet) return null;

    const vid = typeof v.id === "string" ? v.id : v.id.videoId;

    return {
      id: vid,
      title: v.snippet.title,
      author: v.snippet.channelTitle,
      description: v.snippet.description,
      thumbnail: getThumbnail(v),
      youtube: v,
    };
  };

  // -------------------------------
  // Loader
  // -------------------------------
  useEffect(() => {
    async function load() {
      const cleanId = String(id || "").trim();
      if (!cleanId) {
        log("No id in params, aborting Watch load");
        setVideo(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setSourceUsed(null);
      setVideo(null);

      const raw = await fetchFromYouTube(cleanId);
      log("Raw video object: " + JSON.stringify(raw)?.slice(0, 300));

      const normalized = normalizeVideo(raw);
      setVideo(normalized);

      if (normalized) {
        log(`Calling playVideo for id=${normalized.id}`);
        setPlaylist([normalized]);
        setCurrentIndex(0);
        setAutonextMode("related");
        playVideo(normalized);
      } else {
        log("No video data available after YouTube fetch");
      }

      setLoading(false);
    }

    load();
  }, [id]);

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
        {/* Hero Player */}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%",
            borderRadius: 12,
            overflow: "hidden",
            background: "#000",
            marginBottom: 16,
          }}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            <Player embedUrl={null} playing={playing} />
          </div>
        </div>

        <h2>{video.title}</h2>
        <p style={{ opacity: 0.7 }}>{video.author}</p>

        <RelatedVideos
          videoId={video.id}
          title={video.title}
          onDebugLog={(msg) => log(msg)}
          onLoaded={(list) => {
            const count = Array.isArray(list) ? list.length : 0;
            log(`RelatedVideos loaded ${count} items for autonext`);
            setRelatedList(Array.isArray(list) ? list : []);
          }}
        />
      </div>
    </>
  );
}
