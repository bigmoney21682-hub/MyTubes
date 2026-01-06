/**
 * File: GlobalPlayerFix.js
 */

console.log("[PLAYER] GlobalPlayerFix loaded");

function dbg(label, data = {}) {
  console.group(`[PLAYER] ${label}`);
  for (const k in data) console.log(k + ":", data[k]);
  console.groupEnd();
}

window.GlobalPlayer = {
  player: null,

  ensure() {
    if (this.player) return;

    const el = document.getElementById("yt-player");
    if (!el) {
      dbg("ensure() → yt-player not in DOM yet");
      return;
    }

    dbg("Creating YT.Player");

    this.player = new YT.Player("yt-player", {
      height: "100%",
      width: "100%",
      playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
      events: {
        onReady: () => dbg("onReady"),
        onStateChange: (e) => dbg("onStateChange", { state: e.data }),
        onError: (e) => dbg("onError", { error: e.data })
      }
    });
  },

  loadVideo(id) {
    dbg("loadVideo()", { id });

    if (!this.player) {
      dbg("Player missing → calling ensure()");
      this.ensure();
    }

    try {
      this.player.loadVideoById(id);
    } catch (err) {
      dbg("loadVideo() exception", { err });
    }
  }
};

window.onYouTubeIframeAPIReady = () => {
  dbg("Iframe API Ready");
  window.GlobalPlayer.ensure();
};
