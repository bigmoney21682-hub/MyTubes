// File: src/components/GlobalPlayer.jsx
// PCC v4.2 — Background audio engine with explicit route + video reactivation

import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";

const INVIDIOUS_BASE = "https://yewtu.be";

export default function GlobalPlayer() {
  const { currentVideo, playing, playNext } = usePlayer();
  const location = useLocation();

  const audioRef = useRef(null);

  const [audioSrc, setAudioSrc] = useState(null);
  const [sourceType, setSourceType] = useState("none");
  const [loading, setLoading] = useState(false);

  const log = (msg) => window.debugLog?.(`GlobalPlayer: ${msg}`);

  const getVideoId = (video) => {
    if (!video) return null;
    if (typeof video.id === "string") return video.id;
    if (typeof video.id?.videoId === "string") return video.id.videoId;
    return null;
  };

  const videoId = getVideoId(currentVideo);

  // Compute audioEnabled from global each render
  const audioEnabled = window.__GLOBAL_AUDIO_ENABLED !== false;

  // Simple log when route changes so we know reactivation points
  useEffect(() => {
    log(
      `Route changed -> pathname=${location.pathname}, audioEnabled=${audioEnabled}, videoId=${videoId}`
    );
  }, [location.pathname, audioEnabled, videoId]);

  // -------------------------------
  // Invidious stream loader
  // -------------------------------
  async function fetchInvidiousStreams(id) {
    const url = `${INVIDIOUS_BASE}/api/v1/videos/${id}`;
    log(`Loading new videoId=${id} -> trying Invidious: ${url}`);

    try {
      const res = await fetch(url);
      const raw = await res.text();
      log(`Invidious streams raw response (trimmed): ${raw.slice(0, 200)}...`);

      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        log(`Invidious JSON parse error: ${err}`);
        return null;
      }

      const adaptive = Array.isArray(data?.adaptiveFormats)
        ? data.adaptiveFormats
        : [];
      const formats = Array.isArray(data?.formatStreams)
        ? data.formatStreams
        : [];

      const audioOnly = adaptive.filter((f) =>
        String(f.type || "").startsWith("audio/")
      );
      if (audioOnly.length > 0) {
        const sorted = audioOnly.sort(
          (a, b) => (b.bitrate || 0) - (a.bitrate || 0)
        );
        const best = sorted[0];
        if (best?.url) {
          log(
            `Invidious audio-only available: ${audioOnly.length}, using bitrate=${best.bitrate}, itag=${best.itag}`
          );
          return best.url;
        }
      }

      const withAudio = formats.filter((f) =>
        String(f.type || "").includes("audio")
      );
      if (withAudio.length > 0) {
        const best = withAudio[0];
        if (best?.url) {
          log(
            `Invidious formatStreams with audio available: ${withAudio.length}, using itag=${best.itag}`
          );
          return best.url;
        }
      }

      log("Invidious returned no usable audio streams");
      return null;
    } catch (err) {
      log(`Invidious streams fetch exception: ${err}`);
      return null;
    }
  }

  // -------------------------------
  // Load stream whenever:
  // - videoId changes
  // - route changes
  // - currentVideo object changes
  // -------------------------------
  useEffect(() => {
    log(
      `Loader effect fired -> audioEnabled=${audioEnabled}, videoId=${videoId}, pathname=${location.pathname}`
    );

    if (!audioEnabled) {
      log("Audio engine disabled -> clearing audio");
      setAudioSrc(null);
      setSourceType("none");
      return;
    }

    if (!videoId) {
      log("No currentVideo or invalid id -> stopping audio");
      setAudioSrc(null);
      setSourceType("none");
      return;
    }

    let cancelled = false;

    async function loadStream() {
      setLoading(true);
      setAudioSrc(null);
      setSourceType("none");

      const invidiousUrl = await fetchInvidiousStreams(videoId);
      if (cancelled) return;

      if (invidiousUrl) {
        setAudioSrc(invidiousUrl);
        setSourceType("invidious");
        setLoading(false);
        return;
      }

      log("Falling back to YouTube iframe audio");
      setAudioSrc(null);
      setSourceType("youtube");
      setLoading(false);
    }

    loadStream();

    return () => {
      cancelled = true;
    };
    // depend on currentVideo (object), not just id
  }, [currentVideo, videoId, location.pathname, audioEnabled]);

  // -------------------------------
  // Sync play/pause with context
  // -------------------------------
  useEffect(() => {
    if (!audioEnabled) {
      log("Audio engine disabled -> skipping play/pause sync");
      return;
    }

    if (sourceType !== "invidious") {
      log(
        `Play/pause sync: sourceType=${sourceType} -> iframe/autoplay path or disabled`
      );
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      log("No audio element yet for Invidious, skipping play/pause sync");
      return;
    }
    if (!audioSrc) {
      log("No audioSrc set for Invidious, skipping play/pause sync");
      return;
    }

    if (playing) {
      audio
        .play()
        .then(() => log("Audio play() resolved (Invidious)"))
        .catch((err) => log(`Audio play() error (Invidious): ${err}`));
    } else {
      audio.pause();
      log("Audio paused due to playing=false (Invidious)");
    }
  }, [playing, audioSrc, sourceType, audioEnabled]);

  const handleEnded = () => {
    log("Audio ended -> calling playNext()");
    playNext();
  };

  if (!audioEnabled) {
    return null;
  }

  return (
    <>
      {sourceType === "invidious" && audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          autoPlay={playing}
          onEnded={handleEnded}
          onError={(e) => {
            const msg =
              e?.message ||
              (e?.target && e.target.error && e.target.error.code) ||
              "unknown";
            log(
              `Audio element error (Invidious) -> falling back to YouTube: ${msg}`
            );
            setSourceType("youtube");
            setAudioSrc(null);
          }}
        />
      )}

      {sourceType === "youtube" && videoId && playing && (
        <iframe
          key={`${videoId}-playing`}
          title="Global YouTube audio fallback"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0`}
          style={{
            position: "fixed",
            width: 0,
            height: 0,
            border: "none",
            opacity: 0,
            pointerEvents: "none",
          }}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        />
      )}
    </>
  );
}
