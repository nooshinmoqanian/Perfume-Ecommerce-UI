export const formatToman = (value) => {
  const amount = typeof value === "string" ? Number(value) : value;
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "-";
  }
  return `${new Intl.NumberFormat("fa-IR").format(Math.round(amount))} toman`;
};

export const normalizeNumberString = (value) =>
  String(value || "")
    .replace(/[\u06F0-\u06F9]/g, (char) => String(char.charCodeAt(0) - 1776))
    .replace(/[\u0660-\u0669]/g, (char) => String(char.charCodeAt(0) - 1632));
