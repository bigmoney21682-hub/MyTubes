/**
 * File: App.jsx
 * Path: src/App.jsx
 * Description: App shell with router, error boundary, and DebugOverlay v3.
 */

import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./debug/ErrorBoundary";
import DebugOverlay from "./debug/DebugOverlay";
import Routes from "./app/routes";

export default function App() {
  return (
    <BrowserRouter basename="/MyTube-Piped-Frontend">
      <ErrorBoundary>
        {/* Main app content */}
        <Routes />

        {/* Global debug overlay */}
        <DebugOverlay />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
