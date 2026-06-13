import { useState, useEffect, useCallback } from "react";
import { authStore } from "../store/auth";
import type { User } from "../types";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(() => authStore.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return authStore.subscribe(setUser);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authStore.login(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
      throw err; // Re-throw so the calling component can also handle it
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authStore.signup(name, email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await authStore.logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>): void => {
    authStore.updateUser(updates);
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,
    clearError,
    isAuthenticated: !!user
  };
}
