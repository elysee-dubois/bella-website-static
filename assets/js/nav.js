// Sticky nav behavior:
//   - "scrolled" state triggers the floating-pill style (>24px scroll)
//   - mobile menu open/close
//
// The HTML in partials/nav.html has data-* hooks this file binds to.

const header = document.querySelector("[data-nav-root]");
if (header) {
  const onScroll = () => {
    const scrolled = window.scrollY > 24;
    header.dataset.scrolled = scrolled ? "true" : "false";
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = header.querySelector("[data-nav-toggle]");
  const drawer = header.querySelector("[data-nav-drawer]");
  if (toggle && drawer) {
    const setOpen = (open) => {
      header.dataset.menuOpen = open ? "true" : "false";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      const iconOpen = toggle.querySelector("[data-icon-open]");
      const iconClose = toggle.querySelector("[data-icon-close]");
      if (iconOpen && iconClose) {
        iconOpen.classList.toggle("hidden", open);
        iconClose.classList.toggle("hidden", !open);
      }
    };
    toggle.addEventListener("click", () => {
      const open = header.dataset.menuOpen !== "true";
      setOpen(open);
    });
    drawer.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    setOpen(false);
  }
}
