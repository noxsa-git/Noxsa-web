import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Npm packages__
import { RouterProvider } from "react-router/dom";
import { HelmetProvider } from "react-helmet-async";
// Components__
import "./index.css";
import router from "./routes/routes.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </StrictMode>,
);