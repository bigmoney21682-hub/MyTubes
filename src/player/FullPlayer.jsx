/**
 * File: FullPlayer.jsx
 * Path: src/player/FullPlayer.jsx
 * Description:
 *   Expanded full-screen player UI.
 *   - Uses PlayerContext for:
 *       - currentId
 *       - currentMeta (title + thumbnail)
 *       - isPlaying
 *       - setIsPlaying
 *   - Does NOT own playback logic (GlobalPlayerFix does)
 *   - Does NOT own autonext logic (AutonextEngine + Home.jsx do)
 *   - Purely a visual + control shell.
 */

import React, { useContext } from "react";
import { PlayerContext } from "./PlayerContext.jsx";
import AddToPlaylistButton from "../components/AddToPlaylistButton.jsx";

function dbg(label, data = {}) {
  console.group(`[FULLPLAYER] ${label}`);
  for (const k in data) console.log(k + ":", data[k]);
  console.groupEnd();
}

/**
 * Props:
 *   - isOpen: boolean → whether the full player is visible
 *   - onClose: function → called when user swipes down / taps close
 */
export default function FullPlayer({ isOpen, onClose }) {
  const {
    currentId,
    currentMeta,
    isPlaying,
    setIsPlaying
  } = useContext(PlayerContext);

  if (!isOpen || !currentId) return null;

  const title = currentMeta?.title || "Now playing";
  const thumbnail = currentMeta?.thumbnail || "";

  function handleTogglePlay() {
    // NOTE:
    // We only toggle UI state here.
    // Actual play/pause is still controlled by the YouTube iframe.
    // You can later wire this to GlobalPlayer.player.playVideo()/pauseVideo()
    const next = !isPlaying;
    dbg("handleTogglePlay()", { next });
    setIsPlaying(next);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Backdrop */}
      {thumbnail && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${thumbnail})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(24px)",
            opacity: 0.35
          }}
        />
      )}

      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top, rgba(0,0,0,0.2), rgba(0,0,0,0.9))"
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "12px"
        }}
      >
        {/* Header / drag handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: "8px"
          }}
        >
          <div
            onClick={onClose}
            style={{
              width: "40px",
              height: "4px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.4)",
              cursor: "pointer"
            }}
          />
        </div>

        {/* Close button (top-right) */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: "999px",
            background: "rgba(0,0,0,0.6)",
            fontSize: "12px"
          }}
          onClick={onClose}
        >
          Close
        </div>

        {/* Main video area (just a visual shell; iframe lives in Home) */}
        <div
          style={{
            flex: "0 0 auto",
            width: "100%",
            maxWidth: "640px",
            margin: "0 auto",
            marginTop: "12px"
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#000",
              border: "1px solid rgba(255,255,255,0.1)",
              position: "relative"
            }}
          >
            {/* This is just a visual placeholder; the real iframe is in Home.jsx */}
            {thumbnail && (
              <img
                src={thumbnail}
                alt={title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "brightness(0.9)"
                }}
              />
            )}

            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none"
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 24px rgba(0,0,0,0.7)"
                }}
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: "12px solid transparent",
                    borderBottom: "12px solid transparent",
                    borderLeft: "18px solid #fff",
                    marginLeft: "4px"
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info + controls */}
        <div
          style={{
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "16px 4px 8px"
          }}
        >
          {/* Title + channel */}
          <div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                marginBottom: "6px"
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: "13px",
                opacity: 0.8,
                marginBottom: "10px"
              }}
            >
              {/* You can later pass channel name via meta if desired */}
              Now playing
            </div>

            {/* Add to Playlist */}
            <AddToPlaylistButton
              video={{
                id: currentId,
                title,
                thumbnail
              }}
            />
          </div>

          {/* Bottom controls */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "16px"
            }}
          >
            {/* Play / Pause */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px"
              }}
            >
              <button
                onClick={handleTogglePlay}
                style={{
                  padding: "10px 24px",
                  borderRadius: "999px",
                  border: "none",
                  background:
                    "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  minWidth: "120px"
                }}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
            </div>

            {/* Autonext status (read-only label for now) */}
            <div
              style={{
                textAlign: "center",
                fontSize: "12px",
                opacity: 0.8
              }}
            >
              Autonext: <span style={{ color: "#3ea6ff" }}>On</span>
              {/* Later you can wire this to a real toggle if desired */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
