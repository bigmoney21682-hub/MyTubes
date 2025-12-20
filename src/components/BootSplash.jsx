import { useEffect, useState } from "react";

export default function BootSplash({ onFinish }) {
  const letters = ["M", "y", "T", "u", "b", "e"];
  const [displayed, setDisplayed] = useState([]);
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => [...prev, letters[i]]);
      i++;
      if (i >= letters.length) {
        clearInterval(interval);
        setTimeout(() => onFinish(), 800); // small delay before showing home
      }
    }, 300); // adjust speed here
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#000",
        flexDirection: "column",
        color: "#fff",
      }}
    >
      <div style={{ fontSize: 48, fontWeight: "bold" }}>
        🔥 {displayed.join("")} 🔥
      </div>
    </div>
  );
}
