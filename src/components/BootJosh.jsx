// File: src/components/BootJosh.jsx
// PCC v3.0 — Larger GIF, fading title, extended duration, no text-only flash

import { useEffect, useState } from "react";
import JoshGif from "../assets/Josh.gif";

export default function BootJosh({ onDone }) {
  const [visible, setVisible] = useState(true);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    // Fade in title after GIF appears
    const fadeIn = setTimeout(() => {
      setTitleVisible(true);
    }, 300); // slight delay for smoothness

    // Total duration: 3.5 seconds (1s longer than before)
    const total = setTimeout(() => {
      setTitleVisible(false); // fade out title
      setTimeout(() => {
        setVisible(false);
        onDone?.();
      }, 400); // allow fade-out animation to complete
    }, 3500);

    return () => {
      clearTimeout(fadeIn);
      clearTimeout(total);
    };
  }, [onDone]);

  if (!visible) return null;

  const log = (msg) => window.debugLog?.(`BootJosh: ${msg}`);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999999,
      }}
    >
      {/* GIF */}
      <img
        src={JoshGif}
        alt="BootJosh"
        style={{
          width: 225, // 25% larger than 180
          height: "auto",
          marginBottom: 40,
        }}
        onLoad={() => log("GIF loaded successfully (imported Josh.gif)")}
        onError={() => log("GIF FAILED to load from imported Josh.gif")}
      />

      {/* Fading Title */}
      <div
        style={{
          color: "#fff",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: 1,
          opacity: titleVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        This Shit is FIRE!!!
      </div>
    </div>
  );
}
