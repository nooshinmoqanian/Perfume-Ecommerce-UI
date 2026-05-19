const trimTrailingSlash = (value) => String(value || "").replace(/\/$/, "");

export const API_BASES = {
  orders: trimTrailingSlash(import.meta.env.VITE_ORDERS_BASE || "http://localhost:3001"),
  products: trimTrailingSlash(import.meta.env.VITE_PRODUCTS_BASE || "http://localhost:3002"),
  auth: trimTrailingSlash(import.meta.env.VITE_AUTH_BASE || "http://localhost:3004"),
  notifications: trimTrailingSlash(import.meta.env.VITE_NOTIFICATIONS_BASE || "http://localhost:3003"),
};

export const buildApiUrl = (service, path = "") => {
  const base = API_BASES[service];
  if (!base) {
    throw new Error(`Unknown API service: ${service}`);
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api${normalizedPath}`;
};
