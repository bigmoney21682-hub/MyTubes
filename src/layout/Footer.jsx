/**
 * File: Footer.jsx
 * Path: src/layout/Footer.jsx
 * Description: Bottom navigation bar with a visually dominant Home button,
 *              centered icons/labels, and space-evenly distribution.
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";

export const FOOTER_HEIGHT = 56;

export default function Footer() {
  const location = useLocation();

  const tabs = [
    { to: "/menu", label: "📂 Menu" },
    { to: "/playlists", label: "🎵 Playlists" },

    // ⭐ Home gets visual priority
    {
      to: "/",
      label: "🏠 Home",
      style: {
        fontSize: 15,
        fontWeight: 600,
        paddingTop: 2
      }
    },

    { to: "/shorts", label: "🎬 Shorts" },
    { to: "/subs", label: "⭐ Subs" }
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: FOOTER_HEIGHT,
        background: "#111",
        borderTop: "1px solid #222",
        display: "flex",
        justifyContent: "space-evenly",   // ⭐ natural spacing
        alignItems: "center",
        zIndex: 1000,
        userSelect: "none"
      }}
    >
      {tabs.map((tab) => {
        const active = location.pathname === tab.to;

        return (
          <Link
            key={tab.to}
            to={tab.to}
            style={{
              textDecoration: "none",
              color: active ? "#3ea6ff" : "#ccc",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",       // ⭐ centers icon + label
              justifyContent: "center",
              textAlign: "center",        // ⭐ ensures label text centers
              padding: "0 10px",          // ⭐ auto width, not flex:1
              ...(tab.style || {})        // ⭐ Home gets its custom style
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
