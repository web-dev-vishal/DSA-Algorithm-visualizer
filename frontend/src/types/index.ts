// ── Core SaaS Types ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "owner" | "admin" | "manager" | "member" | "guest";
  plan: PlanId;
  createdAt: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
}

export interface Org {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: PlanId;
  seats: number;
  usedSeats: number;
  owner: string;
}

export interface TeamMember {
  id: string;
  user: User;
  role: "owner" | "admin" | "manager" | "member" | "guest";
  joinedAt: string;
  status: "active" | "invited" | "suspended";
}

export type PlanId = "free" | "starter" | "pro" | "business" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  limits: {
    analyses: number | "unlimited";
    teamMembers: number | "unlimited";
    apiCalls: number | "unlimited";
    historyDays: number | "unlimited";
  };
  highlighted?: boolean;
  badge?: string;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error" | "security";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  action?: { label: string; href: string };
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  status: "success" | "failure";
}

export interface UsageStat {
  date: string;
  analyses: number;
  apiCalls: number;
  users: number;
}

export interface AnalysisHistory {
  id: string;
  algorithmName: string;
  category: string;
  language: string;
  timeComplexity: string;
  spaceComplexity: string;
  createdAt: string;
  shared: boolean;
}
