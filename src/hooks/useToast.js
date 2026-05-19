export const showToast = (message, tone = "info") => {
  try {
    window.dispatchEvent(new CustomEvent("app-alert", { detail: { message, tone } }));
  } catch {
    // Ignore event dispatch errors.
  }
};
