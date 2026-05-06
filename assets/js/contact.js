// Contact form handler. Submits to POST /contact on the Bella API. Shows
// inline field errors on validation failure, a generic banner on network
// errors, and swaps the form for a success card on 2xx.

import { apiUrl } from "./config.js";

const form = document.querySelector("[data-contact-form]");
if (form) {
  const submitBtn = form.querySelector("[data-submit]");
  const labelIdle = submitBtn?.querySelector("[data-label-idle]");
  const labelLoading = submitBtn?.querySelector("[data-label-loading]");
  const banner = form.querySelector("[data-form-error]");
  const successCard = document.querySelector("[data-contact-success]");

  const setLoading = (loading) => {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    if (labelIdle && labelLoading) {
      labelIdle.classList.toggle("hidden", loading);
      labelLoading.classList.toggle("hidden", !loading);
    }
  };

  const clearErrors = () => {
    form
      .querySelectorAll("[data-field-error]")
      .forEach((el) => (el.textContent = ""));
    form
      .querySelectorAll("[data-input]")
      .forEach((el) => el.classList.remove("border-cherry", "focus:border-cherry"));
    if (banner) {
      banner.textContent = "";
      banner.classList.add("hidden");
    }
  };

  const showFieldError = (name, message) => {
    const errEl = form.querySelector(`[data-field-error="${name}"]`);
    if (errEl) errEl.textContent = message;
    const input = form.querySelector(`[name="${name}"][data-input]`);
    if (input) input.classList.add("border-cherry", "focus:border-cherry");
  };

  const showBanner = (message) => {
    if (!banner) return;
    banner.textContent = message;
    banner.classList.remove("hidden");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    setLoading(true);

    const formData = new FormData(form);
    const payload = {
      name: formData.get("name") || "",
      email: formData.get("email") || "",
      topic: formData.get("topic") || "",
      message: formData.get("message") || "",
    };

    try {
      const res = await fetch(apiUrl("/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response — treat as a server error.
      }

      if (res.ok && data?.ok) {
        if (successCard) {
          form.classList.add("hidden");
          successCard.classList.remove("hidden");
        } else {
          form.reset();
          showBanner("Thanks — we'll be in touch.");
        }
        return;
      }

      if (res.status === 400 && data?.fieldErrors) {
        for (const [name, msg] of Object.entries(data.fieldErrors)) {
          showFieldError(name, msg);
        }
        showBanner(data.message || "Please check the highlighted fields.");
      } else {
        showBanner(
          data?.message ||
            "Couldn't send your message. Please try again in a moment.",
        );
      }
    } catch {
      showBanner(
        "Couldn't reach the server. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  });
}
