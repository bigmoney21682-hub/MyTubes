/**
 * File: routes.jsx
 * Path: src/app/routes.jsx
 * Description: Central routing table for the application.
 */

import { Routes as Switch, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Watch from "../pages/Watch/Watch";

bootDebug.info("routes.jsx loaded");

export default function Routes() {
  return (
    <Switch>
      <Route path="/" element={<Home />} />
      <Route path="/watch/:id" element={<Watch />} />
    </Switch>
  );
}
