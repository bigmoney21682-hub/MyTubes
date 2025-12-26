/**
 * File: vite.config.js
 * Path: vite.config.js
 * Description: Vite configuration with correct base path for GitHub Pages deployment.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/MyTube-Piped-Frontend/"
});
