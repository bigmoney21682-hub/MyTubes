// File: src/components/Header.jsx

import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "fixed",
        top: "calc(env(safe-area-inset-top) + 0px)",
        left: 0,
        right: 0,
        height: 56,
        background: "#111",
        borderBottom: "1px solid #222",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        zIndex: 99990
      }}
    >
      <div
        onClick={() => navigate("/")}
        style={{
          fontSize: 20,
          fontWeight: 700,
          background: "linear-gradient(90deg, #ff4d00, #ff9900)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          cursor: "pointer"
        }}
      >
        MyTube
      </div>
    </div>
  );
}
