// File: src/components/BootSplash.jsx
import { useEffect, useState } from "react";

const text = "MyTube";

export default function BootSplash({ ready }) {
  const [index, setIndex] = useState(0);
  const [flicker, setFlicker] = useState(1);

  // Typing animation
  useEffect(() => {
    if (index < text.length) {
      const t = setTimeout(() => setIndex(i => i + 1), 450); // 1s longer total
      return () => clearTimeout(t);
    }
  }, [index]);

  // Flame flicker animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFlicker(0.9 + Math.random() * 0.2); // scale flicker
    }, 100);
    return () => clearInterval(interval);
  }, []);

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
        pointerEvents: "none",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 80,
            transform: `scale(${flicker})`,
            transition: "transform 0.1s",
          }}
        >
          🔥
        </div>
        <div style={{ fontSize: 48, color: "#fff", letterSpacing: 3 }}>
          {text.slice(0, index)}
        </div>
      </div>
    </div>
  );
}
