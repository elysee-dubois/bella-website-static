// Single source of truth for the API base URL. Everything else (forms, etc.)
// imports `apiUrl()` and never builds URLs by hand. Switching is hostname-
// based — if we're loaded from localhost we hit the dev API on :8787;
// otherwise we hit the production API on Vercel.

const PROD_API = "https://bella-website-api-bella-app.vercel.app";
const DEV_API = "http://localhost:8787";

function isLocalHost() {
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0";
}

export function apiBase() {
  return isLocalHost() ? DEV_API : PROD_API;
}

export function apiUrl(path) {
  const base = apiBase();
  return base + (path.startsWith("/") ? path : "/" + path);
}
