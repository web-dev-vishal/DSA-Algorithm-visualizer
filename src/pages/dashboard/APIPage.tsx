import { useState } from "react";
import { motion } from "framer-motion";
import { Key, Copy, Eye, EyeOff, Check, Webhook, AlertTriangle, BookOpen, ExternalLink, Plus } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";

const API_KEYS = [
  { id: "k1", name: "Production Key",  prefix: "avp_live_****8f9c", created: "Jun 1, 2026",  lastUsed: "Today",        calls: 482  },
  { id: "k2", name: "Development Key", prefix: "avp_test_****2a7b", created: "May 15, 2026", lastUsed: "3 days ago",   calls: 128  },
];

const WEBHOOKS = [
  { id: "w1", name: "Slack Notify",   url: "https://hooks.slack.com/services/T00/B00/Xxx",  events: ["analysis.complete"],      status: "active"   },
  { id: "w2", name: "CI Pipeline",    url: "https://api.company.com/v1/deploy-hooks", events: ["analysis.error"],         status: "active"   },
  { id: "w3", name: "Legacy DB Hook",  url: "https://old.system.io/webhook-receiver", events: ["analysis.complete"],    status: "paused"   },
];

const CODE_EXAMPLE = `curl -X POST https://api.algoviz.pro/v1/analyze \\
  -H "Authorization: Bearer avp_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "void bubbleSort(int arr[], int n) { ... }",
    "language": "cpp",
    "model": "llama-3.3-70b-versatile"
  }'`;

export function APIPage() {
  const [createModal, setCreateModal] = useState(false);
  const [webhookModal, setWebhookModal] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 14 } }
  } as const;

  function copyCode() {
    navigator.clipboard.writeText(CODE_EXAMPLE).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  }

  function copyKeyText(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Title */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-850 pb-5"
      >
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">API & Integrations</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-450 mt-1.5 font-medium">Manage authorization tokens, registers webhooks, and automate execution runs.</p>
        </div>
      </motion.div>

      {/* Usage summary cards */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { label: "API calls this month", value: "610",    limit: "1,000",  pct: 61 },
          { label: "Active webhooks",       value: "2",      limit: "10",     pct: 20 },
          { label: "Rate limit cap",        value: "100/min",limit: "",       pct: 0 },
        ].map((s, idx) => (
          <motion.div variants={itemVariants} key={idx}>
            <Card className="p-5 glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm relative overflow-hidden">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mb-2 select-none">{s.label}</p>
              <p className="text-xl font-extrabold text-zinc-900 dark:text-white">
                {s.value} {s.limit && <span className="text-xs text-zinc-400 dark:text-zinc-550 font-normal">/ {s.limit}</span>}
              </p>
              {s.pct > 0 && (
                <div className="mt-3.5 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full rounded-full ${s.pct > 80 ? "bg-rose-500" : "bg-indigo-500"}`} style={{ width: `${s.pct}%` }} />
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* API Keys Panel */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wider select-none">API Tokens</h2>
              <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-sm text-xs font-bold" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setCreateModal(true)}>
                Generate Token
              </Button>
            </div>
          </CardHeader>
          <div className="divide-y divide-zinc-150 dark:divide-zinc-850">
            {API_KEYS.map(k => {
              const fullKey = `avp_live_${k.id === "k1" ? "abc123xyz456def789" : "test9876543210zyx"}`;
              const isRevealed = revealedKey === k.id;
              const isCopied = copiedKey === k.id;
              return (
                <div key={k.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 group hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center flex-shrink-0">
                    <Key className="w-4.5 h-4.5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">{k.name}</p>
                      <Badge variant="success" className="text-[9px] font-bold select-none px-2 py-0.5">Active</Badge>
                    </div>
                    <code className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                      {isRevealed ? fullKey : k.prefix}
                    </code>
                  </div>
                  <div className="text-left sm:text-right text-xs text-zinc-400 dark:text-zinc-550 font-medium">
                    <p>Created {k.created}</p>
                    <p className="mt-0.5">Used {k.lastUsed} · {k.calls} calls</p>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setRevealedKey(v => v === k.id ? null : k.id)} title={isRevealed ? "Mask token" : "Reveal token"}>
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => copyKeyText(k.id, fullKey)} title="Copy token">
                      {isCopied ? <Check className="w-4 h-4 text-emerald-500 animate-pulse" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button variant="destructive" size="sm" className="text-xs font-bold px-3 py-1.5">Revoke</Button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3.5 bg-amber-500/10 border-t border-amber-500/20 flex items-start gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
              API tokens hold production access rights. Never commit tokens to source control or expose them on the client side. compromised keys should be rotated immediately.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Code templates Quickstart */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wider select-none">Integration Quickstart</h2>
              <a href="/docs" className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-650 font-bold transition-colors">
                <BookOpen className="w-3.5 h-3.5" /> API Documentation <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </CardHeader>
          <div className="relative group">
            <pre className="bg-zinc-950 text-zinc-200 px-5 py-4.5 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
              {CODE_EXAMPLE}
            </pre>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-3.5 right-3.5 opacity-70 hover:opacity-100 flex items-center gap-1 bg-zinc-900 border-zinc-800 dark:hover:bg-zinc-800"
              onClick={copyCode}
              leftIcon={copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedCode ? "Copied" : "Copy cURL"}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Webhooks config */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wider select-none">Webhooks</h2>
              <Button variant="secondary" size="sm" className="flex items-center gap-1.5 text-xs font-bold border border-zinc-200/80 dark:border-zinc-800 dark:hover:bg-zinc-850/50" leftIcon={<Webhook className="w-3.5 h-3.5" />} onClick={() => setWebhookModal(true)}>
                Register Endpoint
              </Button>
            </div>
          </CardHeader>
          <div className="divide-y divide-zinc-150 dark:divide-zinc-850">
            {WEBHOOKS.map(w => (
              <div key={w.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 group hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center flex-shrink-0">
                  <Webhook className="w-4.5 h-4.5 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{w.name}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate font-mono mt-0.5">{w.url}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {w.events.map(e => <Badge key={e} variant="default" className="text-[9px] font-mono font-semibold">{e}</Badge>)}
                  </div>
                </div>
                <Badge variant={w.status === "active" ? "success" : "warning"} className="font-bold select-none py-0.5">{w.status}</Badge>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="text-xs font-bold">{w.status === "active" ? "Pause" : "Resume"}</Button>
                  <Button variant="destructive" size="sm" className="text-xs font-bold px-3 py-1.5">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Modal Key Creation */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Generate API Token"
        description="Provide a descriptive name to identify this token in your keys list."
        footer={
          <>
            <Button variant="ghost" className="text-xs font-bold" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button variant="primary" className="text-xs font-bold shadow-sm" onClick={() => setCreateModal(false)} leftIcon={<Key className="w-3.5 h-3.5" />}>
              Create Key
            </Button>
          </>
        }
      >
        <Input label="Key Name" placeholder="e.g. Production server, CI/CD pipeline tests" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
      </Modal>

      {/* Modal Webhooks */}
      <Modal
        open={webhookModal}
        onClose={() => setWebhookModal(false)}
        title="Register Webhook Endpoint"
        description="We'll send POST requests with JSON event data payloads to this URL."
        footer={
          <>
            <Button variant="ghost" className="text-xs font-bold" onClick={() => setWebhookModal(false)}>Cancel</Button>
            <Button variant="primary" className="text-xs font-bold shadow-sm" onClick={() => setWebhookModal(false)}>Save Endpoint</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Webhook URL" type="url" placeholder="https://api.yourdomain.com/v1/webhook-receiver" />
          <div>
            <label className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest block mb-2 select-none">Subscribed Events</label>
            <div className="space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-950/20">
              {["analysis.complete", "analysis.error", "team.member_joined", "billing.payment_failed"].map(ev => (
                <label key={ev} className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-650 dark:text-zinc-350 select-none">
                  <input type="checkbox" className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                  <code className="text-xs text-zinc-600 dark:text-zinc-300 font-mono">{ev}</code>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
