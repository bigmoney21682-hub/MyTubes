// File: vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/MyTube-Piped-Frontend/", // matches your GitHub Pages repo
});
