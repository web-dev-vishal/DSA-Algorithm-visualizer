import { z } from 'zod';

// ── Auth Schemas ───────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Invalid email address')
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

// ── User Schemas ───────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional()
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(['owner', 'admin', 'manager', 'member', 'guest']).optional(),
  plan: z.enum(['free', 'starter', 'pro', 'business', 'enterprise']).optional(),
  status: z.enum(['active', 'suspended', 'deactivated']).optional()
});

// ── Api Key Schemas ────────────────────────────────────────────────
export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Key name is required').max(50, 'Name must not exceed 50 characters')
});

export const updateApiKeySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional()
});

// ── Analysis Schemas ────────────────────────────────────────────────
export const analyzeSchema = z.object({
  code: z.string().min(1, 'Code is required to analyze'),
  language: z.string().min(1, 'Programming language is required'),
  array: z.array(z.number().int()).optional()
});

// ── Contact Schema ──────────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required')
});
