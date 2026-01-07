// File: vite.config.js
// Path: vite.config.js  bbb
// Description: Vite config for GitHub Pages deployment under /MyTube-Piped-Frontend/

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/MyTubes/", // REQUIRED for GitHub Pages
});
