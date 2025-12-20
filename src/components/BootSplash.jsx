// File: src/components/BootSplash.jsx
import { useEffect, useState } from "react";

export default function BootSplash({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const letters = "MyTube".split("");
    let i = 0;

    const interval = setInterval(() => {
      i++;
      setProgress(i);
      if (i >= letters.length) {
        clearInterval(interval);
        // Guarantee callback fires even if animation logic lags
        setTimeout(() => {
          if (typeof onFinish === "function") onFinish();
        }, 500);
      }
    }, 300);
    
    // Safety: call onFinish after max timeout (fallback)
    const fallback = setTimeout(() => {
      if (typeof onFinish === "function") onFinish();
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(fallback);
    };
  }, [onFinish]);

  const letters = "MyTube".split("");
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        zIndex: 9999,
      }}
    >
      <div style={{ fontSize: 64, color: "#ff4500" }}>🔥</div>
      <div style={{ fontSize: 48, color: "#fff", marginTop: 16 }}>
        {letters.map((l, idx) => (
          <span
            key={idx}
            style={{
              opacity: idx < progress ? 1 : 0,
              transition: "opacity 0.3s",
            }}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
