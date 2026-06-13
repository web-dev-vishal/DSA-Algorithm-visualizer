import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

const TEAM = [
  { name: "Vishal Sanam", role: "Founder & CEO", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Vishal", bio: "Full-stack engineer passionate about making CS education accessible through beautiful tooling." },
  { name: "Sara Patel",   role: "Lead Engineer",  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sara",   bio: "Previously at Amazon. Obsessed with performance, DX, and making complex systems explainable." },
  { name: "James Kim",    role: "AI/ML Lead",      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=James",  bio: "NLP researcher turned product builder. Designed the prompt engineering system behind AlgoViz." },
];

const VALUES = [
  { emoji: "🎯", title: "Clarity over complexity", desc: "We believe any algorithm can be explained simply. Our tool is proof." },
  { emoji: "⚡", title: "Speed is a feature", desc: "Waiting kills learning momentum. Every part of AlgoViz is optimized for instant feedback." },
  { emoji: "🌐", title: "Education for everyone", desc: "We keep a generous free tier. Good CS education shouldn't be gated by ability to pay." },
  { emoji: "🔒", title: "Privacy by default", desc: "Your code never leaves your browser or our secure infrastructure. We don't sell data." },
];

export function AboutPage() {
  return (
    <div className="bg-white dark:bg-zinc-950 pt-24">
      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <Badge variant="primary" className="mb-4">Our Story</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-5">
            We believe algorithms should be
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent"> visible</span>
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
            AlgoViz Pro was built because learning algorithms from static textbook examples and dry pseudocode was never good enough. We set out to build the tool we wished existed when we were students.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 leading-relaxed">
            "Our mission is to make every algorithm in computer science fully understandable to anyone — student, engineer, or educator — in under 3 minutes."
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 mt-4 text-sm">— Vishal Sanam, Founder</p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="primary" className="mb-4">Values</Badge>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">What drives us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="text-3xl mb-3">{v.emoji}</div>
                <h3 className="font-bold text-zinc-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="primary" className="mb-4">Team</Badge>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">The people behind the product</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEAM.map(m => (
              <div key={m.name} className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                <img src={m.avatar} alt={m.name} className="w-16 h-16 rounded-full mx-auto mb-3" />
                <p className="font-bold text-zinc-900 dark:text-white">{m.name}</p>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium mb-2">{m.role}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Join us on this mission</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">50,000 developers already use AlgoViz Pro. Be next.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/signup"><Button variant="primary" size="lg">Get started free</Button></Link>
          <Link to="/careers"><Button variant="secondary" size="lg">Join the team</Button></Link>
        </div>
      </section>
    </div>
  );
}
