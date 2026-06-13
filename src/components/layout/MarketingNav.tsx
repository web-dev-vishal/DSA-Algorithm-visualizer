import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { Menu, X, Zap, ChevronDown, Sun, Moon } from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  {
    label: "Solutions",
    href: "/solutions",
    children: [
      { label: "For Students", href: "/solutions#students" },
      { label: "For Educators", href: "/solutions#educators" },
      { label: "For Teams", href: "/solutions#teams" },
      { label: "For Enterprise", href: "/solutions#enterprise" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
];

export function MarketingNav(): ReactElement {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("algviz_dark");
      if (stored !== null) return stored === "1";
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("algviz_dark", dark ? "1" : "0");
    window.dispatchEvent(new Event("storage"));
  }, [dark]);

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem("algviz_dark");
        if (stored !== null) setDark(stored === "1");
      } catch {}
    };
    window.addEventListener("storage", handleSync);
    return () => window.removeEventListener("storage", handleSync);
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdown(null);
  }, [location.pathname]);

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between" aria-label="Main navigation">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0" aria-label="AlgoViz Pro home">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_2px_8px_rgba(99,102,241,0.4)] group-hover:shadow-[0_4px_14px_rgba(99,102,241,0.5)] transition-shadow">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-[15px] tracking-tight text-zinc-900 dark:text-white">
            Algo<span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Viz</span> Pro
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            link.children ? (
              <div key={link.label} className="relative">
                <button
                  className={clsx(
                    "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                  onClick={() => setDropdown(d => d === link.label ? null : link.label)}
                  aria-expanded={dropdown === link.label}
                  aria-haspopup="true"
                >
                  {link.label}
                  <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform", dropdown === link.label && "rotate-180")} />
                </button>
                {dropdown === link.label && (
                  <div className="absolute top-full mt-1 left-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-1.5 min-w-[180px] animate-[slideDown_0.15s_ease]">
                    {link.children.map(child => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className="block px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        onClick={() => setDropdown(null)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className={clsx(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950"
                    : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                {link.label}
              </Link>
            )
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 mr-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            type="button"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          {user ? (
            <Link to="/dashboard">
              <Button variant="primary" size="sm">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">Get started free</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile theme and menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors cursor-pointer"
            aria-label="Toggle theme"
            type="button"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            className="p-2 rounded-lg text-zinc-650 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 pb-4 animate-[slideDown_0.2s_ease]">
          <div className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              {user ? (
                <Link to="/dashboard"><Button variant="primary" className="w-full">Go to Dashboard</Button></Link>
              ) : (
                <>
                  <Link to="/login"><Button variant="secondary" className="w-full">Sign in</Button></Link>
                  <Link to="/signup"><Button variant="primary" className="w-full">Get started free</Button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
