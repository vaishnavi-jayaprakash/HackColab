// Central API client. Every feature api file (task.api.js, git.api.js, ...)
// goes through this, so once the backend is live we only need to flip
// VITE_USE_MOCK to "false" in .env - no page code has to change.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

function getToken() {
  return localStorage.getItem("hackcolab_token");
}

/**
 * Thin wrapper around fetch for the real backend. Not used while
 * USE_MOCK is true, but kept fully wired so switching over later is
 * a one-line change per api file (call apiRequest instead of the mock).
 */
export async function apiRequest(path, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(errorBody.message || res.statusText, res.status);
  }

  if (res.status === 204) return null;
  return res.json();
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Simulates network latency so loading states are visible with mock data. */
export function mockDelay(data, ms = 400) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
