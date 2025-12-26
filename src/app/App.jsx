/**
 * File: App.jsx
 * Path: src/app/App.jsx
 * Description: App shell with router, error boundary, and DebugOverlay v3.
 */

import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "../debug/ErrorBoundary";
import DebugOverlay from "../debug/DebugOverlay";
import Routes from "./routes";

export default function App() {
  return (
    <BrowserRouter basename="/MyTube-Piped-Frontend">
      <ErrorBoundary>
        {/* Main application routes */}
        <Routes />

        {/* Global debug overlay (always mounted) */}
        <DebugOverlay />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
