// File: vite.config.js
// PCC v2.0 — Simple .env-based config for local + GitHub Pages.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/MyTube-Piped-Frontend/",
});
