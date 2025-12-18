// src/components/ProgressLoader.jsx

import { useEffect, useState } from "react";

export default function ProgressLoader({ duration = 1200 }) {
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    const stepTime = duration / 10;
    let i = 0;

    const timer = setInterval(() => {
      i++;
      setFilled(i);
      if (i >= 10) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
      }}
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: 14,
            borderRadius: 3,
            background:
              i < filled
                ? `linear-gradient(135deg, #ff9800, #ff3d00)`
                : "rgba(255,255,255,0.15)",
            transition: "background 0.25s",
          }}
        />
      ))}
    </div>
  );
}
