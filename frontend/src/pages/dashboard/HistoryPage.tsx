import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Play, Share2, Trash2, Code2, ChevronUp, ChevronDown } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

const HISTORY = [
  { id: "1",  name: "Bubble Sort",          category: "Sorting",       lang: "C++",    complexity: "O(n²)",      date: "Jun 8, 2026 · 9:14 AM",  timestamp: 1780909440000, shared: true,  bugs: 0 },
  { id: "2",  name: "Binary Search",        category: "Searching",     lang: "Python", complexity: "O(log n)",   date: "Jun 8, 2026 · 8:02 AM",  timestamp: 1780905120000, shared: false, bugs: 0 },
  { id: "3",  name: "Merge Sort",           category: "Sorting",       lang: "Java",   complexity: "O(n log n)", date: "Jun 7, 2026 · 3:45 PM",  timestamp: 1780846500000, shared: true,  bugs: 0 },
  { id: "4",  name: "Fibonacci DP",         category: "DP",            lang: "Python", complexity: "O(n)",       date: "Jun 7, 2026 · 1:22 PM",  timestamp: 1780837920000, shared: false, bugs: 0 },
  { id: "5",  name: "Two Sum",              category: "Two Pointers",  lang: "JS",     complexity: "O(n)",       date: "Jun 6, 2026 · 11:55 AM", timestamp: 1780746300000, shared: false, bugs: 1 },
  { id: "6",  name: "Quick Sort",           category: "Sorting",       lang: "C++",    complexity: "O(n log n)", date: "Jun 6, 2026 · 10:10 AM", timestamp: 1780740000000, shared: false, bugs: 0 },
  { id: "7",  name: "Coin Change",          category: "DP",            lang: "Python", complexity: "O(n·m)",     date: "Jun 5, 2026 · 4:33 PM",  timestamp: 1780676580000, shared: true,  bugs: 0 },
  { id: "8",  name: "Inorder Traversal",    category: "Tree",          lang: "Java",   complexity: "O(n)",       date: "Jun 5, 2026 · 2:00 PM",  timestamp: 1780667400000, shared: false, bugs: 0 },
  { id: "9",  name: "BFS Graph",            category: "Graph",         lang: "Python", complexity: "O(V+E)",     date: "Jun 4, 2026 · 6:15 PM",  timestamp: 1780596300000, shared: false, bugs: 1 },
  { id: "10", name: "Max Subarray Sum",     category: "Sliding Window",lang: "JS",     complexity: "O(n)",       date: "Jun 4, 2026 · 12:00 PM", timestamp: 1780573800000, shared: true,  bugs: 0 },
];

const CATEGORIES = ["All", "Sorting", "Searching", "DP", "Two Pointers", "Sliding Window", "Tree", "Graph"];

type SortField = "name" | "complexity" | "lang" | "timestamp" | "bugs";
type SortOrder = "asc" | "desc";

export function HistoryPage() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter history data
  const filtered = useMemo(() => {
    return HISTORY.filter(h =>
      (cat === "All" || h.category === cat) &&
      (h.name.toLowerCase().includes(search.toLowerCase()) || h.lang.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, cat]);

  // Sort history data
  const sorted = useMemo(() => {
    const data = [...filtered];
    data.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }
      return sortOrder === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return data;
  }, [filtered, sortField, sortOrder]);

  // Paginated data
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(o => o === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  function toggleSelect(id: string) {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelected(new Set(paginated.map(h => h.id)));
    } else {
      setSelected(new Set());
    }
  }

  function handleBatchDelete() {
    setSelected(new Set());
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-850 pb-5">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Analysis History</h1>
          <p className="text-sm text-zinc-550 dark:text-zinc-450 mt-1 font-medium">{HISTORY.length} algorithms indexed · unlimited retention unlocked</p>
        </div>
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Button variant="destructive" size="sm" className="shadow-lg shadow-rose-500/10 flex items-center gap-1.5" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleBatchDelete}>
                Delete Selected ({selected.size})
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="search"
            placeholder="Search matching compilations..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 text-sm text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 shadow-sm transition-all"
          />
        </div>
        
        {/* Category Pills */}
        <div className="flex gap-1.5 flex-wrap select-none" role="tablist" aria-label="Category filters">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => { setCat(c); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                cat === c
                  ? "bg-indigo-600 text-white border-indigo-650 shadow-sm"
                  : "bg-white border-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850"
              }`}
              role="tab"
              aria-selected={cat === c}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="bg-zinc-100/40 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-850 select-none">
                <th className="w-10 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-zinc-300 text-indigo-500 cursor-pointer"
                    onChange={e => toggleSelectAll(e.target.checked)}
                    checked={paginated.length > 0 && paginated.every(h => selected.has(h.id))}
                  />
                </th>
                <th 
                  onClick={() => handleSort("name")}
                  className="text-left px-4 py-3.5 text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-350"
                >
                  <div className="flex items-center gap-1">
                    Algorithm {sortField === "name" && (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("complexity")}
                  className="text-left px-4 py-3.5 text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-350 hidden md:table-cell"
                >
                  <div className="flex items-center gap-1">
                    Complexity {sortField === "complexity" && (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("lang")}
                  className="text-left px-4 py-3.5 text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-350 hidden sm:table-cell"
                >
                  <div className="flex items-center gap-1">
                    Language {sortField === "lang" && (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("timestamp")}
                  className="text-left px-4 py-3.5 text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-350 hidden lg:table-cell"
                >
                  <div className="flex items-center gap-1">
                    Date {sortField === "timestamp" && (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("bugs")}
                  className="text-left px-4 py-3.5 text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-350"
                >
                  <div className="flex items-center gap-1">
                    Status {sortField === "bugs" && (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="px-4 py-3.5 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
              <AnimatePresence mode="popLayout">
                {paginated.length === 0 ? (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={7} className="text-center py-16 text-zinc-400 select-none">
                      <Code2 className="w-10 h-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                      <p className="font-semibold text-sm">No analysis history found</p>
                      <p className="text-xs text-zinc-500 mt-1">Try expanding your search query or categories filter.</p>
                    </td>
                  </motion.tr>
                ) : paginated.map(h => {
                  const isChecked = selected.has(h.id);
                  return (
                    <motion.tr 
                      layout
                      key={h.id} 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`hover:bg-zinc-100/40 dark:hover:bg-zinc-900/40 transition-colors group ${isChecked ? "bg-indigo-50/20 dark:bg-indigo-950/20" : ""}`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-zinc-300 text-indigo-500 cursor-pointer"
                          checked={isChecked}
                          onChange={() => toggleSelect(h.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center flex-shrink-0">
                            <Code2 className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-white text-sm">{h.name}</p>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium sm:hidden">
                              {h.category} · {h.lang} · {h.complexity}
                            </p>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium hidden sm:block">
                              {h.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <code className="text-[11px] font-mono font-bold text-zinc-650 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{h.complexity}</code>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant="default" className="text-[10px] font-bold">{h.lang}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-zinc-450 dark:text-zinc-500 font-medium whitespace-nowrap">{h.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 select-none">
                          {h.bugs > 0 && <Badge variant="warning" className="text-[10px] font-bold">{h.bugs} Bug</Badge>}
                          {h.shared && <Badge variant="primary" className="text-[10px] font-bold">Shared</Badge>}
                          {!h.bugs && !h.shared && <Badge variant="success" className="text-[10px] font-bold">Clean</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Link to="/app">
                            <Button variant="ghost" size="icon" className="w-8 h-8" title="Replay run"><Play className="w-3.5 h-3.5 fill-current text-indigo-500" /></Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="w-8 h-8" title="Share link"><Share2 className="w-3.5 h-3.5 text-zinc-450" /></Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8" title="Delete run"><Trash2 className="w-3.5 h-3.5 text-rose-450 hover:text-rose-500" /></Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 dark:border-zinc-850 bg-zinc-100/30 dark:bg-zinc-900/50 select-none">
          <p className="text-xs font-semibold text-zinc-450 dark:text-zinc-500">
            Showing {Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filtered.length, currentPage * itemsPerPage)} of {filtered.length} matches
          </p>
          <div className="flex items-center gap-1">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
              disabled={currentPage === 1}
              className="text-xs font-bold"
            >
              Previous
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
              disabled={currentPage >= totalPages}
              className="text-xs font-bold"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
