// File: src/pages/SearchResults.jsx
// PCC v13.0 — Search results page (YouTube-only)

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchSearchResults } from "../api/youtube";
import SearchResultCard from "../components/SearchResultCard";

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get("q");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    async function load() {
      setLoading(true);
      try {
        const items = await fetchSearchResults(query);
        setResults(items);
      } catch (err) {
        console.error("Search failed:", err);
      }
      setLoading(false);
    }

    load();
  }, [query]);

  return (
    <div style={{ padding: 16, color: "#fff" }}>
      <h2 style={{ marginBottom: 12 }}>Results for: {query}</h2>

      {loading && <p style={{ opacity: 0.7 }}>Searching…</p>}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {results.map((v) => (
          <SearchResultCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}
