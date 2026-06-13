import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { signup, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = PASSWORD_RULES.filter(r => r.test(password)).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!name || !email || !password) return;
    if (passwordStrength < 3) return;
    if (!agreed) return;
    try {
      await signup(name, email, password);
      navigate("/onboarding");
    } catch {
      // Error is set in the auth hook state
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-lg text-zinc-900 dark:text-white">
            Algo<span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Viz</span> Pro
          </span>
        </Link>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Create your account</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Start for free — no credit card required</p>

          {error && (
            <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-xl p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="name"
              label="Full name"
              type="text"
              placeholder="Alex Johnson"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
              required
              disabled={loading}
            />
            <Input
              id="email"
              label="Work email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
            />

            {/* Password with strength indicator */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className="w-full rounded-[10px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 px-3 py-2 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div className="flex gap-1 mt-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                      i < passwordStrength
                        ? passwordStrength === 1 ? "bg-rose-400" : passwordStrength === 2 ? "bg-amber-400" : "bg-emerald-400"
                        : "bg-zinc-200 dark:bg-zinc-700"
                    }`} />
                  ))}
                </div>
              )}
              {/* Rules */}
              {password && (
                <div className="space-y-1 mt-1">
                  {PASSWORD_RULES.map(r => (
                    <div key={r.label} className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3 h-3 ${r.test(password) ? "text-emerald-500" : "text-zinc-300 dark:text-zinc-700"}`} />
                      <span className={`text-[11px] ${r.test(password) ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2.5">
              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                disabled={loading}
                className="mt-0.5 rounded border-zinc-300 text-indigo-500 focus:ring-indigo-500"
              />
              <label htmlFor="terms" className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed cursor-pointer">
                I agree to the{" "}
                <Link to="/terms" className="text-indigo-500 hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-indigo-500 hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button
              id="signup-submit"
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={!name || !email || !password || passwordStrength < 3 || !agreed || loading}
            >
              Create free account
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
