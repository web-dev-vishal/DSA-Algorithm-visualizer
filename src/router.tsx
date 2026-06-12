import { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MarketingNav } from "./components/layout/MarketingNav";
import { Footer } from "./components/layout/Footer";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Skeleton } from "./components/ui/Skeleton";
import { useAuth } from "./hooks/useAuth";

// ── Marketing pages ────────────────────────────────────────────────
const HomePage     = lazy(() => import("./pages/marketing/HomePage").then(m => ({ default: m.HomePage })));
const PricingPage  = lazy(() => import("./pages/marketing/PricingPage").then(m => ({ default: m.PricingPage })));
const FeaturesPage = lazy(() => import("./pages/marketing/FeaturesPage").then(m => ({ default: m.FeaturesPage })));
const AboutPage    = lazy(() => import("./pages/marketing/AboutPage").then(m => ({ default: m.AboutPage })));
const ContactPage  = lazy(() => import("./pages/marketing/ContactPage").then(m => ({ default: m.ContactPage })));
const BlogPage     = lazy(() => import("./pages/marketing/BlogPage").then(m => ({ default: m.BlogPage })));
const DocsPage     = lazy(() => import("./pages/marketing/DocsPage").then(m => ({ default: m.DocsPage })));
const PrivacyPage  = lazy(() => import("./pages/marketing/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const TermsPage    = lazy(() => import("./pages/marketing/TermsPage").then(m => ({ default: m.TermsPage })));
const NotFoundPage = lazy(() => import("./pages/marketing/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

// ── Auth pages ─────────────────────────────────────────────────────
const LoginPage    = lazy(() => import("./pages/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const SignupPage   = lazy(() => import("./pages/auth/SignupPage").then(m => ({ default: m.SignupPage })));

// ── Onboarding ─────────────────────────────────────────────────────
const OnboardingPage = lazy(() => import("./pages/onboarding/OnboardingPage").then(m => ({ default: m.OnboardingPage })));

// ── Dashboard pages ────────────────────────────────────────────────
const DashboardHome  = lazy(() => import("./pages/dashboard/DashboardHome").then(m => ({ default: m.DashboardHome })));
const AnalyticsPage  = lazy(() => import("./pages/dashboard/AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));
const HistoryPage    = lazy(() => import("./pages/dashboard/HistoryPage").then(m => ({ default: m.HistoryPage })));
const APIPage        = lazy(() => import("./pages/dashboard/APIPage").then(m => ({ default: m.APIPage })));
const BillingPage    = lazy(() => import("./pages/dashboard/BillingPage").then(m => ({ default: m.BillingPage })));
const TeamPage       = lazy(() => import("./pages/dashboard/TeamPage").then(m => ({ default: m.TeamPage })));
const SettingsPage   = lazy(() => import("./pages/dashboard/SettingsPage").then(m => ({ default: m.SettingsPage })));

// ── The original App (visualizer) ─────────────────────────────────
const VisualizerApp = lazy(() => import("./App").then(m => ({ default: m.default })));

// ── Helpers ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 space-y-4">
      <Skeleton className="h-8 w-64 mx-auto" />
      <Skeleton className="h-4 w-96 mx-auto" />
      <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 mt-8">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

// ── Dark mode ──────────────────────────────────────────────────────
function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem("algviz_dark");
    if (stored !== null) return stored === "1";
  } catch {}
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyDark(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

// ── Marketing layout ───────────────────────────────────────────────
function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
      <Footer />
    </>
  );
}

// ── Dashboard layout wrapper ───────────────────────────────────────
function DashboardWrapper({ children, darkMode, onToggleDark }: { children: React.ReactNode; darkMode: boolean; onToggleDark: () => void }) {
  return (
    <RequireAuth>
      <DashboardLayout darkMode={darkMode} onToggleDark={onToggleDark}>
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </DashboardLayout>
    </RequireAuth>
  );
}

// ── Root ───────────────────────────────────────────────────────────
export function AppRouter() {
  const [darkMode, setDarkMode] = useState(getInitialDark);

  useEffect(() => {
    applyDark(darkMode);
    localStorage.setItem("algviz_dark", darkMode ? "1" : "0");
  }, [darkMode]);

  function toggleDark() { setDarkMode(d => !d); }

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Marketing ──────────────────────────── */}
        <Route path="/" element={<MarketingLayout><HomePage /></MarketingLayout>} />
        <Route path="/features" element={<MarketingLayout><FeaturesPage /></MarketingLayout>} />
        <Route path="/pricing"  element={<MarketingLayout><PricingPage /></MarketingLayout>} />
        <Route path="/about"    element={<MarketingLayout><AboutPage /></MarketingLayout>} />
        <Route path="/contact"  element={<MarketingLayout><ContactPage /></MarketingLayout>} />
        <Route path="/blog"     element={<MarketingLayout><BlogPage /></MarketingLayout>} />
        <Route path="/blog/:slug" element={<MarketingLayout><BlogPage /></MarketingLayout>} />
        <Route path="/docs"     element={<MarketingLayout><DocsPage /></MarketingLayout>} />
        <Route path="/api-docs" element={<MarketingLayout><DocsPage /></MarketingLayout>} />
        <Route path="/privacy"  element={<MarketingLayout><PrivacyPage /></MarketingLayout>} />
        <Route path="/terms"    element={<MarketingLayout><TermsPage /></MarketingLayout>} />
        <Route path="/cookies"  element={<MarketingLayout><PrivacyPage /></MarketingLayout>} />
        <Route path="/security" element={<MarketingLayout><FeaturesPage /></MarketingLayout>} />
        <Route path="/solutions" element={<MarketingLayout><FeaturesPage /></MarketingLayout>} />
        <Route path="/integrations" element={<MarketingLayout><FeaturesPage /></MarketingLayout>} />
        <Route path="/careers"  element={<MarketingLayout><AboutPage /></MarketingLayout>} />
        <Route path="/partners" element={<MarketingLayout><AboutPage /></MarketingLayout>} />
        <Route path="/help"     element={<MarketingLayout><DocsPage /></MarketingLayout>} />
        <Route path="/status"   element={<MarketingLayout><ContactPage /></MarketingLayout>} />
        <Route path="/stories"  element={<MarketingLayout><BlogPage /></MarketingLayout>} />
        <Route path="/gdpr"     element={<MarketingLayout><PrivacyPage /></MarketingLayout>} />
        <Route path="/changelog" element={<MarketingLayout><BlogPage /></MarketingLayout>} />

        {/* ── Auth ───────────────────────────────── */}
        <Route path="/login"  element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
        <Route path="/signup" element={<Suspense fallback={<PageLoader />}><SignupPage /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />

        {/* ── Onboarding ─────────────────────────── */}
        <Route path="/onboarding" element={
          <RequireAuth>
            <Suspense fallback={<PageLoader />}><OnboardingPage /></Suspense>
          </RequireAuth>
        } />

        {/* ── Visualizer app (no marketing nav) ──── */}
        <Route path="/app" element={
          <Suspense fallback={<PageLoader />}><VisualizerApp /></Suspense>
        } />

        {/* ── Dashboard ──────────────────────────── */}
        <Route path="/dashboard" element={
          <DashboardWrapper darkMode={darkMode} onToggleDark={toggleDark}>
            <DashboardHome />
          </DashboardWrapper>
        } />
        <Route path="/dashboard/billing" element={
          <DashboardWrapper darkMode={darkMode} onToggleDark={toggleDark}>
            <BillingPage />
          </DashboardWrapper>
        } />
        <Route path="/dashboard/team" element={
          <DashboardWrapper darkMode={darkMode} onToggleDark={toggleDark}>
            <TeamPage />
          </DashboardWrapper>
        } />
        <Route path="/dashboard/settings" element={
          <DashboardWrapper darkMode={darkMode} onToggleDark={toggleDark}>
            <SettingsPage />
          </DashboardWrapper>
        } />
        <Route path="/dashboard/analytics" element={
          <DashboardWrapper darkMode={darkMode} onToggleDark={toggleDark}>
            <AnalyticsPage />
          </DashboardWrapper>
        } />
        <Route path="/dashboard/history" element={
          <DashboardWrapper darkMode={darkMode} onToggleDark={toggleDark}>
            <HistoryPage />
          </DashboardWrapper>
        } />
        <Route path="/dashboard/api" element={
          <DashboardWrapper darkMode={darkMode} onToggleDark={toggleDark}>
            <APIPage />
          </DashboardWrapper>
        } />
        <Route path="/dashboard/security" element={
          <DashboardWrapper darkMode={darkMode} onToggleDark={toggleDark}>
            <SettingsPage defaultTab="security" />
          </DashboardWrapper>
        } />

        {/* ── 404 ────────────────────────────────── */}
        <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
      </Routes>
    </BrowserRouter>
  );
}
