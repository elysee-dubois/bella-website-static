// "How it works" tabs on the home page. Each [data-tabs] root contains
// [data-tab] buttons and [data-tab-panel] panels keyed by data-key.
//
// The phone screenshot and the section background colour both swap. The
// background tone is read from the active tab's data-tone attribute and
// applied as a CSS variable on the root.

const TONE_BG = {
  peony: "#FFD6DF",
  butter: "#FFE6A7",
  cloud: "#D4EBF6",
};

document.querySelectorAll("[data-tabs]").forEach((root) => {
  const buttons = root.querySelectorAll("[data-tab]");
  const panels = root.querySelectorAll("[data-tab-panel]");
  const stage = root.querySelector("[data-tab-stage]");

  const activate = (key) => {
    buttons.forEach((b) => {
      const active = b.dataset.tab === key;
      b.dataset.active = active ? "true" : "false";
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
    panels.forEach((p) => {
      const active = p.dataset.tabPanel === key;
      p.dataset.active = active ? "true" : "false";
      p.classList.toggle("hidden", !active);
    });
    const activeBtn = root.querySelector(`[data-tab="${key}"]`);
    const tone = activeBtn?.dataset.tone;
    if (stage && tone && TONE_BG[tone]) {
      stage.style.backgroundColor = TONE_BG[tone];
    }
  };

  buttons.forEach((b) => {
    b.addEventListener("click", () => activate(b.dataset.tab));
  });

  // Activate the first tab on load.
  const first = buttons[0];
  if (first) activate(first.dataset.tab);
});
