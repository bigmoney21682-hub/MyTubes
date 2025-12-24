import "./initApiKey";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom";
import { PlayerProvider } from "./contexts/PlayerContext";
import { PlaylistProvider } from "./contexts/PlaylistContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <PlaylistProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </PlaylistProvider>
    </HashRouter>
  </React.StrictMode>
);
