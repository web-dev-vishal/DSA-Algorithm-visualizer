/**
 * Real authentication store backed by the production API.
 *
 * Replaces the previous mock implementation that accepted any password.
 *
 * Token strategy:
 * - Access tokens: stored in memory only (never in localStorage/sessionStorage)
 * - Refresh tokens: managed by the backend as httpOnly cookies (XSS-safe)
 * - On page reload: attempts a silent refresh via the refresh endpoint
 */
import type { User } from '../types';
import { apiClient, setAccessToken, clearAccessToken } from '../lib/apiClient';
import { queryClient } from '../lib/queryClient';

// ── Types ────────────────────────────────────────────────────────────
interface AuthResponse {
  accessToken: string;
  user: User;
}

interface AuthStore {
  getUser: () => User | null;
  subscribe: (callback: (user: User | null) => void) => () => void;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  rehydrate: () => Promise<void>;
}

// ── Internal state ───────────────────────────────────────────────────
let currentUser: User | null = null;
const subscribers = new Set<(user: User | null) => void>();

function notify(user: User | null): void {
  currentUser = user;
  subscribers.forEach(cb => cb(user));
}

// ── Store implementation ─────────────────────────────────────────────
export const authStore: AuthStore = {
  getUser() {
    return currentUser;
  },

  subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  async login(email: string, password: string): Promise<User> {
    const data = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    notify(data.user);
    return data.user;
  },

  async signup(name: string, email: string, password: string): Promise<User> {
    const data = await apiClient.post<AuthResponse>('/auth/register', { name, email, password });
    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
    if (data.user) {
      notify(data.user);
    }
    return data.user;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Logout should always succeed locally even if server is unreachable
    } finally {
      clearAccessToken();
      notify(null);
      // Clear all cached server state
      queryClient.clear();
    }
  },

  updateUser(updates: Partial<User>): void {
    if (!currentUser) return;
    notify({ ...currentUser, ...updates });
  },

  /**
   * Attempts a silent token refresh on application startup.
   * Called once from main.tsx to restore the user's session without requiring re-login.
   */
  async rehydrate(): Promise<void> {
    try {
      const data = await apiClient.post<AuthResponse>('/auth/refresh');
      if (data?.accessToken && data?.user) {
        setAccessToken(data.accessToken);
        notify(data.user);
      }
    } catch {
      // No valid refresh token — user needs to log in
      notify(null);
    }
  }
};

// ── Listen for forced logout events from the API client ─────────────
// Emitted when a 401 occurs and the refresh attempt also fails
window.addEventListener('auth:logout', () => {
  clearAccessToken();
  notify(null);
  queryClient.clear();
});

export default authStore;
