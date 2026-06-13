import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, AlertCircle, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { apiClient, ApiError } from "../../lib/apiClient";

type State = "idle" | "loading" | "success" | "error";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setState("loading");
    setErrorMsg("");

    try {
      await apiClient.post("/auth/forgot-password", { email });
      setState("success");
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : "Something went wrong. Please try again.";
      setErrorMsg(message);
      setState("error");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-lg text-zinc-900 dark:text-white">
            Algo<span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Viz</span> Pro
          </span>
        </Link>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8">
          {state === "success" ? (
            /* ── Success state ─────────────────────────────────────── */
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Check your inbox</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                If <strong className="text-zinc-700 dark:text-zinc-200">{email}</strong> is registered,
                we've sent password reset instructions. Check your spam folder if you don't see it.
              </p>
              <Link to="/login">
                <Button variant="primary" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            /* ── Form state ────────────────────────────────────────── */
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 mb-4">
                <Mail className="w-6 h-6 text-indigo-500" />
              </div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Forgot password?</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Enter your email and we'll send a reset link.
              </p>

              {state === "error" && (
                <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-xl p-3 mb-4">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-600 dark:text-rose-400">{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  id="forgot-email"
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={state === "loading"}
                />

                <Button
                  id="forgot-submit"
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={state === "loading"}
                  disabled={!email || state === "loading"}
                >
                  Send reset link
                </Button>
              </form>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 transition-colors mt-5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
