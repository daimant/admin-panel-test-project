import axios, { AxiosInstance } from "axios";
import type { AuthResponse, LoginPayload } from "../types";

const BASE_URL = "";
const api: AxiosInstance = axios.create({ baseURL: BASE_URL, withCredentials: true });

export async function login(username: string, password: string, expiresInMins = 60,): Promise<AuthResponse> {
  try {
    const payload: LoginPayload = { username, password, expiresInMins };
    const res = await api.post<AuthResponse>("/auth/login", payload);
    return res.data;
  } catch (err: unknown) {
    throw toApiError(err, "Failed to login");
  }
}

export async function getCurrentUser(token?: string): Promise<AuthResponse> {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const res = await api.get<AuthResponse>("/auth/me", { headers });
    return res.data;
  } catch (err) {
    throw toApiError(err, "Failed to fetch current user");
  }
}

export async function refreshSession(
  refreshToken?: string,
  expiresInMins = 60,
): Promise<AuthResponse> {
  try {
    const body: { refreshToken?: string; expiresInMins?: number } = { expiresInMins };
    if (refreshToken) body.refreshToken = refreshToken;
    const res = await api.post<AuthResponse>("/auth/refresh", body);
    return res.data;
  } catch (err: unknown) {
    throw toApiError(err, "Failed to refresh session");
  }
}

function toApiError(err: unknown, fallbackMessage = "API error"): Error {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;
    const serverMessage =
      (data && (data.message || data.error || data.msg)) ||
      (typeof data === "string" ? data : undefined);
    const messageParts = [fallbackMessage];
    if (serverMessage) messageParts.push(String(serverMessage));
    if (status) messageParts.push(`(status: ${status})`);
    return new Error(messageParts.join(" — "));
  }
  return new Error(fallbackMessage + (err ? ` — ${String(err)}` : ""));
}
