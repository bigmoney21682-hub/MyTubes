/**
 * File: App.jsx
 * Path: src/app/App.jsx
 * Description: Root application component. Mounts routing and global debug overlay.
 */

import { BrowserRouter } from "react-router-dom";
import Routes from "./routes";
import DebugOverlay from "../debug/DebugOverlay";

bootDebug.info("App.jsx mounted");

export default function App() {
  return (
    <BrowserRouter basename="/MyTube-Piped-Frontend">
      <Routes />
      <DebugOverlay />
    </BrowserRouter>
  );
}
