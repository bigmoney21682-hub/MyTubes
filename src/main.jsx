import "./player/GlobalPlayerFix.js";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./app/App.jsx";
import { PlaylistProvider } from "./contexts/PlaylistContext.jsx";
import { PlayerProvider } from "./player/PlayerContext.jsx";

import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <PlaylistProvider>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </PlaylistProvider>
  </BrowserRouter>
);
