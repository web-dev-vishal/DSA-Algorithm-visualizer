import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Play, Share2, Trash2, Code2, Calendar } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";

const HISTORY = [
  { id: "1",  name: "Bubble Sort",          category: "Sorting",       lang: "C++",    complexity: "O(n²)",      date: "Jun 8, 2026 · 9:14 AM",  shared: true,  bugs: 0 },
  { id: "2",  name: "Binary Search",        category: "Searching",     lang: "Python", complexity: "O(log n)",   date: "Jun 8, 2026 · 8:02 AM",  shared: false, bugs: 0 },
  { id: "3",  name: "Merge Sort",           category: "Sorting",       lang: "Java",   complexity: "O(n log n)", date: "Jun 7, 2026 · 3:45 PM",  shared: true,  bugs: 0 },
  { id: "4",  name: "Fibonacci DP",         category: "DP",            lang: "Python", complexity: "O(n)",       date: "Jun 7, 2026 · 1:22 PM",  shared: false, bugs: 0 },
  { id: "5",  name: "Two Sum",              category: "Two Pointers",  lang: "JS",     complexity: "O(n)",       date: "Jun 6, 2026 · 11:55 AM", shared: false, bugs: 1 },
  { id: "6",  name: "Quick Sort",           category: "Sorting",       lang: "C++",    complexity: "O(n log n)", date: "Jun 6, 2026 · 10:10 AM", shared: false, bugs: 0 },
  { id: "7",  name: "Coin Change",          category: "DP",            lang: "Python", complexity: "O(n·m)",     date: "Jun 5, 2026 · 4:33 PM",  shared: true,  bugs: 0 },
  { id: "8",  name: "Inorder Traversal",    category: "Tree",          lang: "Java",   complexity: "O(n)",       date: "Jun 5, 2026 · 2:00 PM",  shared: false, bugs: 0 },
  { id: "9",  name: "BFS Graph",            category: "Graph",         lang: "Python", complexity: "O(V+E)",     date: "Jun 4, 2026 · 6:15 PM",  shared: false, bugs: 1 },
  { id: "10", name: "Max Subarray Sum",     category: "Sliding Window",lang: "JS",     complexity: "O(n)",       date: "Jun 4, 2026 · 12:00 PM", shared: true,  bugs: 0 },
];

const CATEGORIES = ["All", "Sorting", "Searching", "DP", "Two Pointers", "Sliding Window", "Tree", "Graph"];

export function HistoryPage() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = HISTORY.filter(h =>
    (cat === "All" || h.category === cat) &&
    (h.name.toLowerCase().includes(search.toLowerCase()) || h.lang.toLowerCase().includes(search.toLowerCase()))
  );

  function toggleSelect(id: string) {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Analysis History</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{HISTORY.length} analyses stored · unlimited retention on Pro</p>
        </div>
        {selected.size > 0 && (
          <Button variant="destructive" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
            Delete {selected.size} selected
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="search"
            placeholder="Search analyses…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-8 pr-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm text-zinc-700 dark:text-zinc-300"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                cat === c
                  ? "bg-indigo-500 text-white"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                <th className="w-8 px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-zinc-300 text-indigo-500"
                    onChange={e => setSelected(e.target.checked ? new Set(HISTORY.map(h => h.id)) : new Set())}
                    checked={selected.size === HISTORY.length}
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Algorithm</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden md:table-cell">Complexity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden sm:table-cell">Language</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-400">
                    <Code2 className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                    No analyses match your filter.
                  </td>
                </tr>
              ) : filtered.map(h => (
                <tr key={h.id} className={`border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group ${selected.has(h.id) ? "bg-indigo-50/30 dark:bg-indigo-950/20" : ""}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-zinc-300 text-indigo-500"
                      checked={selected.has(h.id)}
                      onChange={() => toggleSelect(h.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center flex-shrink-0">
                        <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{h.name}</p>
                        <p className="text-xs text-zinc-400">{h.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <code className="text-xs font-mono text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{h.complexity}</code>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant="default" className="text-[10px]">{h.lang}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-zinc-400 whitespace-nowrap">{h.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {h.bugs > 0 && <Badge variant="warning" className="text-[10px]">{h.bugs} bug</Badge>}
                      {h.shared && <Badge variant="primary" className="text-[10px]">Shared</Badge>}
                      {!h.bugs && !h.shared && <Badge variant="success" className="text-[10px]">Clean</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to="/app">
                        <Button variant="ghost" size="icon" title="Replay"><Play className="w-3.5 h-3.5" /></Button>
                      </Link>
                      <Button variant="ghost" size="icon" title="Share"><Share2 className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" title="Delete"><Trash2 className="w-3.5 h-3.5 text-rose-400" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <p className="text-xs text-zinc-400">{filtered.length} of {HISTORY.length} analyses</p>
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
