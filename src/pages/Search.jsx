/**
 * File: Search.jsx
 * Path: src/pages/Search.jsx
 * Description: Search page with Smart SearchCache + 250ms debounce
 *              and full-width 16:9 stacked video cards.
 */

import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";

import { searchVideos } from "../api/search.js";
import { debugBus } from "../debug/debugBus.js";

import {
  getSearchCache,
  setSearchCache
} from "../cache/SearchCache.js";

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // ------------------------------------------------------------
  // Debounced query (fires 250ms after user stops typing)
  // ------------------------------------------------------------
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // ------------------------------------------------------------
  // Load search results when debounced query changes
  // ------------------------------------------------------------
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    async function runSearch() {
      setLoading(true);

      const cached = getSearchCache(debouncedQuery);
      if (cached) {
        debugBus.log("NETWORK", `SearchCache → HIT for "${debouncedQuery}"`);
        setResults(cached);
        setLoading(false);
        return;
      }

      debugBus.log("NETWORK", `SearchCache → MISS for "${debouncedQuery}"`);

      const data = await searchVideos(debouncedQuery);

      if (data && Array.isArray(data.items)) {
        setSearchCache(debouncedQuery, data.items);
        setResults(data.items);
      } else {
        setResults([]);
      }

      setLoading(false);
    }

    runSearch();
  }, [debouncedQuery]);

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div style={{ padding: "12px" }}>
      <h2 style={{ marginBottom: 12 }}>Search: {query}</h2>

      {loading && <div style={{ color: "#888" }}>Loading…</div>}

      {!loading && results.length === 0 && (
        <div style={{ color: "#888" }}>No results found.</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {results.map((item) => {
          const videoId = item.id;
          const sn = item.snippet;
          const thumb = sn?.thumbnails?.medium?.url;

          return (
            <Link
              key={videoId}
              to={`/watch/${videoId}`}
              style={{
                textDecoration: "none",
                color: "#fff",
                display: "block"
              }}
            >
              {/* 16:9 full-width thumbnail */}
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

              {/* Title */}
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  marginBottom: "4px"
                }}
              >
                {sn?.title}
              </div>

              {/* Channel */}
              <div
                style={{
                  fontSize: "13px",
                  opacity: 0.7,
                  marginBottom: "6px"
                }}
              >
                {sn?.channelTitle}
              </div>

              {/* Description */}
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.8,
                  lineHeight: 1.4
                }}
              >
                {sn?.description}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
