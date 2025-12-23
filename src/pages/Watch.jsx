// File: src/pages/Watch.jsx
// PCC v13.0 — YouTube API only, UI-only Player, global iframe controls + related-fed autonext

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DebugOverlay from "../components/DebugOverlay";
import Player from "../components/Player";
import RelatedVideos from "../components/RelatedVideos";
import { usePlayer } from "../contexts/PlayerContext";

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
  // YouTube fetcher
  // -------------------------------
  async function fetchFromYouTube(videoId) {
    const apiKey = window.YT_API_KEY;
    if (!apiKey) {
      log("ERROR: No YT_API_KEY on window for Watch");
      return null;
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

      setSourceUsed("YOUTUBE_API");
      return data.items[0];
    } catch (err) {
      log(`ERROR: YouTube failed: ${err}`);
      return null;
    }
  }

  // -------------------------------
  // Thumbnail resolver
  // -------------------------------
  const getThumbnail = (v) => {
    if (!v) return null;
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
    if (!v || !v.id || !v.snippet) return null;

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
        // Single-video context: let autonext use "related" by default
        setPlaylist([normalized]);
        setCurrentIndex(0);
        setAutonextMode("related"); // Discovery mode
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
        {/* Hero Player (UI-only, uses global iframe for audio/video) */}
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
          <div style={{ position: "absolute", inset: 0 }}>
            {/* Player no longer takes embedUrl; it just controls global state */}
            <Player embedUrl={null} playing={playing} />
          </div>
        </div>

        <h2>{video.title}</h2>
        <p style={{ opacity: 0.7 }}>{video.author}</p>

        {/* Related Videos */}
        <RelatedVideos
          videoId={video.id}
          title={video.title}
          onDebugLog={(msg) => log(msg)}
          onLoaded={(list) => {
            const count = Array.isArray(list) ? list.length : 0;
            log(`RelatedVideos loaded ${count} items for autonext`);
            // For related-mode autonext, we store the raw list in PlayerContext
            setRelatedList(Array.isArray(list) ? list : []);
          }}
        />
      </div>
    </>
  );
}
