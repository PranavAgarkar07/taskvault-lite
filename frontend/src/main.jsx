import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
// import Home from "./Home.jsx";
import APP from "./App.jsx";
import OAuthCallback from "./OAuthCallback.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<APP />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
