// FAQ accordion. Open one panel at a time. The first item starts open to
// match the React version's default state.
document.querySelectorAll("[data-faq]").forEach((root) => {
  const items = root.querySelectorAll(".faq-item");
  items.forEach((item, i) => {
    if (i === 0) item.dataset.open = "true";
    const btn = item.querySelector("button");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const isOpen = item.dataset.open === "true";
      items.forEach((other) => (other.dataset.open = "false"));
      item.dataset.open = isOpen ? "false" : "true";
      items.forEach((other) => {
        const otherBtn = other.querySelector("button");
        if (otherBtn) {
          otherBtn.setAttribute(
            "aria-expanded",
            other.dataset.open === "true" ? "true" : "false",
          );
        }
      });
    });
    btn.setAttribute(
      "aria-expanded",
      item.dataset.open === "true" ? "true" : "false",
    );
  });
});
