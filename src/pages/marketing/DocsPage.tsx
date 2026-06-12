import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Zap, ChevronRight, Copy, Check, ChevronLeft, BookOpen, ShieldAlert } from "lucide-react";
import { Badge } from "../../components/ui/Badge";

// Sidebar structure mapping all user-requested documentation links
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

export function DocsPage() {
  const [activeSlug, setActiveSlug] = useState("intro");
  const [search, setSearch] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
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

  function copyCode(id: string, code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedText(id);
      setTimeout(() => setCopiedText(null), 2000);
    });
  }

  // Pre-compiled doc contents matching each slug
  const docRender = (slug: string) => {
    switch(slug) {
      case "intro":
        return (
          <div className="space-y-6">
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
              Welcome to the AlgoViz Pro documentation library. AlgoViz Pro is a premium SaaS application designed for software engineers, students, and educators to write, compile, and visualize computer science algorithms step-by-step.
            </p>
            <div className="p-4 rounded-xl border border-indigo-150/40 bg-indigo-50/20 dark:border-indigo-950/40 dark:bg-indigo-950/10">
              <h3 className="font-extrabold text-sm text-indigo-750 dark:text-indigo-300 flex items-center gap-1.5"><Zap className="w-4 h-4 fill-current" /> Core Goal</h3>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 leading-normal">
                Convert abstract code execution paths into interactive, high-fidelity visual representations (arrays, grids, dynamic programming tables, graph constellations) utilizing structural compiler metadata.
              </p>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mt-6 select-none">Platform Pillars</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-650 dark:text-zinc-400">
              <li><strong>Interactive Playback Sandbox:</strong> Control speed metrics, slide progress frames, inspect local scopes, and trigger back/forward steps.</li>
              <li><strong>Asymptotic Complexity Check:</strong> Real-time Big-O evaluations for execution arrays.</li>
              <li><strong>Bug check explainer:</strong> Catch semantic anomalies and present corrected snippets instantly.</li>
            </ul>
          </div>
        );
      case "install":
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400">
            <p>To configure AlgoViz Pro on your local machine, check out these installation steps.</p>
            <div className="relative group">
              <pre className="bg-zinc-900 text-zinc-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
{`git clone https://github.com/vishal-sanam/DSA-Algorithm-visualizer.git
cd DSA-Algorithm-visualizer
npm install --legacy-peer-deps`}
              </pre>
              <button 
                onClick={() => copyCode("inst-code", "git clone https://github.com/vishal-sanam/DSA-Algorithm-visualizer.git\ncd DSA-Algorithm-visualizer\nnpm install --legacy-peer-deps")}
                className="absolute top-2.5 right-2.5 p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-350"
              >
                {copiedText === "inst-code" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        );
      case "setup":
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400">
            <p>Setup the application keys inside the environment scope config to activate compiler execution triggers.</p>
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/20 dark:border-amber-900/30 dark:bg-amber-950/10 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-400 text-xs uppercase select-none">Groq API Keys</h4>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 leading-normal">Generate API keys at console.groq.com. Keep keys secure; client instances access keys via VITE prefix environments.</p>
              </div>
            </div>
          </div>
        );
      case "config":
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400 font-sans">
            <p>Vite configuration variables are handled using standard env load targets. Create a local environment setup file in root directory:</p>
            <div className="relative group font-mono text-xs">
              <pre className="bg-zinc-900 text-zinc-200 p-4 rounded-xl overflow-x-auto">
{`# .env.local
VITE_groqApi=gsk_your_groq_completions_api_token`}
              </pre>
              <button 
                onClick={() => copyCode("config-code", "# .env.local\nVITE_groqApi=gsk_your_groq_completions_api_token")}
                className="absolute top-2.5 right-2.5 p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-350"
              >
                {copiedText === "config-code" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        );
      case "folders":
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400">
            <p>Our project features a logical layout grouping components by concerns:</p>
            <pre className="bg-zinc-900 text-zinc-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
{`src/
  ├── components/       # Reusable layout/UI primitives
  │   ├── layout/       # Sidebar, Sticky Navigation templates
  │   └── ui/           # Badges, Buttons, Modals
  ├── pages/            # View pages
  │   ├── marketing/    # Landing Page, Docs hubs
  │   └── dashboard/    # Analytics, Billing, Settings
  ├── store/            # global state slices (zustand)
  └── lib/              # api helper configurations`}
            </pre>
          </div>
        );
      case "core-feat":
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400">
            <p>Traces sorting and DP operations visually using layout transitions. Key core functionalities include:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Interactive slider seeks:</strong> Jump to frames or replay loop runs.</li>
              <li><strong>Multiple coding selectors:</strong> Compiles Python, Java, C++, JS, TS, and Go.</li>
              <li><strong>Detailed code mappings:</strong> Explanations synchronize to current executing code pointers.</li>
            </ul>
          </div>
        );
      case "adv-feat":
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400">
            <p>Advanced feature offerings for Pro and Team subscriptions:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>REST API Access keys:</strong> Analyze raw algorithm code snippets programmatically.</li>
              <li><strong>Shared team catalogs:</strong> Collaborate in workspaces with visual bookmarks.</li>
              <li><strong>Custom dataset limits:</strong> Visualize massive arrays up to 20 elements.</li>
            </ul>
          </div>
        );
      case "sec-feat":
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400">
            <p>AlgoViz Pro follows modern security protocols to verify user sessions:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>MFA Authenticator:</strong> Protect settings updates.</li>
              <li><strong>Active token rotations:</strong> Revoke API keys on compromise alerts.</li>
              <li><strong>Session control grids:</strong> Revoke session keys from remote windows.</li>
            </ul>
          </div>
        );
      case "endpoints":
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400">
            <p>Our REST endpoint parses code syntax and replies with visualization frame steps.</p>
            <code className="bg-zinc-100 dark:bg-zinc-800 text-indigo-500 px-2 py-1.5 rounded font-mono font-bold text-xs">POST /v1/analyze</code>
            <p className="mt-2 text-xs">Request bodies must specify the code snippet string, programming language slug, and optional array inputs.</p>
          </div>
        );
      case "requests":
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400 font-sans">
            <p>Specify payload headers and body parameters:</p>
            <pre className="bg-zinc-900 text-zinc-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
{`{
  "code": "def binary_search(arr, val): ...",
  "language": "python",
  "array": [1, 3, 5, 7, 9]
}`}
            </pre>
          </div>
        );
      case "responses":
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400">
            <p>Expect standard JSON containing code line metadata, steps arrays, time complexity, and correctness boolean flag states:</p>
            <pre className="bg-zinc-900 text-zinc-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
{`{
  "isValid": true,
  "algorithm": "Binary Search",
  "timeComplexity": "O(log n)",
  "isCorrect": true,
  "steps": [
    { "arr": [1, 3, 5, 7, 9], "highlight": [0, 4], "activeLine": 2 }
  ]
}`}
            </pre>
          </div>
        );
      case "vercel":
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400">
            <p>Deploy in seconds using Vercel integrations. Import the repository, bind environment VITE variables in Vercel project options, and trigger builds.</p>
          </div>
        );
      case "docker":
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400">
            <p>Use our container configuration file to launch instances locally:</p>
            <pre className="bg-zinc-900 text-zinc-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
{`FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]`}
            </pre>
          </div>
        );
      case "a11y":
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400">
            <p>We target WCAG AA compliance. Current accessibility standards supported include:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Keyboard navigation:</strong> Controls playback via space, left/right arrows, R key.</li>
              <li><strong>ARIA labels:</strong> Proper aria-live descriptions, sliders, toolbars, list elements.</li>
              <li><strong>Color contrast checks:</strong> Optimized tokens for clear text visual reads in light/dark formats.</li>
            </ul>
          </div>
        );
      default:
        return (
          <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400">
            <p>Detailed documentation guidelines for the section <strong>{FLAT_DOCS.find(d => d.slug === slug)?.title}</strong> are coming soon.</p>
            <p>You can check out our <button onClick={() => setActiveSlug("intro")} className="text-indigo-500 hover:underline font-semibold">Introduction guide</button> for workspace setup steps.</p>
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
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-60 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            
            {/* Search inputs */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="search"
                placeholder="Search articles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-550/20 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 transition-all shadow-sm"
              />
            </div>

            {/* Sidebar items */}
            <div className="space-y-5 select-none overflow-y-auto max-h-[70vh] pr-2">
              {filteredNav.map(section => (
                <div key={section.section} className="space-y-1.5">
                  <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block pl-3 select-none">{section.section}</p>
                  <ul className="space-y-0.5">
                    {section.items.map(item => (
                      <li key={item.slug}>
                        <button
                          onClick={() => { setActiveSlug(item.slug); setSearch(""); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                  onClick={() => setActiveSlug(prevDoc.slug)}
                  className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl text-zinc-650 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
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
                  onClick={() => setActiveSlug(nextDoc.slug)}
                  className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl text-zinc-650 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
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
              <li className="hover:text-indigo-550 dark:hover:text-indigo-400 cursor-pointer">Overview</li>
              <li className="hover:text-indigo-555 dark:hover:text-indigo-400 cursor-pointer">Installation Steps</li>
              <li className="hover:text-indigo-555 dark:hover:text-indigo-400 cursor-pointer">Examples code</li>
              <li className="hover:text-indigo-555 dark:hover:text-indigo-400 cursor-pointer">Next guidelines</li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}
