/**
 * Lightweight auth store using localStorage + custom event bus.
 * In production, replace with a real auth provider (Clerk, Auth0, Supabase, etc.)
 */
import type { User } from "../types";

const KEY = "algviz_user";

// ── Mock user for demo purposes ────────────────────────────────────
export const DEMO_USER: User = {
  id: "user_demo_001",
  email: "demo@algoviz.pro",
  name: "Alex Johnson",
  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=AlexJohnson",
  role: "owner",
  plan: "pro",
  createdAt: "2024-01-15T10:00:00Z",
  emailVerified: true,
  mfaEnabled: false,
};

type AuthListener = (user: User | null) => void;
const listeners = new Set<AuthListener>();

function notify(user: User | null) {
  listeners.forEach(fn => fn(user));
}

export const authStore = {
  getUser(): User | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  login(email: string, _password: string): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = { ...DEMO_USER, email };
        localStorage.setItem(KEY, JSON.stringify(user));
        notify(user);
        resolve(user);
      }, 800);
    });
  },

  signup(name: string, email: string, _password: string): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = { ...DEMO_USER, name, email, plan: "free", id: `user_${Date.now()}` };
        localStorage.setItem(KEY, JSON.stringify(user));
        notify(user);
        resolve(user);
      }, 1000);
    });
  },

  logout(): void {
    localStorage.removeItem(KEY);
    notify(null);
  },

  subscribe(fn: AuthListener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
