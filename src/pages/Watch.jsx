// File: src/pages/Watch.jsx
// PCC v4.0 — Adds deep debug logging for playVideo + PlayerContext sync

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
  // Fetch video + related
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      log("DEBUG: Fetching video + related");

      // Your existing fetch logic here:
      // (I’m keeping placeholders since your fetch code is long)
      const fetchedVideo = await window.apiFetchVideo(id);
      const fetchedRelated = await window.apiFetchRelated(id);

      setVideo(fetchedVideo);
      setRelated(fetchedRelated);

      log(
        `DEBUG: Video fetched -> title="${fetchedVideo?.snippet?.title}", related=${fetchedRelated?.length}`
      );

      // Call playVideo
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
        trackTitle={video?.snippet?.title}
        onPrev={() => {
          log("DEBUG: Prev clicked in Player");
        }}
        onNext={() => {
          log("DEBUG: Next clicked in Player");
        }}
      />

      <h2 style={{ color: "#fff", marginTop: 16 }}>
        {video.snippet?.title}
      </h2>

      <p style={{ color: "#aaa", marginTop: 8 }}>
        {video.snippet?.description}
      </p>

      <h3 style={{ color: "#fff", marginTop: 24 }}>Related Videos</h3>
      {related.map((r) => (
        <div key={r.id?.videoId || r.id} style={{ color: "#ccc", marginTop: 8 }}>
          {r.snippet?.title}
        </div>
      ))}
    </div>
  );
}
