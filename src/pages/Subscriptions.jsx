// File: src/pages/Subscriptions.jsx
// PCC v1.0 — Local-only subscriptions page (no API required)

import { useEffect, useState } from "react";
import DebugOverlay from "../components/DebugOverlay";
import VideoCard from "../components/VideoCard";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState([]);

  const log = (msg) => window.debugLog?.(`Subscriptions: ${msg}`);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("mytube_subscriptions") || "[]");
    setSubs(stored);
    log(`Loaded ${stored.length} subscriptions`);
  }, []);

  return (
    <>
      <DebugOverlay pageName="Subscriptions" sourceUsed="LOCAL" />

      <div style={{ padding: 16, color: "#fff" }}>
        <h2>Your Subscriptions</h2>

        {subs.length === 0 && (
          <p style={{ opacity: 0.7 }}>You haven’t subscribed to any channels yet.</p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 16,
          }}
        >
          {subs.map((ch) => (
            <div
              key={ch.channelId}
              style={{
                background: "#111",
                padding: 12,
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <img
                src={ch.thumbnail}
                alt={ch.title}
                width="100%"
                style={{ borderRadius: 8 }}
              />
              <strong>{ch.title}</strong>

              {/* Clicking a subscription performs a search for that channel */}
              <a
                href={`/?search=${encodeURIComponent(ch.title)}`}
                style={{ color: "#4af", textDecoration: "none", marginTop: 4 }}
              >
                View videos
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
