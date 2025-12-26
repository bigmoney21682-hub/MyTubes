import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchSearchResults } from "../api/youtube";
import SearchResultCard from "../components/SearchResultCard";

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get("q");

  const [results, setResults] = useState([]);

  useEffect(() => {
    async function load() {
      window.debugLog?.(`Search: ${query}`, "SEARCH");
      const items = await fetchSearchResults(query);
      setResults(items);
    }
    load();
  }, [query]);

  return (
    <div style={{ padding: 16, color: "#fff" }}>
      <h2>Results for: {query}</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {results.map((v) => (
          <SearchResultCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}
