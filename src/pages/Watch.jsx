// File: src/pages/Watch.jsx
// PCC v5.0 — Fully restored fetch logic + deep debug + global audio integration

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";
import Player from "../components/Player";

export default function Watch() {
  const { id } = useParams();
  const {
    playVideo,
    currentVideo,
    playing,
    playlist,
    currentIndex,
  } = usePlayer();

  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);

  const log = (msg) => window.debugLog?.(`Watch(${id}): ${msg}`);

  // ---------------------------------------------------------
  // Fetch video + related (Piped → Invidious → YouTube fallback)
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      log("DEBUG: Fetching video + related");

      let fetchedVideo = null;
      let fetchedRelated = [];

      // -----------------------------
      // 1) Try Piped video details
      // -----------------------------
      try {
        const res = await fetch(`https://pipedapi.kavin.rocks/videos/${id}`);
        const raw = await res.text();
        log(`DEBUG: Piped video raw: ${raw.slice(0, 200)}...`);

        fetchedVideo = JSON.parse(raw);
      } catch (err) {
        log(`DEBUG: Piped video fetch error: ${err}`);
      }

      // -----------------------------
      // 2) Try Piped related
      // -----------------------------
      try {
        const res = await fetch(
          `https://pipedapi.kavin.rocks/related/${id}`
        );
        const raw = await res.text();
        log(`DEBUG: Piped related raw: ${raw.slice(0, 200)}...`);

        fetchedRelated = JSON.parse(raw)?.relatedStreams || [];
      } catch (err) {
        log(`DEBUG: Piped related fetch error: ${err}`);
      }

      // -----------------------------
      // 3) If Piped failed → YouTube fallback
      // -----------------------------
      if (!fetchedVideo?.title) {
        log("DEBUG: Piped failed → YouTube fallback");

        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${window.YT_API_KEY}`
        );
        const ytData = await ytRes.json();

        fetchedVideo = ytData.items?.[0] || null;
      }

      if (!fetchedRelated?.length) {
        log("DEBUG: Related fallback → YouTube keyword search");

        const keyword = fetchedVideo?.title || "music";
        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
            keyword
          )}&key=${window.YT_API_KEY}`
        );
        const ytData = await ytRes.json();

        fetchedRelated = ytData.items || [];
      }

      // -----------------------------
      // Store results
      // -----------------------------
      setVideo(fetchedVideo);
      setRelated(fetchedRelated);

      log(
        `DEBUG: Video fetched -> title="${fetchedVideo?.title ||
          fetchedVideo?.snippet?.title}", related=${fetchedRelated.length}`
      );

      // -----------------------------
      // Call playVideo
      // -----------------------------
      playVideo(fetchedVideo, fetchedRelated);
      log("DEBUG: playVideo() called from Watch");
    }

    load();
  }, [id, playVideo]);

  // ---------------------------------------------------------
  // DEBUG: Track playVideo input
  // ---------------------------------------------------------
  useEffect(() => {
    if (!video) return;

    const vid =
      typeof video.id === "string"
        ? video.id
        : video.id?.videoId;

    log(`DEBUG: playVideo() invoked with video.id=${vid}`);
  }, [video]);

  // ---------------------------------------------------------
  // DEBUG: Track PlayerContext state
  // ---------------------------------------------------------
  useEffect(() => {
    const vid =
      typeof currentVideo?.id === "string"
        ? currentVideo.id
        : currentVideo?.id?.videoId;

    log(
      `DEBUG: PlayerContext -> currentVideo=${vid}, playing=${playing}, index=${currentIndex}, playlistLen=${playlist.length}`
    );
  }, [currentVideo, playing, currentIndex, playlist]);

  if (!video) return <p style={{ color: "#fff" }}>Loading…</p>;

  const embedUrl = `https://www.youtube.com/watch?v=${id}`;

  return (
    <div style={{ paddingBottom: 120 }}>
      <Player
        embedUrl={embedUrl}
        playing={playing}
        onEnded={() => {
          log("DEBUG: Player onEnded fired");
        }}
        pipMode={false}
        draggable={false}
        trackTitle={video?.title || video?.snippet?.title}
        onPrev={() => {
          log("DEBUG: Prev clicked in Player");
        }}
        onNext={() => {
          log("DEBUG: Next clicked in Player");
        }}
      />

      <h2 style={{ color: "#fff", marginTop: 16 }}>
        {video.title || video.snippet?.title}
      </h2>

      <p style={{ color: "#aaa", marginTop: 8 }}>
        {video.description || video.snippet?.description}
      </p>

      <h3 style={{ color: "#fff", marginTop: 24 }}>Related Videos</h3>
      {related.map((r) => (
        <div key={r.id?.videoId || r.id} style={{ color: "#ccc", marginTop: 8 }}>
          {r.title || r.snippet?.title}
        </div>
      ))}
    </div>
  );
}
