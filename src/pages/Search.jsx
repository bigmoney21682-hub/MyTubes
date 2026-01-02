/**
 * File: Search.jsx
 * Path: src/pages/Search.jsx
 * Description: Search page with Smart SearchCache (TTL + reuse counter).
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

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    async function runSearch() {
      setLoading(true);

      const cached = getSearchCache(query);
      if (cached) {
        debugBus.log("NETWORK", `SearchCache → HIT for "${query}"`);
        setResults(cached);
        setLoading(false);
        return;
      }

      debugBus.log("NETWORK", `SearchCache → MISS for "${query}"`);

      const data = await searchVideos(query);

      if (data && Array.isArray(data.items)) {
        setSearchCache(query, data.items);
        setResults(data.items);
      } else {
        setResults([]);
      }

      setLoading(false);
    }

    runSearch();
  }, [query]);

  return (
    <div style={{ padding: "12px" }}>
      <h2 style={{ marginBottom: 12 }}>Search: {query}</h2>

      {loading && <div style={{ color: "#888" }}>Loading…</div>}

      {!loading && results.length === 0 && (
        <div style={{ color: "#888" }}>No results found.</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {results.map((item) => {
          const videoId = item.id;
          const sn = item.snippet;

          return (
            <Link
              key={videoId}
              to={`/watch/${videoId}`}
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
                src={sn?.thumbnails?.medium?.url}
                alt=""
                style={{ width: 160, height: 90, objectFit: "cover" }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                  {sn?.title}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {sn?.channelTitle}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
