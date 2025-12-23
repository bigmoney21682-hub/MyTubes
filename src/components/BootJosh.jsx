// File: src/components/BootJosh.jsx
// PCC v1.0 — Secondary splash screen with GIF + title

import { useEffect, useState } from "react";

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
      <img
        src="public/Josh.gif"
        alt="BootJosh"
        style={{
          width: 180,
          height: "auto",
          marginBottom: 40,
        }}
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
