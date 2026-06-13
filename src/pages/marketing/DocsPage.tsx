import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, ChevronRight, Copy, Check, ChevronLeft, BookOpen, ShieldAlert, ChevronDown, Terminal, CheckCircle2 } from "lucide-react";
import { Badge } from "../../components/ui/Badge";

// Sidebar structure mapping all documentation links
const DOCS_NAV = [
  {
    section: "Getting Started",
    items: [
      { title: "Introduction",       slug: "intro" },
      { title: "Installation",       slug: "install" },
      { title: "Setup Guidelines",   slug: "setup" },
      { title: "Configuration",      slug: "config" },
      { title: "Folder Structure",   slug: "folders" },
    ],
  },
  {
    section: "Features Scope",
    items: [
      { title: "Core Features",      slug: "core-feat" },
      { title: "Advanced Features",  slug: "adv-feat" },
      { title: "Security Features",  slug: "sec-feat" },
      { title: "Authentication",     slug: "auth" },
    ],
  },
  {
    section: "UI Components Library",
    items: [
      { title: "UI Elements",        slug: "ui-comp" },
      { title: "Layout Components",  slug: "layout-comp" },
      { title: "Forms Validation",   slug: "forms" },
      { title: "Modals & Dialogs",   slug: "modals" },
      { title: "Data Tables",        slug: "tables" },
      { title: "Recharts Visuals",   slug: "charts" },
    ],
  },
  {
    section: "API Reference",
    items: [
      { title: "Endpoint Targets",   slug: "endpoints" },
      { title: "Request Formats",    slug: "requests" },
      { title: "Response Structures", slug: "responses" },
      { title: "Error Handling",     slug: "errors" },
      { title: "Auth Flow",          slug: "auth-flow" },
    ],
  },
  {
    section: "Deployment Guides",
    items: [
      { title: "Vercel Deployment",  slug: "vercel" },
      { title: "Docker Container",   slug: "docker" },
      { title: "Environment Variables", slug: "env-vars" },
      { title: "CI/CD Setup",        slug: "cicd" },
    ],
  },
  {
    section: "Best Practices",
    items: [
      { title: "Performance Tuning", slug: "perf" },
      { title: "Security Controls",  slug: "security-pract" },
      { title: "Accessibility (WCAG)", slug: "a11y" },
      { title: "Testing Protocols",  slug: "testing" },
      { title: "Scalability Arch",   slug: "scale" },
    ],
  },
];

// Flat list for simple search and indexing
const FLAT_DOCS = DOCS_NAV.flatMap(sec => sec.items.map(item => ({ ...item, section: sec.section })));

// Table of Contents Mapping for dynamic scrolling on each page
const TOC_MAP: Record<string, Array<{ title: string; id: string }>> = {
  intro: [
    { title: "Overview", id: "overview" },
    { title: "Core Goal", id: "core-goal" },
    { title: "Platform Pillars", id: "pillars" }
  ],
  install: [
    { title: "Prerequisites", id: "prerequisites" },
    { title: "Installation Steps", id: "install-steps" },
    { title: "Verifying Setup", id: "verify-setup" }
  ],
  setup: [
    { title: "Environment Config", id: "env-config" },
    { title: "Groq Keys", id: "groq-keys" }
  ],
  config: [
    { title: "Vite Environment", id: "vite-env" },
    { title: "Variables Setup", id: "vars-setup" }
  ],
  folders: [
    { title: "Project Structure", id: "proj-struct" },
    { title: "Directory Map", id: "dir-map" }
  ],
  "core-feat": [
    { title: "Visual Playback", id: "visual-playback" },
    { title: "Language Selectors", id: "lang-selectors" }
  ],
  "adv-feat": [
    { title: "REST API Access", id: "rest-api" },
    { title: "Workspace Sharing", id: "sharing" }
  ],
  "sec-feat": [
    { title: "MFA Setup", id: "mfa-setup" },
    { title: "Token Rotation", id: "token-rotation" }
  ],
  auth: [
    { title: "Auth Flow Context", id: "auth-context" },
    { title: "RequireAuth Wrapper", id: "require-auth" }
  ],
  "ui-comp": [
    { title: "UI Elements Library", id: "ui-elements" },
    { title: "Button & Badge", id: "btn-badge" }
  ],
  "layout-comp": [
    { title: "Layout Context", id: "layout-context" },
    { title: "Responsive Panels", id: "panels" }
  ],
  forms: [
    { title: "Validation Engine", id: "forms-validation" },
    { title: "Regex Checks", id: "regex" }
  ],
  modals: [
    { title: "Dialog Primitive", id: "modal-primitive" },
    { title: "Trigger Hooks", id: "modal-hooks" }
  ],
  tables: [
    { title: "Data Grid Layout", id: "grid-layout" },
    { title: "Sort & Filter", id: "sort-filter" }
  ],
  charts: [
    { title: "Recharts Visuals", id: "recharts" },
    { title: "Gradients & Tooltips", id: "gradients-tooltips" }
  ],
  endpoints: [
    { title: "Analysis Endpoint", id: "analysis-endpoint" },
    { title: "Rate Limits", id: "rate-limits" }
  ],
  requests: [
    { title: "Payload Schema", id: "payload-schema" },
    { title: "Example Request", id: "example-request" }
  ],
  responses: [
    { title: "Success Payload", id: "success-payload" },
    { title: "Tracing Schema", id: "tracing-schema" }
  ],
  errors: [
    { title: "Error Matrix", id: "error-matrix" },
    { title: "Error Schema", id: "error-schema" }
  ],
  "auth-flow": [
    { title: "Access Tokens", id: "tokens" },
    { title: "API Validation", id: "api-val" }
  ],
  vercel: [
    { title: "Deploying to Vercel", id: "deploy-vercel" },
    { title: "Build Settings", id: "build-settings" }
  ],
  docker: [
    { title: "Docker Container Setup", id: "docker-setup" },
    { title: "Running Container", id: "docker-run" }
  ],
  "env-vars": [
    { title: "Configuring Keys", id: "config-keys" },
    { title: "Production Envs", id: "prod-envs" }
  ],
  cicd: [
    { title: "CI/CD Setup", id: "cicd-setup" },
    { title: "GitHub Actions", id: "github-actions" }
  ],
  perf: [
    { title: "Performance Tuning", id: "perf-tuning" },
    { title: "Optimizations", id: "optimizations" }
  ],
  "security-pract": [
    { title: "Security Controls", id: "sec-controls" },
    { title: "Guidelines", id: "guidelines" }
  ],
  a11y: [
    { title: "WCAG Compliance", id: "wcag" },
    { title: "Keyboard Navigation", id: "keyboard-nav" }
  ],
  testing: [
    { title: "Testing Protocols", id: "testing-protocols" },
    { title: "Unit Tests", id: "unit-tests" }
  ],
  scale: [
    { title: "Scalability Arch", id: "scale-arch" },
    { title: "Load Balancing", id: "load-bal" }
  ]
};

interface CodeBlockProps {
  code: string;
  language: string;
  id: string;
}

function CodeBlock({ code, language, id }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const highlightedHtml = useMemo(() => {
    let esc = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Syntax highlighting logic
    if (["javascript", "typescript", "json", "python", "dockerfile", "bash"].includes(language.toLowerCase())) {
      const keywords = [
        "const", "let", "var", "function", "return", "import", "from", "export", 
        "default", "def", "if", "else", "for", "in", "range", "class", "FROM", "WORKDIR", 
        "RUN", "COPY", "EXPOSE", "CMD", "git", "clone", "cd", "npm", "install", "as", "true", "false"
      ];
      const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
      esc = esc.replace(keywordRegex, '<span class="text-indigo-400 font-semibold">$1</span>');

      // Strings
      esc = esc.replace(/(["'`])(.*?)\1/g, '<span class="text-emerald-400">"$2"</span>');

      // Comments
      esc = esc.replace(/(# .*)/g, '<span class="text-zinc-500 italic">$1</span>');
      esc = esc.replace(/(\/\/ .*)/g, '<span class="text-zinc-500 italic">$1</span>');

      // Numbers
      esc = esc.replace(/\b(\d+)\b/g, '<span class="text-amber-400">$1</span>');
    }
    return esc;
  }, [code, language]);

  return (
    <div className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shadow-md my-4 font-mono">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800/80 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{language}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-350 hover:text-white transition-colors cursor-pointer select-none"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400 animate-scale" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs overflow-x-auto leading-relaxed text-zinc-250">
        <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
      </pre>
    </div>
  );
}

export function DocsPage() {
  const [activeSlug, setActiveSlug] = useState("intro");
  const [search, setSearch] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Track page scroll progress for indicator bar
  useEffect(() => {
    const handleScroll = () => {
      if (!mainContentRef.current) return;
      const element = mainContentRef.current;
      const totalHeight = element.scrollHeight - element.clientHeight;
      if (totalHeight === 0) return;
      const progress = (element.scrollTop / totalHeight) * 100;
      setScrollProgress(progress);
    };

    const container = mainContentRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, [activeSlug]);

  const activeIndex = useMemo(() => FLAT_DOCS.findIndex(d => d.slug === activeSlug), [activeSlug]);
  const prevDoc = activeIndex > 0 ? FLAT_DOCS[activeIndex - 1] : null;
  const nextDoc = activeIndex < FLAT_DOCS.length - 1 ? FLAT_DOCS[activeIndex + 1] : null;

  // Search filter
  const filteredNav = useMemo(() => {
    if (!search.trim()) return DOCS_NAV;
    const query = search.toLowerCase();
    return DOCS_NAV.map(sec => {
      const items = sec.items.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.slug.toLowerCase().includes(query)
      );
      return { ...sec, items };
    }).filter(sec => sec.items.length > 0);
  }, [search]);

  const scrollToAnchor = (id: string) => {
    if (!mainContentRef.current) return;
    const target = mainContentRef.current.querySelector(`#${id}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const currentToc = useMemo(() => {
    return TOC_MAP[activeSlug] || [{ title: "Overview", id: "overview" }];
  }, [activeSlug]);

  // Pre-compiled doc contents matching each slug
  const docRender = (slug: string) => {
    switch(slug) {
      case "intro":
        return (
          <div className="space-y-6">
            <div id="overview" className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Overview</h2>
              <p className="text-zinc-650 dark:text-zinc-400 leading-relaxed text-sm">
                Welcome to the AlgoViz Pro documentation library. AlgoViz Pro is a premium SaaS application designed for software engineers, students, and educators to write, compile, and visualize computer science algorithms step-by-step.
              </p>
            </div>
            
            <div id="core-goal" className="p-5 rounded-2xl border border-indigo-150/40 bg-indigo-50/20 dark:border-indigo-950/40 dark:bg-indigo-950/10">
              <h3 className="font-extrabold text-sm text-indigo-750 dark:text-indigo-300 flex items-center gap-1.5"><Zap className="w-4 h-4 fill-current text-indigo-500" /> Core Goal</h3>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 leading-relaxed">
                Convert abstract code execution paths into interactive, high-fidelity visual representations (arrays, grids, dynamic programming tables, graph constellations) utilizing structural compiler metadata.
              </p>
            </div>

            <div id="pillars" className="space-y-4 pt-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white select-none">Platform Pillars</h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-650 dark:text-zinc-400">
                <li><strong>Interactive Playback Sandbox:</strong> Control speed metrics, slide progress frames, inspect local scopes, and trigger back/forward steps.</li>
                <li><strong>Asymptotic Complexity Check:</strong> Real-time Big-O evaluations for execution arrays.</li>
                <li><strong>Bug Check Explainer:</strong> Catch semantic anomalies and present corrected snippets instantly.</li>
              </ul>
            </div>
          </div>
        );
      case "install":
        return (
          <div className="space-y-6">
            <div id="prerequisites" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Prerequisites</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Ensure you have Node.js (version 18 or higher) and npm installed. You will also need a modern web browser to view the visualization canvas.
              </p>
            </div>

            <div id="install-steps" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Installation Steps</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">Run the following commands in your terminal to download and build the client bundle:</p>
              <CodeBlock 
                id="install-code"
                language="bash"
                code={`git clone https://github.com/vishal-sanam/DSA-Algorithm-visualizer.git
cd DSA-Algorithm-visualizer
npm install --legacy-peer-deps`}
              />
            </div>

            <div id="verify-setup" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Verifying Setup</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Run `npm run dev` to boot up the local dev server. If successful, open your browser to `http://localhost:5173`.
              </p>
            </div>
          </div>
        );
      case "setup":
        return (
          <div className="space-y-6">
            <div id="env-config" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Environment Configuration</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                AlgoViz Pro leverages Groq completions to evaluate time and space complexity dynamically. Configure a local environment config to route API prompts.
              </p>
            </div>

            <div id="groq-keys" className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/20 dark:border-amber-900/30 dark:bg-amber-950/10 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-800 dark:text-amber-400 text-xs uppercase select-none">Groq API Keys</h4>
                  <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 leading-normal">
                    Generate API keys at console.groq.com. If no keys are specified, the workspace visualizer automatically falls back to local high-fidelity mock generators to support sandbox operations offline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "config":
        return (
          <div className="space-y-6">
            <div id="vite-env" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Vite Environment Settings</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Variables are loaded via standard Vite patterns. Create an `.env.local` configuration file in the project's root folder:
              </p>
            </div>

            <div id="vars-setup" className="space-y-4">
              <CodeBlock 
                id="env-local-code"
                language="bash"
                code={`# .env.local
VITE_groqApi=gsk_your_groq_completions_api_token`}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed">
                Vite compiles environment fields prefixed with `VITE_` and exposes them on `import.meta.env` dynamically.
              </p>
            </div>
          </div>
        );
      case "folders":
        return (
          <div className="space-y-6">
            <div id="proj-struct" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Project Structure</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                AlgoViz Pro organizes modules logically to scale. We isolate static components, dynamic state managers, pages, and mock simulation routines.
              </p>
            </div>

            <div id="dir-map" className="space-y-4">
              <CodeBlock 
                id="tree-struct"
                language="typescript"
                code={`src/
  ├── components/       # Visual components & UI primitives
  │   ├── layout/       # Sidebars, sticky menus, footers
  │   └── ui/           # Buttons, avatars, badges
  ├── pages/            # View entry points
  │   ├── marketing/    # HomePage landing, DocsPage guides
  │   └── dashboard/    # User diagnostics, profile billing
  ├── store/            # Zustand global state configurations
  └── lib/              # Offline visualizer simulator engines`}
              />
            </div>
          </div>
        );
      case "core-feat":
        return (
          <div className="space-y-6">
            <div id="visual-playback" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Visual Playback Controls</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                The visualizer traces sorting steps, dynamic programming updates, and pointer values in real-time. Speed sliders configure execution speed, while backward/forward options cycle through steps frame-by-frame.
              </p>
            </div>

            <div id="lang-selectors" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Language Support</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                The compilation compiler handles Python, C++, Java, JavaScript, TypeScript, and Go. Syntactic patterns are matched against target tracers dynamically.
              </p>
            </div>
          </div>
        );
      case "adv-feat":
        return (
          <div className="space-y-6">
            <div id="rest-api" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">REST API Keys</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Enterprise users can request custom REST credentials in their profile settings dashboard. API keys allow programmatic requests to trace logical scopes externally.
              </p>
            </div>

            <div id="sharing" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Workspace Sharing</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Copy snapshot links directly from the visualizer. Shared endpoints bundle active indices, values, arrays, and comments, allowing team members or students to review specific steps instantly.
              </p>
            </div>
          </div>
        );
      case "sec-feat":
        return (
          <div className="space-y-6">
            <div id="mfa-setup" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">MFA Authentication Setup</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Enforce Multi-Factor Authentication for account settings. We support standard TOTP applications like Google Authenticator or Authy.
              </p>
            </div>

            <div id="token-rotation" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Token Rotation</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Visualizer API tokens automatically expire after 90 days. Rotation events are flagged in account metrics, prompting key updates programmatically.
              </p>
            </div>
          </div>
        );
      case "auth":
        return (
          <div className="space-y-6">
            <div id="auth-context" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Authentication Flow Context</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                AlgoViz Pro leverages JWT tokens for user session authorizations. Logins write tokens directly to secure HTTP-only cookies.
              </p>
            </div>

            <div id="require-auth" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">RequireAuth Wrapper</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Protect sensitive routes by wrapping components in RequireAuth blocks.
              </p>
              <CodeBlock 
                id="auth-wrapper"
                language="typescript"
                code={`import { Navigate } from "react-router-dom";
import { useAuth } from "../store/authStore";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}`}
              />
            </div>
          </div>
        );
      case "ui-comp":
        return (
          <div className="space-y-6">
            <div id="ui-elements" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">UI Elements Library</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Our design tokens translate directly into custom components. Buttons, inputs, and avatars support responsive themes natively.
              </p>
            </div>

            <div id="btn-badge" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Button & Badge Usage</h2>
              <CodeBlock 
                id="ui-demo"
                language="typescript"
                code={`import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

export function ExampleUI() {
  return (
    <div className="flex gap-2">
      <Badge variant="primary">New Feature</Badge>
      <Button variant="primary" size="sm">Get Started</Button>
    </div>
  );
}`}
              />
            </div>
          </div>
        );
      case "layout-comp":
        return (
          <div className="space-y-6">
            <div id="layout-context" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Layout Context</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                We wrap layouts in sticky navigation headers and nested sidebars to guarantee visual continuity on desktop and mobile viewports.
              </p>
            </div>

            <div id="panels" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Responsive Panels</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Columns resize, while grids compress seamlessly to match narrow mobile widths without breaking trace graphs.
              </p>
            </div>
          </div>
        );
      case "forms":
        return (
          <div className="space-y-6">
            <div id="forms-validation" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Validation Engine</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Form components catch validation errors instantly before forwarding data payloads to the backend API.
              </p>
            </div>

            <div id="regex" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Regex Checks</h2>
              <CodeBlock 
                id="validation-code"
                language="typescript"
                code={`const validateEmail = (email: string) => {
  const re = /\\S+@\\S+\\.\\S+/;
  return re.test(email);
};`}
              />
            </div>
          </div>
        );
      case "modals":
        return (
          <div className="space-y-6">
            <div id="modal-primitive" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Dialog Primitive</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Modals are rendered on screen overlays using custom React portals to prevent layout overlaps.
              </p>
            </div>

            <div id="modal-hooks" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Trigger Hooks</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Close triggers bind to overlay clicks and escape keys natively.
              </p>
            </div>
          </div>
        );
      case "tables":
        return (
          <div className="space-y-6">
            <div id="grid-layout" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Data Grid Layout</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Table modules render diagnostics cleanly. They align headings, cells, and button operations securely.
              </p>
            </div>

            <div id="sort-filter" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Sorting & Filtering</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Data tables utilize client-side sorting algorithms to sort runs by date, array size, or complexity rating.
              </p>
            </div>
          </div>
        );
      case "charts":
        return (
          <div className="space-y-6">
            <div id="recharts" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Recharts Integration</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                The analytics page renders runtime execution graphs utilizing customized SVG grids.
              </p>
            </div>

            <div id="gradients-tooltips" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Gradients & Tooltips</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Visual paths are filled with premium neon linear gradients, while custom tooltip cards expose exact coordinate metrics.
              </p>
            </div>
          </div>
        );
      case "endpoints":
        return (
          <div className="space-y-6">
            <div id="analysis-endpoint" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Analysis Endpoint</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400 font-sans">
                Our main analysis REST endpoint accepts code syntax blocks and returns compiled execution trace variables.
              </p>
              <div className="flex items-center gap-3">
                <Badge variant="primary">POST</Badge>
                <code className="text-xs font-mono font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded">/v1/analyze</code>
              </div>
            </div>

            <div id="rate-limits" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Rate Limits</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Free keys are limited to 100 requests per month. Pro keys support up to 1,000 monthly requests, and Enterprise tokens offer unlimited capacity.
              </p>
            </div>
          </div>
        );
      case "requests":
        return (
          <div className="space-y-6">
            <div id="payload-schema" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Payload Schema</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Send request payloads with the following properties:
              </p>
            </div>

            <div id="example-request" className="space-y-4">
              <CodeBlock 
                id="request-payload"
                language="json"
                code={`{
  "code": "def binary_search(arr, val): ...",
  "language": "python",
  "array": [1, 3, 5, 7, 9]
}`}
              />
            </div>
          </div>
        );
      case "responses":
        return (
          <div className="space-y-6">
            <div id="success-payload" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Success Payload</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                The API responds with the computed array states and active pointer indices for each trace step:
              </p>
            </div>

            <div id="tracing-schema" className="space-y-4">
              <CodeBlock 
                id="response-payload"
                language="json"
                code={`{
  "isValid": true,
  "algorithm": "Binary Search",
  "timeComplexity": "O(log n)",
  "isCorrect": true,
  "steps": [
    { 
      "arr": [1, 3, 5, 7, 9], 
      "highlight": [0, 4], 
      "activeLine": 2, 
      "pointers": { "left": 0, "right": 4, "mid": 2 } 
    }
  ]
}`}
              />
            </div>
          </div>
        );
      case "errors":
        return (
          <div className="space-y-6">
            <div id="error-matrix" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Error Matrix</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                When compilation fails, the API returns a structured error mapping details of the syntax or logical bug.
              </p>
            </div>

            <div id="error-schema" className="space-y-4">
              <CodeBlock 
                id="error-response"
                language="json"
                code={`{
  "error": "SyntaxError",
  "message": "Missing colon on line 4",
  "line": 4,
  "suggestedFix": "def partition(arr, low, high):"
}`}
              />
            </div>
          </div>
        );
      case "auth-flow":
        return (
          <div className="space-y-6">
            <div id="tokens" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Access Tokens</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                API requests validate keys passed inside headers. Ensure your token is included in client call protocols:
              </p>
              <CodeBlock 
                id="auth-headers"
                language="bash"
                code={`Authorization: Bearer algoviz_pro_sk_xxxxxxxxxxxx`}
              />
            </div>

            <div id="api-val" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">API Validation</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Invalid or expired keys trigger a 401 Unauthorized API error status response.
              </p>
            </div>
          </div>
        );
      case "vercel":
        return (
          <div className="space-y-6">
            <div id="deploy-vercel" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Deploying to Vercel</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Deploying Vite client bundles on Vercel is fully automated. Connect your GitHub repository, define your environment overrides in the Vercel dashboard, and click deploy.
              </p>
            </div>

            <div id="build-settings" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Build Settings</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Vercel automatically configures settings. Confirm that your output directory is mapped to `dist` and your build script points to `npm run build`.
              </p>
            </div>
          </div>
        );
      case "docker":
        return (
          <div className="space-y-6">
            <div id="docker-setup" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Docker Container Setup</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                We bundle a lightweight Docker configuration script. Use it to containerize applications:
              </p>
              <CodeBlock 
                id="dockerfile-code"
                language="dockerfile"
                code={`FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]`}
              />
            </div>

            <div id="docker-run" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Running the Container</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400 font-sans">
                Build and run operations can be launched using standard Docker CLI:
              </p>
              <CodeBlock 
                id="docker-run-code"
                language="bash"
                code={`docker build -t algoviz-pro .
docker run -p 3000:3000 algoviz-pro`}
              />
            </div>
          </div>
        );
      case "env-vars":
        return (
          <div className="space-y-6">
            <div id="config-keys" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Configuring Keys</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Client environment settings must match production endpoints. Set keys matching internal specifications inside env configurations.
              </p>
            </div>

            <div id="prod-envs" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Production Environments</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Production hosts should load variables securely in system environments rather than uploading `.env` setting files to repository branches.
              </p>
            </div>
          </div>
        );
      case "cicd":
        return (
          <div className="space-y-6">
            <div id="cicd-setup" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">CI/CD Pipeline Setup</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                We trigger automated lint checks and compilation builds on every push to main branches.
              </p>
            </div>

            <div id="github-actions" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">GitHub Actions</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Create a workflow file in `.github/workflows/verify.yml` to run checks automatically:
              </p>
              <CodeBlock 
                id="github-actions-code"
                language="json"
                code={`name: Verify Build
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run checks
        run: npm run typecheck && npm run build`}
              />
            </div>
          </div>
        );
      case "perf":
        return (
          <div className="space-y-6">
            <div id="perf-tuning" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Performance Tuning</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                AlgoViz Pro leverages component memoization and lightweight CSS transitions to prevent visual stuttering, even with rapid slider state updates.
              </p>
            </div>

            <div id="optimizations" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Optimizations</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-zinc-650 dark:text-zinc-400">
                <li><strong>Dynamic Code Bundles:</strong> Components are loaded asynchronously via dynamic imports.</li>
                <li><strong>Optimized Renders:</strong> Array cells update using stable key indices to prevent full DOM reflows.</li>
              </ul>
            </div>
          </div>
        );
      case "security-pract":
        return (
          <div className="space-y-6">
            <div id="sec-controls" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Security Controls</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                All client code strings are analyzed in isolated virtual contexts to guarantee system safety.
              </p>
            </div>

            <div id="guidelines" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Security Guidelines</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Do not store raw API tokens inside standard public files. Enforce secure CORS limits for backend hosts.
              </p>
            </div>
          </div>
        );
      case "a11y":
        return (
          <div className="space-y-6">
            <div id="wcag" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">WCAG Compliance</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                AlgoViz Pro meets Web Content Accessibility Guidelines (WCAG) AA standards. Elements utilize high color-contrast configurations natively.
              </p>
            </div>

            <div id="keyboard-nav" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Keyboard Navigation</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Control the playback slider: Use Spacebar to Play/Pause execution traces, and Left/Right arrow keys to step backward/forward.
              </p>
            </div>
          </div>
        );
      case "testing":
        return (
          <div className="space-y-6">
            <div id="testing-protocols" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Testing Protocols</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Run local tests to confirm execution compiler rules work smoothly across all languages.
              </p>
            </div>

            <div id="unit-tests" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Unit Tests</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Tests analyze step states, pointer array structures, and output parameters.
              </p>
              <CodeBlock 
                id="test-run"
                language="bash"
                code={`npm run test`}
              />
            </div>
          </div>
        );
      case "scale":
        return (
          <div className="space-y-6">
            <div id="scale-arch" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Scalability Architecture</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                API analysis services leverage horizontal scaling models to handle concurrent visualizer requests during peak times.
              </p>
            </div>

            <div id="load-bal" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Load Balancing</h2>
              <p className="text-sm text-zinc-650 dark:text-zinc-400">
                Incoming traffic is routed dynamically across edge regions to prevent performance bottlenecks.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400">
            <p>Detailed documentation guidelines for the section <strong>{FLAT_DOCS.find(d => d.slug === slug)?.title}</strong> are coming soon.</p>
            <p>You can check out our <button onClick={() => setActiveSlug("intro")} className="text-indigo-500 hover:underline font-semibold cursor-pointer">Introduction guide</button> for workspace setup steps.</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-zinc-50 text-zinc-850 dark:bg-zinc-950 dark:text-zinc-200 min-h-screen pt-20">
      
      {/* Scroll progress bar */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-zinc-200/80 dark:bg-zinc-850 z-50">
        <motion.div 
          className="h-full bg-indigo-600 shadow" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 mb-4 select-none shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-zinc-750 dark:text-zinc-300">
              {FLAT_DOCS.find(d => d.slug === activeSlug)?.title || "Navigation"}
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer select-none"
          >
            <span>Menu</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Left Sidebar */}
        <aside className={`${mobileMenuOpen ? "block" : "hidden"} md:block w-full md:w-60 flex-shrink-0 transition-all duration-300`}>
          <div className="sticky top-24 space-y-6">
            
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="search"
                placeholder="Search articles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-550/20 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-350 transition-all shadow-sm"
              />
            </div>

            {/* Sidebar items */}
            <div className="space-y-5 select-none overflow-y-auto max-h-[70vh] pr-2">
              {filteredNav.map(section => (
                <div key={section.section} className="space-y-1.5">
                  <p className="text-[10px] font-black text-zinc-455 dark:text-zinc-500 uppercase tracking-widest block pl-3 select-none">{section.section}</p>
                  <ul className="space-y-0.5">
                    {section.items.map(item => (
                      <li key={item.slug}>
                        <button
                          onClick={() => { 
                            setActiveSlug(item.slug); 
                            setSearch(""); 
                            setMobileMenuOpen(false);
                            if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeSlug === item.slug
                              ? "bg-indigo-50 text-indigo-650 border border-indigo-150/40 dark:bg-indigo-950/40 dark:border-indigo-850/40 dark:text-indigo-400"
                              : "text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent"
                          }`}
                        >
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {filteredNav.length === 0 && (
                <p className="text-xs text-zinc-450 dark:text-zinc-500 pl-3">No matching articles</p>
              )}
            </div>

          </div>
        </aside>

        {/* Center Contents Panel */}
        <main className="flex-1 min-w-0" ref={mainContentRef} style={{ maxHeight: "80vh", overflowY: "auto", paddingRight: "1rem" }}>
          <div className="space-y-6">
            
            {/* Breadcrumb path */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-550 select-none">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Docs</span>
              <ChevronRight className="w-3 h-3" />
              <span>{FLAT_DOCS.find(d => d.slug === activeSlug)?.section}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="font-semibold text-zinc-500 dark:text-zinc-400">{FLAT_DOCS.find(d => d.slug === activeSlug)?.title}</span>
            </div>

            {/* Article Wrapper */}
            <article className="prose prose-zinc dark:prose-invert max-w-none">
              <Badge variant="primary" className="mb-2 uppercase text-[9px] tracking-wider shadow-sm select-none">
                {FLAT_DOCS.find(d => d.slug === activeSlug)?.section}
              </Badge>
              <h1 className="text-3xl font-black text-zinc-900 dark:text-white mt-1 mb-5 leading-tight tracking-tight">
                {FLAT_DOCS.find(d => d.slug === activeSlug)?.title}
              </h1>
              
              {/* Load matching page JSX markup */}
              {docRender(activeSlug)}
            </article>

            {/* Navigation footer buttons (Prev / Next) */}
            <div className="flex items-center justify-between pt-8 border-t border-zinc-200 dark:border-zinc-850 mt-10 select-none">
              {prevDoc ? (
                <button
                  onClick={() => {
                    setActiveSlug(prevDoc.slug);
                    if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl text-zinc-650 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <div className="text-left">
                    <span className="block text-[9px] font-normal uppercase text-zinc-400">Previous</span>
                    <span>{prevDoc.title}</span>
                  </div>
                </button>
              ) : (
                <div />
              )}

              {nextDoc ? (
                <button
                  onClick={() => {
                    setActiveSlug(nextDoc.slug);
                    if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl text-zinc-650 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <div className="text-right">
                    <span className="block text-[9px] font-normal uppercase text-zinc-400">Next</span>
                    <span>{nextDoc.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div />
              )}
            </div>

          </div>
        </main>

        {/* Right Sticky Table of Contents */}
        <aside className="w-48 hidden lg:block flex-shrink-0 select-none">
          <div className="sticky top-24 border-l border-zinc-200 dark:border-zinc-850 pl-4 py-1.5 space-y-4">
            <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest">On this page</h4>
            <ul className="space-y-2 text-xs font-bold text-zinc-500 dark:text-zinc-450">
              {currentToc.map((toc, idx) => (
                <li 
                  key={idx} 
                  onClick={() => scrollToAnchor(toc.id)}
                  className="hover:text-indigo-550 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                >
                  {toc.title}
                </li>
              ))}
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}
