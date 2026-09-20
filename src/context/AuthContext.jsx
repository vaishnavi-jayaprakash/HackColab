import { createContext, useEffect, useState, useCallback } from "react";
import * as authApi from "../services/auth.api.js";
import { currentUser as mockUser } from "../mock/dashboard.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authApi.getStoredToken();
    // In mock mode we just trust the stored token and hydrate the
    // demo user; the real backend would verify the token here instead.
    if (token) setUser(mockUser);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: loggedInUser } = await authApi.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const signup = useCallback(async (details) => {
    const { user: newUser } = await authApi.signup(details);
    setUser(newUser);
    return newUser;
  }, []);

  const loginWithProvider = useCallback(async (provider) => {
    const { user: loggedInUser } = await authApi.loginWithProvider(provider);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: Boolean(user), login, signup, loginWithProvider, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
