// File: src/components/BootJosh.jsx
// PCC v2.1 — Secondary splash screen with imported GIF + title + load logging

import { useEffect, useState } from "react";
import JoshGif from "../assets/Josh.gif"; // ⭐ Correct lowercase import

export default function BootJosh({ onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 2500); // 2.5 seconds

    return () => clearTimeout(t);
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
        zIndex: 999999, // DebugOverlay is above this
      }}
    >
      <img
        src={JoshGif}
        alt="BootJosh"
        style={{
          width: 180,
          height: "auto",
          marginBottom: 40,
        }}
        onLoad={() => log("GIF loaded successfully (imported Josh.gif)")}
        onError={() => log("GIF FAILED to load from imported Josh.gif")}
      />

      <div
        style={{
          color: "#fff",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        This Shit is FIRE!!!
      </div>
    </div>
  );
}
