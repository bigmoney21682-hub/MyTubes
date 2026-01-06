/**
 * File: Search.jsx
 * Path: src/pages/Search.jsx
 * Description:
 *   Search page with:
 *     - Smart SearchCache
 *     - 250ms debounce
 *     - Full-width stacked 16:9 cards
 *     - VideoActions
 *     - Search suggestions
 *     - Unified loadVideo() (no navigation)
 */

import React, { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";

import { searchVideos } from "../api/search.js";
import { debugBus } from "../debug/debugBus.js";

import {
  getSearchCache,
  setSearchCache
} from "../cache/SearchCache.js";

import normalizeId from "../utils/normalizeId.js";
import VideoActions from "../components/VideoActions.jsx";

import { PlayerContext } from "../player/PlayerContext.jsx";

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";

  // ⭐ NEW: useContext instead of usePlayer()
  const { loadVideo } = useContext(PlayerContext);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // ⭐ NEW: search suggestions
  const [suggestions, setSuggestions] = useState([]);

  // Debounce
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Load search results
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    async function runSearch() {
      setLoading(true);

      const cached = getSearchCache(debouncedQuery);
      if (cached) {
        debugBus.log("NETWORK", `SearchCache → HIT for "${debouncedQuery}"`);
        setResults(cached);
        setSuggestions(extractSuggestions(cached));
        setLoading(false);
        return;
      }

      debugBus.log("NETWORK", `SearchCache → MISS for "${debouncedQuery}"`);

      const data = await searchVideos(debouncedQuery);

      if (data && Array.isArray(data.items)) {
        setSearchCache(debouncedQuery, data.items);
        setResults(data.items);
        setSuggestions(extractSuggestions(data.items));
      } else {
        setResults([]);
        setSuggestions([]);
      }

      setLoading(false);
    }

    runSearch();
  }, [debouncedQuery]);

  /* ------------------------------------------------------------
     Extract simple suggestions from search results
  ------------------------------------------------------------ */
  function extractSuggestions(items) {
    const set = new Set();

    for (const item of items) {
      const sn = item.snippet;
      if (!sn) continue;

      if (sn.title) set.add(sn.title);
      if (sn.channelTitle) set.add(sn.channelTitle);
    }

    return Array.from(set).slice(0, 6);
  }

  /* ------------------------------------------------------------
     Play handler for search results
     (Unified with new PlayerContext API)
  ------------------------------------------------------------ */
  function handlePlay(sn, videoId) {
    loadVideo(videoId);
  }

  return (
    <div style={{ padding: "12px", color: "#fff" }}>
      <h2 style={{ marginBottom: 12 }}>Search: {query}</h2>

      {/* ⭐ Search Suggestions */}
      {suggestions.length > 0 && (
        <div
          style={{
            marginBottom: "16px",
            padding: "8px",
            background: "#111",
            borderRadius: "8px"
          }}
        >
          <div style={{ fontSize: "13px", opacity: 0.7, marginBottom: "6px" }}>
            Suggestions
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {suggestions.map((s) => (
              <div
                key={s}
                onClick={() => {
                  window.location.hash = `#/search?q=${encodeURIComponent(s)}`;
                }}
                style={{
                  padding: "6px 10px",
                  background: "#1f2937",
                  borderRadius: "999px",
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <div style={{ color: "#888" }}>Loading…</div>}

      {!loading && results.length === 0 && (
        <div style={{ color: "#888" }}>No results found.</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {results.map((item) => {
          const videoId = normalizeId(item);

          if (!videoId) {
            debugBus.warn("Search.jsx → Skipped item with invalid ID", item);
            return null;
          }

          const sn = item.snippet;
          const thumb = sn?.thumbnails?.medium?.url;

          return (
            <div key={videoId}>
              <div
                onClick={() => handlePlay(sn, videoId)}
                style={{
                  textDecoration: "none",
                  color: "#fff",
                  display: "block",
                  cursor: "pointer"
                }}
              >
                <img
                  src={thumb}
                  alt={sn?.title}
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "8px"
                  }}
                />

                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    marginBottom: "4px"
                  }}
                >
                  {sn?.title}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    opacity: 0.7,
                    marginBottom: "6px"
                  }}
                >
                  {sn?.channelTitle}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.8,
                    lineHeight: 1.4
                  }}
                >
                  {sn?.description}
                </div>
              </div>

              {/* Actions */}
              <VideoActions videoId={videoId} videoSnippet={sn} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
