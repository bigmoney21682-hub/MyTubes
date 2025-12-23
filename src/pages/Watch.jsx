// File: src/pages/Watch.jsx
// PCC v6.1 — Adds sourceUsed debug tag + unified fallback chain

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DebugOverlay from "../components/DebugOverlay";
import { usePlayer } from "../contexts/PlayerContext";

export default function Watch() {
  const { id } = useParams();
  const { playVideo } = usePlayer();

  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceUsed, setSourceUsed] = useState(null);

  const log = (msg) => window.debugLog?.(`Watch: ${msg}`);

  async function fetchFromPiped(path) {
    const url = `https://pipedapi.kavin.rocks${path}`;
    log(`Trying Piped: ${url}`);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      log(`Piped failed: ${err}`);
      return null;
    }
  }

  async function fetchFromInvidious(path) {
    const url = `https://yewtu.be${path}`;
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

  useEffect(() => {
    async function load() {
      setLoading(true);

      let v = null;

      // 1) Piped
      const piped = await fetchFromPiped(`/streams/${id}`);
      if (piped?.title) {
        setSourceUsed("PIPED");
        v = piped;
      }

      // 2) Invidious
      if (!v) {
        const inv = await fetchFromInvidious(`/api/v1/videos/${id}`);
        if (inv?.title) {
          setSourceUsed("INVIDIOUS");
          v = inv;
        }
      }

      // 3) YouTube API
      if (!v) {
        setSourceUsed("YOUTUBE_API");
        v = await fetchFromYouTube(id);
      }

      setVideo(v);
      if (v) playVideo(v);

      setLoading(false);
    }

    load();
  }, [id]);

  if (loading)
    return (
      <>
        <DebugOverlay pageName="Watch" sourceUsed={sourceUsed} />
        <p style={{ color: "#fff", padding: 16 }}>Loading…</p>
      </>
    );

  return (
    <>
      <DebugOverlay pageName="Watch" sourceUsed={sourceUsed} />

      <div style={{ padding: 16, color: "#fff" }}>
        <h2>{video?.title}</h2>
        <p>{video?.author}</p>
      </div>
    </>
  );
}
