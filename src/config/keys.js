// File: src/config/keys.js
// PCC v1.0 — Centralized YouTube API key registry
// Keys are injected at build time via GitHub Actions (VITE_YT_API_PRIMARY, VITE_YT_API_FALLBACK1)

export const API_KEYS = {
  primary: import.meta.env.VITE_YT_API_PRIMARY,
  fallback1: import.meta.env.VITE_YT_API_FALLBACK1,
};
