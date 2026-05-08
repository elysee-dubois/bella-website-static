// Prefetch internal pages so navigation feels instant.
//
//   1. On user intent — pointerenter / focusin / touchstart on an internal
//      <a> — we drop a <link rel="prefetch"> for that page. By the time the
//      click resolves, the HTML is already in cache and the browser swaps
//      to the new page with no network wait.
//
//   2. Once the page is idle, we eagerly prefetch the first handful of
//      internal links we find (typically the nav + primary CTAs), so even
//      keyboard-tab users hit a warm cache.
//
// We respect Save-Data and slow connections — no prefetching when the user
// has data-saving on or is on 2G.

const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const cheap =
  conn && (conn.saveData || /^(slow-2g|2g)$/i.test(conn.effectiveType || ""));

if (!cheap) {
  const prefetched = new Set([location.pathname + location.search]);

  const prefetchUrl = (url) => {
    if (prefetched.has(url)) return;
    prefetched.add(url);
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    link.as = "document";
    document.head.appendChild(link);
  };

  const normalize = (a) => {
    const href = a.getAttribute("href");
    if (!href) return null;
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return null;
    try {
      const u = new URL(href, location.href);
      if (u.origin !== location.origin) return null;
      const path = u.pathname + u.search;
      if (path === location.pathname + location.search) return null;
      return path;
    } catch {
      return null;
    }
  };

  // On-intent prefetch — fires the moment the cursor enters / a link gains
  // focus / a finger touches. Capture phase + delegated to <body> so we
  // catch links rendered after page load too.
  const onIntent = (e) => {
    const a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    const url = normalize(a);
    if (url) prefetchUrl(url);
  };
  document.addEventListener("pointerenter", onIntent, { capture: true, passive: true });
  document.addEventListener("focusin", onIntent, { passive: true });
  document.addEventListener("touchstart", onIntent, { capture: true, passive: true });

  // Idle-time eager prefetch — once the page is fully painted and the main
  // thread is free, warm the cache for the most-likely-next links. Cap at
  // 5 so we don't blow the data budget.
  const eagerLimit = 5;
  const ric = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
  ric(
    () => {
      let count = 0;
      for (const a of document.querySelectorAll("a[href]")) {
        if (count >= eagerLimit) break;
        const url = normalize(a);
        if (!url || prefetched.has(url)) continue;
        prefetchUrl(url);
        count++;
      }
    },
    { timeout: 3000 },
  );
}
