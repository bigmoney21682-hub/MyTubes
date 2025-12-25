// File: vite.config.js
// PCC v5.1 — Clean Vite config for GitHub Pages + React

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Must match your GitHub Pages repo name exactly
  base: "/MyTube-Piped-Frontend/",

  define: {
    "import.meta.env.VITE_YT_API_PRIMARY": JSON.stringify(
      process.env.VITE_YT_API_PRIMARY
    ),
    "import.meta.env.VITE_YT_API_FALLBACK1": JSON.stringify(
      process.env.VITE_YT_API_FALLBACK1
    ),
  },
});
