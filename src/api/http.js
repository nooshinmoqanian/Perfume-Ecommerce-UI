const generateRequestId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const setLastRequestId = (requestId) => {
  try {
    if (requestId) {
      localStorage.setItem("last_x_request_id", requestId);
      window.dispatchEvent(new CustomEvent("request-id", { detail: requestId }));
    }
  } catch {
    // Ignore storage failures in private mode.
  }
};

export const getLastRequestId = () => {
  try {
    return localStorage.getItem("last_x_request_id");
  } catch {
    return null;
  }
};

export const apiFetch = async (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (!headers.has("x-request-id")) {
    headers.set("x-request-id", generateRequestId());
  }

  const response = await fetch(url, { ...options, headers });
  const requestId = response.headers.get("x-request-id");
  if (requestId) {
    setLastRequestId(requestId);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || response.statusText || "Request failed";
    throw new Error(message);
  }

  return data;
};
