import { apiRequest, USE_MOCK, mockDelay } from "./api.js";
import { currentUser } from "../mock/dashboard.js";

export async function login({ email, password }) {
  if (USE_MOCK) {
    if (!email || !password) throw new Error("Email and password are required.");
    const token = "mock-token-" + Date.now();
    localStorage.setItem("hackcolab_token", token);
    return mockDelay({ user: currentUser, token });
  }
  const data = await apiRequest("/auth/login", { method: "POST", body: { email, password } });
  localStorage.setItem("hackcolab_token", data.token);
  return data;
}

export async function signup({ name, email, password }) {
  if (USE_MOCK) {
    const token = "mock-token-" + Date.now();
    localStorage.setItem("hackcolab_token", token);
    return mockDelay({ user: { ...currentUser, name }, token });
  }
  const data = await apiRequest("/auth/signup", { method: "POST", body: { name, email, password } });
  localStorage.setItem("hackcolab_token", data.token);
  return data;
}

export async function loginWithProvider(provider) {
  if (USE_MOCK) {
    const token = "mock-token-" + Date.now();
    localStorage.setItem("hackcolab_token", token);
    return mockDelay({ user: currentUser, token });
  }
  return apiRequest(`/auth/oauth/${provider}`, { method: "POST" });
}

export function logout() {
  localStorage.removeItem("hackcolab_token");
}

export function getStoredToken() {
  return localStorage.getItem("hackcolab_token");
}
