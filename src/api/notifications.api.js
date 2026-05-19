import { buildApiUrl } from "./config";
import { apiFetch } from "./http";

export const listNotifications = (limit = 50) =>
  apiFetch(buildApiUrl("notifications", `/notifications?limit=${limit}`));

export const listKafkaMessages = (limit = 200) =>
  apiFetch(buildApiUrl("notifications", `/kafka/messages?limit=${limit}`));

export const getKafkaStreamUrl = () => buildApiUrl("notifications", "/kafka/stream");
