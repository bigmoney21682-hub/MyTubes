// File: src/pages/DebugEnv.jsx
// PCC v7.0 — Full crash cockpit: fatal errors, cache inspector, player inspector, system info

import { useEffect, useState } from "react";
import DebugOverlay from "../components/DebugOverlay";
import { getCached, setCached, clearAllCaches } from "../utils/youtubeCache";
import { usePlayer } from "../contexts/PlayerContext";

export default function DebugEnv() {
  const [fatalErrors, setFatalErrors] = useState([]);
  const [cacheKeys, setCacheKeys] = useState([]);
  const [cachePreview, setCachePreview] = useState(null);

  const {
    currentVideo,
    playlist,
    currentIndex,
    playing,
    autonextMode,
  } = usePlayer();

  const log = (msg) => window.debugLog?.(`DebugEnv: ${msg}`);

  // ------------------------------------------------------------
  // Load persistent fatal errors
  // ------------------------------------------------------------
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("fatal_errors") || "[]");
      setFatalErrors(stored);
    } catch {
      setFatalErrors([]);
    }
  }, []);

  // ------------------------------------------------------------
  // Load cache keys
  // ------------------------------------------------------------
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith("ytcache_")
      );
      setCacheKeys(keys);
    } catch {
      setCacheKeys([]);
    }
  }, []);

  const handlePreviewCache = (key) => {
    try {
      const raw = localStorage.getItem(key);
      setCachePreview(JSON.parse(raw));
    } catch {
      setCachePreview("Unable to parse");
    }
  };

  const handleClearFatalErrors = () => {
    localStorage.removeItem("fatal_errors");
    setFatalErrors([]);
    log("Cleared fatal errors");
  };

  const handleClearCache = () => {
    clearAllCaches();
    setCacheKeys([]);
    setCachePreview(null);
    log("Cleared all caches");
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <>
      <DebugOverlay pageName="DebugEnv" />

      <div style={{ padding: 16, color: "#fff" }}>
        <h1 style={{ marginBottom: 16 }}>Debug Environment</h1>

        {/* ================================
            SYSTEM INFO
        ================================= */}
        <section style={{ marginBottom: 32 }}>
          <h2>System Info</h2>
          <div style={{ opacity: 0.8, fontSize: 14 }}>
            <p><strong>Platform:</strong> {navigator.platform}</p>
            <p><strong>User Agent:</strong> {navigator.userAgent}</p>
            <p><strong>Build Mode:</strong> {import.meta.env.MODE}</p>
            <p><strong>YT_API_KEY present:</strong> {window.YT_API_KEY ? "YES" : "NO"}</p>
          </div>
        </section>

        {/* ================================
            FATAL ERROR LOGS
        ================================= */}
        <section style={{ marginBottom: 32 }}>
          <h2>Fatal Crash Logs</h2>

          {fatalErrors.length === 0 && (
            <p style={{ opacity: 0.7 }}>No fatal errors recorded.</p>
          )}

          {fatalErrors.length > 0 && (
            <div
              style={{
                background: "#220000",
                border: "1px solid #552222",
                padding: 12,
                borderRadius: 8,
                maxHeight: 200,
                overflowY: "auto",
                fontSize: 13,
              }}
            >
              {fatalErrors.map((e, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ color: "#ff7777" }}>
                    [{new Date(e.time).toLocaleTimeString()}] {e.type}
                  </div>
                  <div style={{ opacity: 0.9 }}>{e.message}</div>
                  {e.extra && (
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        opacity: 0.7,
                        marginTop: 4,
                      }}
                    >
                      {e.extra}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleClearFatalErrors}
            style={{
              marginTop: 12,
              padding: "6px 12px",
              background: "#400",
              border: "1px solid #700",
              borderRadius: 6,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Clear Fatal Errors
          </button>
        </section>

        {/* ================================
            CACHE INSPECTOR
        ================================= */}
        <section style={{ marginBottom: 32 }}>
          <h2>Cache Inspector</h2>

          {cacheKeys.length === 0 && (
            <p style={{ opacity: 0.7 }}>No cached entries.</p>
          )}

          {cacheKeys.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {cacheKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => handlePreviewCache(key)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 10px",
                    marginBottom: 6,
                    background: "#222",
                    border: "1px solid #444",
                    borderRadius: 6,
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          )}

          {cachePreview && (
            <pre
              style={{
                background: "#111",
                padding: 12,
                borderRadius: 8,
                maxHeight: 200,
                overflowY: "auto",
                fontSize: 12,
              }}
            >
              {JSON.stringify(cachePreview, null, 2)}
            </pre>
          )}

          <button
            onClick={handleClearCache}
            style={{
              marginTop: 12,
              padding: "6px 12px",
              background: "#222",
              border: "1px solid #444",
              borderRadius: 6,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Clear All Caches
          </button>
        </section>

        {/* ================================
            PLAYER CONTEXT INSPECTOR
        ================================= */}
        <section style={{ marginBottom: 32 }}>
          <h2>PlayerContext Inspector</h2>

          <div
            style={{
              background: "#111",
              padding: 12,
              borderRadius: 8,
              fontSize: 13,
              whiteSpace: "pre-wrap",
            }}
          >
            <p><strong>currentVideo:</strong> {JSON.stringify(currentVideo, null, 2)}</p>
            <p><strong>playlist:</strong> {JSON.stringify(playlist, null, 2)}</p>
            <p><strong>currentIndex:</strong> {currentIndex}</p>
            <p><strong>playing:</strong> {String(playing)}</p>
            <p><strong>autonextMode:</strong> {autonextMode}</p>
          </div>
        </section>

        {/* ================================
            GLOBAL PLAYER INSPECTOR
        ================================= */}
        <section style={{ marginBottom: 32 }}>
          <h2>GlobalPlayer Inspector</h2>

          <div
            style={{
              background: "#111",
              padding: 12,
              borderRadius: 8,
              fontSize: 13,
              whiteSpace: "pre-wrap",
            }}
          >
            <p><strong>YT API Loaded:</strong> {window.YT ? "YES" : "NO"}</p>
            <p><strong>YT Player Instance:</strong> {window.__ytPlayer ? "YES" : "NO"}</p>
            <p><strong>Player State:</strong> {window.__ytPlayerState ?? "unknown"}</p>
          </div>
        </section>
      </div>
    </>
  );
}
