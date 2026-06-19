import { buildApiUrl } from "./config";
import { apiFetch } from "./http";

export const listProducts = () => apiFetch(buildApiUrl("products", "/products"));
export const getProduct = (id) => apiFetch(buildApiUrl("products", `/products/${id}`));
export const reserveProduct = (payload) =>
  apiFetch(buildApiUrl("products", "/products/reserve"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const listCategories = () => apiFetch(buildApiUrl("products", "/categories"));
export const createCategory = (name) =>
  apiFetch(buildApiUrl("products", "/categories/add"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
export const deleteCategory = (id) =>
  apiFetch(buildApiUrl("products", `/categories/${id}`), { method: "DELETE" });

export const createProduct = (formData) =>
  apiFetch(buildApiUrl("products", "/products"), {
    method: "POST",
    body: formData,
  });

export const updateProduct = (id, payload) =>
  apiFetch(buildApiUrl("products", `/products/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const deleteProduct = (id) =>
  apiFetch(buildApiUrl("products", `/products/${id}`), { method: "DELETE" });

export const uploadProductImage = (id, formData) =>
  apiFetch(buildApiUrl("products", `/products/${id}/image`), {
    method: "POST",
    body: formData,
  });

export const getProductImageUrl = (id) => buildApiUrl("products", `/products/${id}/image`);
