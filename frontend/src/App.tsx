import { useState, useEffect } from "react";
import type React from "react";
import { 
  Zap, 
  Play, 
  Code2, 
  BarChart3, 
  Link as LinkIcon, 
  Moon, 
  Sun, 
  Check, 
  Menu, 
  X, 
  ArrowRight, 
  Cpu 
} from "lucide-react";

const GithubIcon = ({ className }: { className?: string }): React.JSX.Element => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }): React.JSX.Element => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }): React.JSX.Element => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
);


// ── Types ──────────────────────────────────────────────────────────

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface PricingTierProps {
  name: string;
  price: string;
  billing: string;
  features: string[];
  ctaText: string;
  highlighted?: boolean;
}

interface FooterColumnProps {
  title: string;
  links: { label: string; href: string }[];
}

// ── Sub-components ─────────────────────────────────────────────────

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps): React.ReactElement {
  return (
    <div className="flex flex-col p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:shadow-md transition-all duration-200 group">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mb-4 transition-colors group-hover:bg-indigo-600">
        <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

function PricingTier({ name, price, billing, features, ctaText, highlighted = false }: PricingTierProps): React.ReactElement {
  return (
    <div className={`flex flex-col p-8 rounded-2xl border transition-all duration-300 relative ${
      highlighted
        ? "border-indigo-600 dark:border-indigo-500 bg-white dark:bg-zinc-900 shadow-xl ring-2 ring-indigo-500/20 scale-105 z-10"
        : "border-slate-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/30 shadow-sm"
    }`}>
      {highlighted && (
        <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">{name}</h3>
      <div className="flex items-baseline gap-1 my-4">
        <span className="text-4xl font-black text-slate-900 dark:text-white">{price}</span>
        <span className="text-sm text-slate-400 dark:text-zinc-550 font-medium">{billing}</span>
      </div>
      
      <ul className="flex flex-col gap-3 my-6 flex-1">
        {features.map((feature: string, idx: number) => (
          <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-zinc-350">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={`w-full font-bold text-sm py-2.5 px-4 rounded-xl cursor-pointer transition-all duration-150 text-center active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          highlighted
            ? "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md"
            : "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 focus:ring-slate-400"
        }`}
      >
        {ctaText}
      </button>
    </div>
  );
}

function FooterColumn({ title, links }: FooterColumnProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest select-none">{title}</h4>
      <ul className="flex flex-col gap-2">
        {links.map((link, idx) => (
          <li key={idx}>
            <a
              href={link.href}
              className="text-sm text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────

export default function App(): React.ReactElement {
  const [dark, setDark] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  // Sync dark mode state with html tag
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Handle header background on scroll
  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 dark:bg-zinc-950 dark:text-zinc-200 font-sans transition-colors duration-300">
      
      {/* ── 1. STICKY NAVBAR ──────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-zinc-800/80 shadow-sm"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <a href="/" className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1" aria-label="AlgoViz Pro home">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-[15px] tracking-tight text-slate-900 dark:text-white">
              Algo<span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Viz</span> Pro
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1.5">
            {["Features", "Pricing", "Docs", "Login"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-zinc-350 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Nav Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark Mode toggle */}
            <button
              onClick={(): void => setDark(!dark)}
              className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-650 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              type="button"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-all select-none shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={(): void => setDark(!dark)}
              className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-650 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle theme"
              type="button"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={(): void => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-650 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              type="button"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-850 px-4 pb-4 flex flex-col gap-2 animate-[slideDown_0.2s_ease-out]">
            {["Features", "Pricing", "Docs", "Login"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={(): void => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
              >
                {item}
              </a>
            ))}
            <button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl cursor-pointer transition-all text-center mt-2"
            >
              Get Started Free
            </button>
          </div>
        )}
      </nav>

      {/* ── 2. HERO SECTION ───────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Ambient glow backgrounds */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[100px] dark:bg-violet-500/5" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 max-w-4xl leading-[1.1]">
            Understand Every Algorithm,{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
              Step by Step
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-500 dark:text-zinc-400 mb-10 max-w-2xl leading-relaxed">
            Write or paste code in C++, Python, Java, or JS. Our AI visualizes execution tables, explains lines in real time, and identifies runtime bugs instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
            <button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl cursor-pointer transition-all select-none shadow-md hover:shadow active:scale-[0.98] w-full sm:w-auto flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-850 font-bold py-3 px-6 rounded-xl cursor-pointer transition-all select-none shadow-sm active:scale-[0.98] w-full sm:w-auto flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <Play className="w-4 h-4 fill-current text-indigo-500" /> Watch Interactive Demo
            </button>
          </div>

          {/* Dark-themed mock code editor preview */}
          <div className="w-full max-w-4xl rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-2xl overflow-hidden bg-zinc-950 text-left animate-slide-in">
            {/* Editor Title Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-850 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-3 text-xs text-zinc-500 font-mono font-medium">bubbleSort.ts</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                TypeScript
              </span>
            </div>
            
            {/* Editor Workspace Mock */}
            <div className="grid grid-cols-1 md:grid-cols-12 font-mono text-sm leading-relaxed p-6 gap-6">
              
              {/* Code lines pane */}
              <div className="md:col-span-7 flex flex-col overflow-x-auto text-zinc-350">
                {[
                  "function bubbleSort(arr: number[]): number[] {",
                  "  let n = arr.length;",
                  "  for (let i = 0; i < n - 1; i++) {",
                  "    for (let j = 0; j < n - i - 1; j++) {",
                  "      if (arr[j] > arr[j + 1]) {",
                  "        // swap elements",
                  "        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];",
                  "      }",
                  "    }",
                  "  }",
                  "  return arr;",
                  "}"
                ].map((line, i) => {
                  const active = i === 6;
                  return (
                    <div
                      key={i}
                      className={`flex items-start px-2 py-0.5 rounded border-l-2 ${
                        active 
                          ? "bg-indigo-500/10 border-indigo-500 text-indigo-300 font-bold" 
                          : "border-transparent"
                      }`}
                    >
                      <span className="w-5 text-right text-zinc-650 pr-3 select-none text-xs">{i + 1}</span>
                      <span className="whitespace-pre">{line}</span>
                    </div>
                  );
                })}
              </div>

              {/* Execution status pane */}
              <div className="md:col-span-5 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-zinc-850 pt-4 md:pt-0 md:pl-6">
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Live Array State</h4>
                  <div className="flex gap-1.5 flex-wrap">
                    {[1, 2, 5, 8].map((v, i) => {
                      const swap = i === 1 || i === 2;
                      return (
                        <div
                          key={i}
                          className={`w-9 h-9 border-2 rounded-lg flex items-center justify-center font-bold text-xs ${
                            swap
                              ? "bg-violet-950/40 border-violet-500 text-violet-300"
                              : "bg-zinc-900 border-zinc-800 text-zinc-400"
                          }`}
                        >
                          {v}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider select-none">AI Helper</span>
                  <p className="text-xs text-zinc-300 leading-normal font-sans">
                    Swapping indices <span className="text-violet-400 font-semibold">1</span> and <span className="text-violet-400 font-semibold">2</span> because 5 &gt; 2.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURES GRID ──────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/20" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1.5 rounded-full select-none">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-4 mb-4">
              Everything Needed to Master DSA
            </h2>
            <p className="text-base sm:text-lg text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">
              No more confusing debugging. Learn with a visual animation framework powered by advanced LLMs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Play}
              title="Live Visualization"
              description="Watch algorithms execute step-by-step with play, pause, and speed range controls. Every pointer transition is animated."
            />
            <FeatureCard
              icon={BarChart3}
              title="AI Complexity Analysis"
              description="Calculate asymptotic runtimes instantly. Receive O(N) time and space checks with comprehensive analysis reports."
            />
            <FeatureCard
              icon={Code2}
              title="Multi-Language Support"
              description="Submit algorithms written in C++, Python, Java, JavaScript, TypeScript, or Go, and analyze their behaviors instantly."
            />
            <FeatureCard
              icon={Cpu}
              title="Demo Library"
              description="Access a growing database of pre-loaded algorithms covering sorting, trees, graphs, backtracking, and dynamic programming."
            />
            <FeatureCard
              icon={LinkIcon}
              title="Shareable Links"
              description="Generate stable links of code snapshots and visualizer execution runs to share with colleagues or students."
            />
            <FeatureCard
              icon={Moon}
              title="Dark Mode"
              description="First-class dark mode designed to protect eyes during late-night coding sessions. Defaults to system settings."
            />
          </div>
        </div>
      </section>

      {/* ── 4. PRICING SECTION ─────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-zinc-900/10 border-t border-slate-200 dark:border-zinc-900" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1.5 rounded-full select-none">
              Pricing Plans
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-4 mb-4">
              Flexible Tiers for Any Developer
            </h2>
            <p className="text-base sm:text-lg text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Get started for free or unlock unlimited analyses, teams features, and public API usage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            <PricingTier
              name="Free"
              price="$0"
              billing="/ lifetime"
              ctaText="Get Started"
              features={[
                "50 analyses per month",
                "Standard visualizer access",
                "Community solution feed",
                "Core-languages support",
              ]}
            />
            
            <PricingTier
              name="Pro"
              price="$12"
              billing="/ month"
              ctaText="Upgrade to Pro"
              highlighted={true}
              features={[
                "Unlimited analyses",
                "Advanced AI model selectors",
                "10 team workspace files",
                "Priority support processing",
                "Shareable custom collections",
              ]}
            />

            <PricingTier
              name="Team"
              price="$49"
              billing="/ month"
              ctaText="Contact Sales"
              features={[
                "Everything in Pro",
                "Unlimited workspace files",
                "Shared team libraries",
                "Organization member roles",
                "Enterprise API key keys",
                "SSO integration support",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── 5. FOOTER ─────────────────────────────────────────────── */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-900 pt-16 pb-8 px-4 sm:px-6 lg:px-8" id="docs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo column */}
          <div className="col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2.5" aria-hidden="true">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                AlgoViz Pro
              </span>
            </div>
            <p className="text-sm text-slate-400 dark:text-zinc-500 max-w-xs leading-normal">
              An interactive visual environment for learning, teaching, and optimizing computer science algorithms.
            </p>
            <div className="flex items-center gap-3 text-slate-400 dark:text-zinc-550 mt-2">
              <a href="/" className="hover:text-indigo-650 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1" aria-label="Github"><GithubIcon className="w-4 h-4" /></a>
              <a href="/" className="hover:text-indigo-650 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1" aria-label="Twitter"><TwitterIcon className="w-4 h-4" /></a>
              <a href="/" className="hover:text-indigo-650 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1" aria-label="LinkedIn"><LinkedinIcon className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Footer link columns */}
          <FooterColumn
            title="Product"
            links={[
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "Integrations", href: "#" },
              { label: "Changelog", href: "#" },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: "About", href: "#" },
              { label: "Careers", href: "#" },
              { label: "Blog", href: "#" },
              { label: "Press", href: "#" },
            ]}
          />
          <FooterColumn
            title="Resources"
            links={[
              { label: "Documentation", href: "#" },
              { label: "API Docs", href: "#" },
              { label: "Community feed", href: "#" },
              { label: "Status Page", href: "#" },
            ]}
          />
        </div>

        {/* Legal & Copyright */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 dark:border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-zinc-550 select-none">
          <p>© {new Date().getFullYear()} AlgoViz Pro. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-500">Privacy Policy</a>
            <a href="/terms" className="hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-500">Terms of Service</a>
            <a href="/cookies" className="hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-500">Cookie Settings</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
