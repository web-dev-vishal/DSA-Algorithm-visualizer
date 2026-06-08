import { useState } from "react";
import { Search, Code2, Zap, Key, Webhook, ChevronRight } from "lucide-react";
import { Badge } from "../../components/ui/Badge";

const DOCS_NAV = [
  {
    section: "Getting Started",
    items: [
      { title: "Introduction",       slug: "intro" },
      { title: "Quick Start",        slug: "quickstart" },
      { title: "Setting up API Key", slug: "api-key" },
    ],
  },
  {
    section: "Core Concepts",
    items: [
      { title: "Algorithm Analysis", slug: "analysis" },
      { title: "Visualization Steps", slug: "steps" },
      { title: "Code Line Mapping",  slug: "line-mapping" },
      { title: "Custom Inputs",      slug: "custom-inputs" },
    ],
  },
  {
    section: "API Reference",
    items: [
      { title: "Authentication",     slug: "auth" },
      { title: "Analyze Endpoint",   slug: "analyze" },
      { title: "History Endpoint",   slug: "history" },
      { title: "Webhooks",           slug: "webhooks" },
      { title: "Rate Limits",        slug: "rate-limits" },
    ],
  },
  {
    section: "Guides",
    items: [
      { title: "Team Workspaces",    slug: "teams" },
      { title: "Sharing Links",      slug: "sharing" },
      { title: "Embedding",          slug: "embedding" },
    ],
  },
];

const QUICK_LINKS = [
  { icon: Zap,     color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950", title: "Quick Start",   desc: "Get up and running in 2 minutes",   slug: "quickstart" },
  { icon: Key,     color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-950",   title: "API Key Setup", desc: "Configure your Groq API key",         slug: "api-key" },
  { icon: Code2,   color: "text-emerald-500",bg: "bg-emerald-50 dark:bg-emerald-950",title: "API Reference",desc: "Full API docs & example code",          slug: "analyze" },
  { icon: Webhook, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950", title: "Webhooks",      desc: "Real-time event notifications",        slug: "webhooks" },
];

const SAMPLE_DOC = `
# Quick Start

Get your first algorithm visualized in under 2 minutes.

## 1. Get a Groq API Key

AlgoViz Pro uses [Groq](https://console.groq.com) for AI inference. Create a free account at console.groq.com and generate an API key.

## 2. Enter Your Key

Click the **API Key** button in the top-right navbar and paste your \`gsk_...\` key. It's stored only in your browser's sessionStorage.

## 3. Paste Your Code

Enter any DSA algorithm in the code editor. You can use one of the built-in demos or write your own in C++, Python, Java, or JavaScript.

## 4. Click Analyze

Hit the **Analyze** button. Within 1–2 seconds, you'll see:
- Algorithm name and category
- Time and space complexity
- Step-by-step visualization
- Line-by-line explanations
- Bug detection (if any)

## 5. Control Playback

Use the visualization controls to:
- ▶ Play / ⏸ Pause the animation
- ⏮ Step backward / ⏭ Step forward
- Drag the progress slider to any step
- Adjust speed with the 5-step speed control

## Next Steps

- [Set a custom input array →](/docs#custom-inputs)
- [Share your visualization →](/docs#sharing)
- [Use the REST API →](/docs#analyze)
`;

export function DocsPage() {
  const [activeSlug, setActiveSlug] = useState("quickstart");
  const [search, setSearch] = useState("");

  return (
    <div className="bg-white dark:bg-zinc-950 pt-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 hidden md:block">
          <div className="sticky top-24 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="search"
                placeholder="Search docs…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-900 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-700 dark:text-zinc-300"
              />
            </div>
            {DOCS_NAV.map(section => (
              <div key={section.section}>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{section.section}</p>
                <ul className="space-y-0.5">
                  {section.items.map(item => (
                    <li key={item.slug}>
                      <button
                        onClick={() => setActiveSlug(item.slug)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          activeSlug === item.slug
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium"
                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        }`}
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Quick links (shown when on intro) */}
          {activeSlug === "intro" || activeSlug === "quickstart" ? (
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">Documentation</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8">Everything you need to use and integrate AlgoViz Pro.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {QUICK_LINKS.map(q => (
                  <button
                    key={q.slug}
                    onClick={() => setActiveSlug(q.slug)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all text-left group"
                  >
                    <div className={`w-9 h-9 rounded-xl ${q.bg} flex items-center justify-center flex-shrink-0`}>
                      <q.icon className={`w-4.5 h-4.5 ${q.color}`} style={{ width: "1.1rem", height: "1.1rem" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{q.title}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{q.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>

              {/* Rendered markdown-like doc */}
              <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed bg-transparent font-sans p-0">
                  {SAMPLE_DOC.trim()}
                </pre>
              </div>
            </div>
          ) : (
            <div>
              <Badge variant="primary" className="mb-4">Docs</Badge>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                {DOCS_NAV.flatMap(s => s.items).find(i => i.slug === activeSlug)?.title ?? "Documentation"}
              </h1>
              <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none">
                <p className="text-zinc-500 dark:text-zinc-400">
                  This section is coming soon. In the meantime, check out the{" "}
                  <button onClick={() => setActiveSlug("quickstart")} className="text-indigo-500 hover:underline">Quick Start guide</button>.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
