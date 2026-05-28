import { buildApiUrl } from "./config";
import { apiFetch } from "./http";

export const listOrders = () => apiFetch(buildApiUrl("orders", "/orders"));

export const createOrder = (payload) =>
  apiFetch(buildApiUrl("orders", "/orders"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
