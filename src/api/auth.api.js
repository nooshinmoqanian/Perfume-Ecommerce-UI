import { buildApiUrl } from "./config";
import { apiFetch } from "./http";

export const login = (payload) =>
  apiFetch(buildApiUrl("auth", "/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const register = (payload) =>
  apiFetch(buildApiUrl("auth", "/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const getMe = (token) =>
  apiFetch(buildApiUrl("auth", "/me"), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

export const listUsers = (params, token) => {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));

  return apiFetch(buildApiUrl("auth", `/users?${search.toString()}`), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const createUser = (payload) =>
  apiFetch(buildApiUrl("auth", "/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const updateUserRole = (id, role, token) =>
  apiFetch(buildApiUrl("auth", `/users/${id}/role`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ role }),
  });
