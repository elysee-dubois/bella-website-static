// Reveal-on-scroll. Elements with [data-reveal] are observed; once any part
// of them passes the viewport's vertical 90% line, .is-visible is added.
// [data-reveal-stagger] containers stagger their direct [data-reveal-item]
// children by 80ms each, mirroring the React `RevealStagger` component.

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Stagger setup must run BEFORE we collect the [data-reveal] node list —
// stagger items get [data-reveal] added to them, and the observer only
// watches what we collect upfront.
document.querySelectorAll("[data-reveal-stagger]").forEach((parent) => {
  const items = parent.querySelectorAll("[data-reveal-item]");
  items.forEach((item, i) => {
    item.style.setProperty("--reveal-delay", `${0.05 + i * 0.08}s`);
    item.setAttribute("data-reveal", "");
  });
});

const reveals = document.querySelectorAll("[data-reveal]");

if (reduced) {
  reveals.forEach((el) => el.classList.add("is-visible"));
} else if (reveals.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "-10% 0px -10% 0px", threshold: 0 },
  );
  reveals.forEach((el) => io.observe(el));
}
