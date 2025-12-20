// File: src/AppWrapper.jsx
import { useState } from "react";
import App from "./App";
import BootSplash from "./components/BootSplash";

export default function AppWrapper({ apiKey }) {
  const [ready, setReady] = useState(false);

  return (
    <>
      {!ready && <BootSplash onFinish={() => setReady(true)} />}
      {ready && <App apiKey={apiKey} bootSplashReady={ready} />}
    </>
  );
}
