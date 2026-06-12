import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

const POSTS = [
  {
    slug: "binary-search-explained",
    title: "Binary Search Explained: Why O(log n) is Magical",
    excerpt: "Most developers know binary search exists. Far fewer can explain why it's so much faster than linear search. We break it down visually.",
    author: "Vishal Sanam",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Vishal",
    date: "Jun 5, 2026",
    readTime: "6 min read",
    tag: "Searching",
    tagVariant: "primary" as const,
    cover: "bg-gradient-to-br from-indigo-500 to-violet-600",
  },
  {
    slug: "dp-patterns",
    title: "5 Dynamic Programming Patterns Every Dev Should Know",
    excerpt: "DP problems terrify most developers. But 80% of DP interview questions use just 5 patterns. Here they are with visual examples.",
    author: "Sara Patel",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sara",
    date: "May 28, 2026",
    readTime: "12 min read",
    tag: "DP",
    tagVariant: "success" as const,
    cover: "bg-gradient-to-br from-emerald-500 to-cyan-600",
  },
  {
    slug: "big-o-guide",
    title: "The Developer's Visual Guide to Big-O Notation",
    excerpt: "O(n²) vs O(n log n) vs O(n): what do these really mean in practice? We visualize 10 algorithms and show you the difference.",
    author: "James Kim",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=James",
    date: "May 15, 2026",
    readTime: "9 min read",
    tag: "Complexity",
    tagVariant: "warning" as const,
    cover: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
  {
    slug: "sorting-algorithms-compared",
    title: "Bubble, Merge, Quick Sort: A Side-by-Side Comparison",
    excerpt: "All three sort arrays. So why do we care about the differences? Because in production, picking the wrong one can cost you 100× in performance.",
    author: "Vishal Sanam",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Vishal",
    date: "May 2, 2026",
    readTime: "8 min read",
    tag: "Sorting",
    tagVariant: "error" as const,
    cover: "bg-gradient-to-br from-rose-500 to-pink-600",
  },
  {
    slug: "two-pointers-technique",
    title: "The Two Pointers Technique: A Pattern That Solves 20+ Problems",
    excerpt: "Two pointers is one of the most underrated algorithmic patterns. Once you see it, you'll recognize it in interview problems everywhere.",
    author: "Sara Patel",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sara",
    date: "Apr 20, 2026",
    readTime: "7 min read",
    tag: "Two Pointers",
    tagVariant: "info" as const,
    cover: "bg-gradient-to-br from-sky-500 to-blue-600",
  },
  {
    slug: "groq-llm-analysis",
    title: "How We Use Groq LLMs to Generate Algorithm Step-by-Step",
    excerpt: "Behind the scenes of AlgoViz Pro's AI engine: the prompt engineering, JSON schema design, and reliability tricks that make it work.",
    author: "James Kim",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=James",
    date: "Apr 8, 2026",
    readTime: "10 min read",
    tag: "Engineering",
    tagVariant: "default" as const,
    cover: "bg-gradient-to-br from-violet-500 to-purple-600",
  },
];

export function BlogPage() {
  const featured = POSTS[0]!;
  const rest = POSTS.slice(1);

  return (
    <div className="bg-white dark:bg-zinc-950 pt-24">
      <section className="py-16 px-4 text-center">
        <Badge variant="primary" className="mb-4">Blog</Badge>
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
          Learn algorithms deeply
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Articles on algorithms, data structures, complexity analysis, and engineering behind AlgoViz Pro.
        </p>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Featured post */}
          <div className="rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row">
            <div className={`${featured.cover} w-full md:w-72 min-h-[160px] flex-shrink-0`} />
            <div className="p-6 flex flex-col justify-center">
              <Badge variant={featured.tagVariant} className="mb-3 w-fit">{featured.tag}</Badge>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{featured.title}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">{featured.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={featured.avatar} alt={featured.author} className="w-6 h-6 rounded-full" />
                  <span className="text-xs text-zinc-500">{featured.author}</span>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span className="text-xs text-zinc-400 flex items-center gap-1"><Clock className="w-3 h-3" />{featured.readTime}</span>
                </div>
                <Link to={`/blog/${featured.slug}`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>Read</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map(post => (
              <div key={post.slug} className="rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col group hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all">
                <div className={`${post.cover} h-28 flex-shrink-0`} />
                <div className="p-4 flex flex-col flex-1">
                  <Badge variant={post.tagVariant} className="mb-2 w-fit">{post.tag}</Badge>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-sm mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{post.title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed flex-1 mb-3">{post.excerpt.slice(0, 90)}…</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <img src={post.avatar} alt={post.author} className="w-5 h-5 rounded-full" />
                      <span className="text-[10px] text-zinc-400">{post.date}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
