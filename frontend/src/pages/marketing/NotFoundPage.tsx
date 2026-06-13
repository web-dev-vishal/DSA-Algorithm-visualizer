import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";
import { Button } from "../../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-8 shadow-xl">
          <Zap className="w-7 h-7 text-white" />
        </div>

        {/* 404 */}
        <div className="text-[120px] font-black text-indigo-100 dark:text-indigo-900 leading-none mb-4 select-none">
          404
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
          Looks like this page got lost in the recursion stack. Let's navigate back to known territory.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to home
            </Button>
          </Link>
          <Link to="/app">
            <Button variant="secondary">Open visualizer</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
