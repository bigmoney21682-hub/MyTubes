// File: src/components/GlobalPlayer.jsx
// PCC v2.0 — Robust global audio engine (Piped -> YouTube fallback, auto-next, toggle-safe)

import { useEffect, useRef, useState } from "react";
import { usePlayer } from "../contexts/PlayerContext";

export default function GlobalPlayer() {
  const { currentVideo, playing, playNext } = usePlayer();

  const audioRef = useRef(null);

  const [audioSrc, setAudioSrc] = useState(null);
  const [sourceType, setSourceType] = useState("none"); // "none" | "piped" | "youtube"
  const [loading, setLoading] = useState(false);

  const log = (msg) => window.debugLog?.(`GlobalPlayer: ${msg}`);

  // ------------------------------
  // Helpers
  // ------------------------------
  const getVideoId = (video) => {
    if (!video) return null;
    if (typeof video.id === "string") return video.id;
    if (typeof video.id?.videoId === "string") return video.id.videoId;
    return null;
  };

  const videoId = getVideoId(currentVideo);

  // ------------------------------
  // Fetch Piped audio stream with YouTube fallback
  // ------------------------------
  useEffect(() => {
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

      const pipedUrl = `https://pipedapi.kavin.rocks/streams/${videoId}`;
      log(`Loading new videoId=${videoId} -> trying Piped: ${pipedUrl}`);

      try {
        const res = await fetch(pipedUrl);
        const raw = await res.text();
        log(`Piped streams raw response (trimmed): ${raw.slice(0, 200)}...`);

        if (cancelled) return;

        let data;
        try {
          data = JSON.parse(raw);
        } catch (err) {
          log(`Piped JSON parse error: ${err}`);
          data = null;
        }

        const audioStreams = data?.audioStreams;
        if (Array.isArray(audioStreams) && audioStreams.length > 0) {
          const best = audioStreams[0];
          log(
            `Piped audioStreams available: ${audioStreams.length}, using bitrate=${best.bitrate}, codec=${best.codec}`
          );
          setAudioSrc(best.url);
          setSourceType("piped");
          setLoading(false);
          return;
        } else {
          log("Piped returned no audioStreams, falling back to YouTube");
        }
      } catch (err) {
        log(`Piped streams fetch exception: ${err}`);
      }

      // Fallback to YouTube iframe
      log("Falling back to YouTube iframe audio");
      setAudioSrc(null);
      setSourceType("youtube");
      setLoading(false);
    }

    loadStream();

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  // ------------------------------
  // Sync play / pause with <audio> (Piped)
  // ------------------------------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      log("No audio element yet, skipping play/pause sync");
      return;
    }
    if (!audioSrc || sourceType !== "piped") {
      log(
        `Play/pause sync: sourceType=${sourceType}, audioSrc=${!!audioSrc} -> skipping audio control`
      );
      return;
    }

    if (playing) {
      audio
        .play()
        .then(() => {
          log("Audio play() resolved (Piped)");
        })
        .catch((err) => {
          log(`Audio play() error (Piped): ${err}`);
        });
    } else {
      audio.pause();
      log("Audio paused due to playing=false (Piped)");
    }
  }, [playing, audioSrc, sourceType]);

  // ------------------------------
  // Auto-next when track ends
  // ------------------------------
  const handleEnded = () => {
    log("Audio ended -> calling playNext()");
    playNext();
  };

  // ------------------------------
  // Render hidden playback engines
  // ------------------------------
  return (
    <>
      {/* PIPED AUDIO ENGINE */}
      {sourceType === "piped" && audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          autoPlay={playing}
          onEnded={handleEnded}
          onError={(e) => {
            const msg = e?.message || (e?.target && e.target.error?.code) || "unknown";
            log(`Audio element error (Piped) -> falling back to YouTube: ${msg}`);
            setSourceType("youtube");
            setAudioSrc(null);
          }}
        />
      )}

      {/* YOUTUBE IFRAME FALLBACK ENGINE */}
      {sourceType === "youtube" && videoId && playing && (
        <iframe
          key={`${videoId}-playing`} // force reload when video changes
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
          allow="autoplay; encrypted-media"
        />
      )}

      {/* NOTE:
        - When playing=false and sourceType='youtube', we render nothing,
          which effectively "pauses" by destroying the iframe.
        - When playing=true, we remount the iframe with autoplay=1.
      */}

      {/* OPTIONAL INLINE DEBUG */}
      {false && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            fontSize: 10,
            color: "#fff",
            background: "rgba(0,0,0,0.7)",
            padding: 4,
            zIndex: 9999,
          }}
        >
          srcType={sourceType}, loading={String(loading)}, playing={String(
            playing
          )}
        </div>
      )}
    </>
  );
}
