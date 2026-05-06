// Light-touch scroll parallax. Elements with [data-parallax] track their
// progress through the viewport; their inner [data-parallax-inner] gets
// translated up to ±30px on Y. Mirrors the home hero's subtle effect.

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduced) {
  const targets = document.querySelectorAll("[data-parallax]");
  if (targets.length) {
    const update = () => {
      for (const t of targets) {
        const inner = t.querySelector("[data-parallax-inner]");
        if (!inner) continue;
        const rect = t.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const total = vh + rect.height;
        const progress = Math.min(1, Math.max(0, (vh - rect.top) / total));
        const y = (progress - 0.5) * -60;
        inner.style.transform = `translateY(${y.toFixed(1)}px)`;
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }
}
