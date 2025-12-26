// File: vite.config.js
// PCC v6.0 — Correct Vite config for GitHub Pages + React

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Must match your GitHub Pages repo name
  base: "/MyTube-Piped-Frontend/",
});
