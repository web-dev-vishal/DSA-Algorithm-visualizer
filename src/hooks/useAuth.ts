import { useState, useEffect } from "react";
import { authStore } from "../store/auth";
import type { User } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => authStore.getUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return authStore.subscribe(setUser);
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      await authStore.login(email, password);
    } finally {
      setLoading(false);
    }
  }

  async function signup(name: string, email: string, password: string) {
    setLoading(true);
    try {
      await authStore.signup(name, email, password);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    authStore.logout();
  }

  function updateUser(updates: Partial<User>) {
    authStore.updateUser(updates);
  }

  return { user, loading, login, signup, logout, updateUser, isAuthenticated: !!user };
}
