/**
 * File: Footer.jsx
 * Path: src/layout/Footer.jsx
 * Description:
 *   Global fixed footer for MyTube.
 *   - Always visible above content
 *   - Never overlaps MiniPlayer or Player
 *   - Matches YouTube Mobile bottom bar behavior
 */

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "home", label: "Home", path: "/" },
    { id: "search", label: "Search", path: "/search" },
    { id: "playlists", label: "Playlists", path: "/playlists" }
  ];

  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,

        height: "56px",
        background: "#0d0d0d",
        borderTop: "1px solid #1a1a1a",

        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",

        padding: "6px 0",

        /* ⭐ Must be below MiniPlayer (1500) but above content */
        zIndex: 1200,

        /* Slight lift for visual polish */
        transform: "translateY(-6px)"
      }}
    >
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            style={{
              background: active ? "#1a1f27" : "#111",
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              padding: "6px 12px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.15s ease, transform 0.1s ease"
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </footer>
  );
}
