// utils.js — shared helpers
// MIGRATION NOTE: These are framework-agnostic and can be moved to lib/utils.ts in Next.js.

export function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
}

export function hideError(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.classList.add('hidden');
}

export function setLoading(buttonEl, loading) {
  buttonEl.disabled = loading;
  buttonEl.dataset.originalText = buttonEl.dataset.originalText || buttonEl.textContent;
  buttonEl.textContent = loading ? 'Loading...' : buttonEl.dataset.originalText;
}

export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
