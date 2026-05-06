// Android waitlist form. Single email field, posts to /waitlist, swaps
// to a success card on 2xx.

import { apiUrl } from "./config.js";

const form = document.querySelector("[data-waitlist-form]");
if (form) {
  const submitBtn = form.querySelector("[data-submit]");
  const labelIdle = submitBtn?.querySelector("[data-label-idle]");
  const labelLoading = submitBtn?.querySelector("[data-label-loading]");
  const errorEl = form.querySelector("[data-form-error]");
  const emailInput = form.querySelector("[name='email']");
  const successCard = document.querySelector("[data-waitlist-success]");

  const setLoading = (loading) => {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    if (labelIdle && labelLoading) {
      labelIdle.classList.toggle("hidden", loading);
      labelLoading.classList.toggle("hidden", !loading);
    }
  };

  const clearError = () => {
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.add("hidden");
    }
    if (emailInput) emailInput.classList.remove("border-cherry", "focus:border-cherry");
  };

  const showError = (msg) => {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.remove("hidden");
    }
    if (emailInput) emailInput.classList.add("border-cherry", "focus:border-cherry");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);

    const email = (emailInput?.value || "").trim();

    try {
      const res = await fetch(apiUrl("/waitlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // Treat non-JSON as a server error.
      }

      if (res.ok && data?.ok) {
        if (successCard) {
          form.classList.add("hidden");
          successCard.classList.remove("hidden");
        } else {
          form.reset();
        }
        return;
      }

      showError(
        data?.message ||
          "Couldn't add you to the list. Please try again in a moment.",
      );
    } catch {
      showError(
        "Couldn't reach the server. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  });
}
