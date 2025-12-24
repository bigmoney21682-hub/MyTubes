// File: vite.config.js
// PCC v3.0 — Force Vite to expose GitHub Secrets at build time

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/MyTube-Piped-Frontend/",
  define: {
    "import.meta.env.VITE_YT_API_PRIMARY": JSON.stringify(process.env.VITE_YT_API_PRIMARY),
    "import.meta.env.VITE_YT_API_FALLBACK1": JSON.stringify(process.env.VITE_YT_API_FALLBACK1),
  },
});
