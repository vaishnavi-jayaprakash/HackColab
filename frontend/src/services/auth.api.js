import { apiRequest } from "./api.js";
import { adaptUser } from "./adapters.js";
import { clearWorkspace } from "./workspace.js";

export async function login({ email, password }) {
  const res = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  const token = res.data?.token;
  const user = adaptUser(res.data?.user);
  if (!token || !user) throw new Error(res.message || "Login failed");
  localStorage.setItem("hackcolab_token", token);
  clearWorkspace();
  return { user, token };
}

export async function signup({ name, email, password }) {
  const res = await apiRequest("/auth/signup", {
    method: "POST",
    body: { name, email, password },
  });
  const token = res.data?.token;
  const user = adaptUser(res.data?.user);
  if (!token || !user) throw new Error(res.message || "Signup failed");
  localStorage.setItem("hackcolab_token", token);
  clearWorkspace();
  return { user, token };
}

export async function getCurrentUser() {
  const res = await apiRequest("/auth/me");
  return adaptUser(res.data?.user);
}

export async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch {
    /* token may already be invalid */
  }
  localStorage.removeItem("hackcolab_token");
  clearWorkspace();
}

export function getStoredToken() {
  return localStorage.getItem("hackcolab_token");
}
