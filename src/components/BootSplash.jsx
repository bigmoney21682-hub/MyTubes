// File: src/components/BootSplash.jsx
import { useEffect, useState } from "react";

const text = "MyTube";

export default function BootSplash({ ready }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const t = setTimeout(() => setIndex(i => i + 1), 300); // slower
      return () => clearTimeout(t);
    }
  }, [index]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        transition: "opacity 0.6s",
        opacity: ready ? 0 : 1,
        pointerEvents: "none",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>🔥</div>
        <div style={{ fontSize: 36, color: "#fff", letterSpacing: 2 }}>
          {text.slice(0, index)}
        </div>
      </div>
    </div>
  );
}
