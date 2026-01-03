/**
 * File: NetworkLogger.js
 * Path: src/debug/NetworkLogger.js
 * Description:
 *   Wraps fetch/XHR to log network activity into debugBus/bootDebug
 *   without ever throwing or breaking the app.
 */

import { debugBus } from "./debugBus.js";

function safeBootLog(type, msg, payload) {
  try {
    if (type === "ERROR") {
      window.bootDebug?.error(msg, payload);
    } else {
      window.bootDebug?.log(msg, payload);
    }
  } catch (_) {}
}

export function installNetworkLogger() {
  // Avoid double-install
  if (window.__NETWORK_LOGGER_INSTALLED__) return;
  window.__NETWORK_LOGGER_INSTALLED__ = true;

  // Wrap fetch
  if (window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const [input, init] = args;
      const url = typeof input === "string" ? input : input?.url;

      debugBus.log("NETWORK", "fetch → " + url);
      safeBootLog("LOG", "NETWORK fetch → " + url, { init });

      try {
        const res = await originalFetch.apply(this, args);
        debugBus.log("NETWORK", "fetch OK → " + url);
        return res;
      } catch (err) {
        debugBus.log(
          "NETWORK",
          "fetch ERROR → " + url + " :: " + (err?.message || err)
        );
        safeBootLog(
          "ERROR",
          "NETWORK fetch ERROR → " + url,
          { error: err?.message || String(err) }
        );
        // IMPORTANT: do not rethrow; let callers handle it
        throw err;
      }
    };
  }

  // Wrap XHR (optional, but safe)
  const OriginalXHR = window.XMLHttpRequest;
  if (OriginalXHR) {
    function WrappedXHR() {
      const xhr = new OriginalXHR();
      let url = "";

      const open = xhr.open;
      xhr.open = function (method, requestUrl, ...rest) {
        url = requestUrl;
        debugBus.log("NETWORK", "XHR open → " + method + " " + url);
        safeBootLog("LOG", "NETWORK XHR open → " + method + " " + url);
        return open.call(xhr, method, requestUrl, ...rest);
      };

      xhr.addEventListener("load", function () {
        debugBus.log("NETWORK", "XHR load → " + url);
      });

      xhr.addEventListener("error", function () {
        debugBus.log("NETWORK", "XHR error → " + url);
        safeBootLog("ERROR", "NETWORK XHR error → " + url);
      });

      return xhr;
    }

    window.XMLHttpRequest = WrappedXHR;
  }
}
