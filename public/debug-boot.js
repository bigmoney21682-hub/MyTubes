/**
 * File: debug-boot.js
 * Path: public/debug-boot.js
 * Description:
 *   Lightweight boot-time debugger that:
 *     - Captures global errors and rejections
 *     - Buffers logs until React is ready
 *     - Exposes window.bootDebug.{log,error,router,ready}
 *   IMPORTANT: Never re-throws — it only records.
 */

(function () {
  if (window.bootDebug) return;

  const buffer = [];
  let ready = false;

  function push(type, message, payload) {
    const entry = {
      ts: new Date().toISOString(),
      type,
      message,
      payload
    };

    if (!ready) {
      buffer.push(entry);
    }

    try {
      // Optional: mirror to console for dev
      if (type === "ERROR") {
        console.error("[BOOT]", message, payload || "");
      } else if (type === "ROUTER") {
        console.log("[BOOT ROUTER]", message, payload || "");
      } else {
        console.log("[BOOT]", message, payload || "");
      }
    } catch (_) {}
  }

  window.bootDebug = {
    log(msg, payload) {
      push("LOG", msg, payload);
    },
    error(msg, payload) {
      push("ERROR", msg, payload);
    },
    router(msg, payload) {
      push("ROUTER", msg, payload);
    },
    getBuffer() {
      return buffer.slice();
    },
    ready() {
      // Mark React as mounted; future logs can be ignored by overlay if desired
      ready = true;
      push("LOG", "bootDebug.ready() called");
    }
  };

  // Global error handlers — capture, DO NOT rethrow
  window.addEventListener("error", function (event) {
    try {
      const msg = event?.error?.message || event?.message || "Unknown error";
      window.bootDebug.error("GLOBAL ERROR: " + msg, {
        filename: event?.filename,
        lineno: event?.lineno,
        colno: event?.colno,
        stack: event?.error?.stack || null
      });
    } catch (_) {}
    // Do NOT throw or rethrow here
  });

  window.addEventListener("unhandledrejection", function (event) {
    try {
      const reason = event?.reason;
      const msg =
        (reason && reason.message) ||
        (typeof reason === "string" ? reason : "Unhandled rejection");

      window.bootDebug.error("UNHANDLED REJECTION: " + msg, {
        reason
      });
    } catch (_) {}
    // Do NOT throw or rethrow here
  });
})();
