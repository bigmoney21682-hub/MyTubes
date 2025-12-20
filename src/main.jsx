import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import BootSplash from "./components/BootSplash";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

function AppWrapper() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && <BootSplash onFinish={() => setSplashDone(true)} />}
      {splashDone && (
        <BrowserRouter>
          <App apiKey={process.env.VITE_YOUTUBE_API_KEY} />
        </BrowserRouter>
      )}
    </>
  );
}

root.render(<AppWrapper />);
