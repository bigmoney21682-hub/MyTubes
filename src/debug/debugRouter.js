/**
 * File: debugRouter.js
 * Path: src/debug/debugRouter.js
 * Description: Emits router navigation events into DebugOverlay v3.
 * Works with BrowserRouter (no basename, no hash).
 */

import { debugBus } from "./debugBus.js";

let lastPath = null;

export function installRouterLogger(navigate, location) {
  try {
    const path = location.pathname + location.search;

    // First load
    if (lastPath === null) {
      lastPath = path;

      // Delay initial router log so it doesn't interrupt first render
      setTimeout(() => {
        debugBus.log("ROUTER", "Initial route → " + path, {
          path,
          params: {},
          search: location.search
        });
      }, 0);

      return;
    }

    // Navigation event
    if (path !== lastPath) {
      const from = lastPath;
      const to = path;

      const direction =
        window.history.state?.idx > window.__lastRouterIdx
          ? "forward"
          : "back";

      window.__lastRouterIdx = window.history.state?.idx ?? 0;

      debugBus.log("ROUTER", `Route change → ${from} → ${to}`, {
        from,
        to,
        direction,
        search: location.search
      });

      lastPath = path;
    }
  } catch (err) {
    debugBus.log("ROUTER", "Router logger error: " + (err?.message || err));
  }
}
