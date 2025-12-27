/**
 * File: ErrorBoundary.jsx
 * Path: src/debug/ErrorBoundary.jsx
 * Description: Catches React render errors and logs them to the debug system.
 */

import React from "react";
import { debugLog } from "./debugBus";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true };
  }

  componentDidCatch(err, info) {
    debugLog("ERROR", "React error: " + err.message, info);
    window.bootDebug?.error("React crashed: " + err.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: "red" }}>
          <h2>Something went wrong.</h2>
        </div>
      );
    }
    return this.props.children;
  }
}
