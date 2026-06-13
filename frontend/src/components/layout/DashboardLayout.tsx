import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import {
  Zap, LayoutDashboard, Code2, BarChart3, Users, Settings, Bell,
  Search, LogOut, Menu, X, CreditCard, Shield, BookOpen, Webhook,
  Moon, Sun, HelpCircle
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview",      href: "/dashboard" },
  { icon: Code2,           label: "Visualizer",    href: "/app" },
  { icon: BarChart3,       label: "Analytics",     href: "/dashboard/analytics" },
  { icon: BookOpen,        label: "History",       href: "/dashboard/history" },
  { icon: Webhook,         label: "API & Keys",    href: "/dashboard/api" },
  { icon: Users,           label: "Team",          href: "/dashboard/team" },
  { icon: CreditCard,      label: "Billing",       href: "/dashboard/billing" },
  { icon: Shield,          label: "Security",      href: "/dashboard/security" },
  { icon: Settings,        label: "Settings",      href: "/dashboard/settings" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  onToggleDark: () => void;
}

export function DashboardLayout({ children, darkMode, onToggleDark }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const freeBadge = { label: "Free", variant: "default" as const };
  const PLAN_BADGE = {
    free:       freeBadge,
    starter:    { label: "Starter",    variant: "primary" as const },
    pro:        { label: "Pro",        variant: "success" as const },
    business:   { label: "Business",   variant: "warning" as const },
    enterprise: { label: "Enterprise", variant: "warning" as const },
  };

  const planInfo = user ? (PLAN_BADGE[user.plan as keyof typeof PLAN_BADGE] ?? freeBadge) : freeBadge;

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={clsx(
      "flex flex-col h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800",
      mobile ? "w-full" : "w-60"
    )}>
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
            Algo<span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Viz</span> Pro
          </span>
        </Link>
        {mobile && (
          <button className="ml-auto p-1 text-zinc-500" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto" aria-label="Dashboard navigation">
        <ul className="space-y-0.5" role="list">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.href ||
              (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <item.icon className={clsx("w-4 h-4 flex-shrink-0", active ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Help & support */}
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-0.5">
          <Link to="/help" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
            <HelpCircle className="w-4 h-4" />
            Help & Support
          </Link>
        </div>
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer group"
          onClick={() => setUserMenuOpen(o => !o)}
        >
          <Avatar src={user?.avatar} name={user?.name ?? ""} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
          </div>
          <Badge variant={planInfo.variant} className="text-[10px] px-1.5 py-0.5 flex-shrink-0">
            {planInfo.label}
          </Badge>
        </div>
        {userMenuOpen && (
          <div className="mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg p-1 animate-[slideDown_0.1s_ease]">
            <Link to="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <Settings className="w-3.5 h-3.5" /> Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 animate-slide-right">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center gap-3 px-4 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <button
            className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="search"
                placeholder="Search algorithms, history…"
                className="w-full h-8 pl-8 pr-3 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-900 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded">⌘K</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Dark mode */}
            <button
              onClick={onToggleDark}
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <button className="relative p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" aria-hidden="true" />
            </button>

            {/* User avatar */}
            <Avatar src={user?.avatar} name={user?.name ?? ""} size="sm" className="cursor-pointer" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
