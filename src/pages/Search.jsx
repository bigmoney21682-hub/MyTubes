/**
 * File: Search.jsx
 * Path: src/pages/Search.jsx
 * Description: Search page with Smart SearchCache (TTL + reuse counter).
 */

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { searchVideos } from "../api/search.js"; // your existing API wrapper
import { debugBus } from "../debug/debugBus.js";

// Smart cache
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
  // Load search results when query changes
  // ------------------------------------------------------------
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    async function runSearch() {
      setLoading(true);

      // 1. Try cache first
      const cached = getSearchCache(query);
      if (cached) {
        debugBus.log("NETWORK", `SearchCache → HIT for "${query}"`);
        setResults(cached);
        setLoading(false);
        return;
      }

      // 2. Cache MISS → call API
      debugBus.log("NETWORK", `SearchCache → MISS for "${query}"`);

      const data = await searchVideos(query);

      if (data && data.items) {
        setSearchCache(query, data.items);
        setResults(data.items);
      } else {
        setResults([]);
      }

      setLoading(false);
    }

    runSearch();
  }, [query]);

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

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {results.map((item) => {
          const video = item.id?.videoId || item.id;
          const snippet = item.snippet;

          return (
            <a
              key={video}
              href={`#/watch?v=${video}`}
              style={{
                display: "flex",
                gap: 12,
                textDecoration: "none",
                color: "#fff",
                borderBottom: "1px solid #333",
                paddingBottom: 12
              }}
            >
              <img
                src={snippet?.thumbnails?.medium?.url}
                alt=""
                style={{ width: 160, height: 90, objectFit: "cover" }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                  {snippet?.title}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {snippet?.channelTitle}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
