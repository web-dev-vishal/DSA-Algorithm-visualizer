import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
    { label: "Roadmap", href: "/blog" },
    { label: "Status", href: "/status" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Partners", href: "/partners" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/api-docs" },
    { label: "Integrations", href: "/integrations" },
    { label: "Customer Stories", href: "/stories" },
    { label: "Help Center", href: "/help" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "GDPR", href: "/gdpr" },
    { label: "Security", href: "/security" },
  ],
};

const SOCIALS = [
  { icon: "𝕏", href: "https://twitter.com", label: "Twitter" },
  { icon: "⌥", href: "https://github.com", label: "GitHub" },
  { icon: "in", href: "https://linkedin.com", label: "LinkedIn" },
  { icon: "▶", href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-[15px] text-zinc-900 dark:text-white transition-colors">
                Algo<span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Viz</span> Pro
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-5 max-w-[220px] text-zinc-500 dark:text-zinc-400">
              AI-powered DSA algorithm visualizer for engineers, students, and educators.
            </p>
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-zinc-200/50 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-300/20 dark:border-zinc-800/60 flex items-center justify-center text-zinc-600 dark:text-zinc-350 hover:text-zinc-900 dark:hover:text-white transition-all text-xs font-bold"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-3 select-none">{group}</h3>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-200 dark:border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} AlgoViz Pro. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-450 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
