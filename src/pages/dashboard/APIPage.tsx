import { useState } from "react";
import { Key, Copy, Eye, EyeOff, Check, Webhook, AlertTriangle, BookOpen, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";

const API_KEYS = [
  { id: "k1", name: "Production",  prefix: "avp_live_****8f9c", created: "Jun 1, 2026",  lastUsed: "Today",        calls: 482  },
  { id: "k2", name: "Development", prefix: "avp_test_****2a7b", created: "May 15, 2026", lastUsed: "3 days ago",   calls: 128  },
];

const WEBHOOKS = [
  { id: "w1", name: "Slack Notify",   url: "https://hooks.slack.com/xxx",  events: ["analysis.complete"],      status: "active"   },
  { id: "w2", name: "CI Pipeline",    url: "https://api.company.com/hook", events: ["analysis.error"],         status: "active"   },
  { id: "w3", name: "Legacy System",  url: "https://old.system.io/webhook", events: ["analysis.complete"],    status: "paused"   },
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
  const [copied, setCopied] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  function copyCode() {
    navigator.clipboard.writeText(CODE_EXAMPLE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">API & Integrations</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage API keys, webhooks, and integrate AlgoViz Pro into your workflows.</p>
      </div>

      {/* Usage */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "API calls this month", value: "610",    limit: "1,000",  pct: 61 },
          { label: "Active webhooks",       value: "2",      limit: "10",     pct: 20 },
          { label: "Rate limit",            value: "100/min",limit: "",       pct: 0 },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{s.value} {s.limit && <span className="text-xs text-zinc-400 font-normal">/ {s.limit}</span>}</p>
            {s.pct > 0 && (
              <div className="mt-2 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.pct > 80 ? "bg-rose-500" : "bg-indigo-500"}`} style={{ width: `${s.pct}%` }} />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* API Keys */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">API Keys</h2>
            <Button variant="primary" size="sm" leftIcon={<Key className="w-3.5 h-3.5" />} onClick={() => setCreateModal(true)}>
              Create key
            </Button>
          </div>
        </CardHeader>
        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
          {API_KEYS.map(k => (
            <div key={k.id} className="flex items-center gap-4 px-5 py-4 group">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center flex-shrink-0">
                <Key className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{k.name}</p>
                  <Badge variant="success" className="text-[10px]">Active</Badge>
                </div>
                <code className="text-xs text-zinc-400 font-mono">
                  {revealedKey === k.id ? "avp_live_abc123xyz456def789" : k.prefix}
                </code>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs text-zinc-400">Created {k.created}</p>
                <p className="text-xs text-zinc-400">Last used {k.lastUsed} · {k.calls} calls</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => setRevealedKey(v => v === k.id ? null : k.id)} title="Reveal/Hide">
                  {revealedKey === k.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </Button>
                <Button variant="ghost" size="icon" title="Copy"><Copy className="w-3.5 h-3.5" /></Button>
                <Button variant="destructive" size="sm">Revoke</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-900/30 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">Never share API keys publicly or commit them to version control. Rotate compromised keys immediately.</p>
        </div>
      </Card>

      {/* Quick start code */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Quick Start</h2>
            <div className="flex items-center gap-2">
              <a href="/docs" className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 transition-colors">
                <BookOpen className="w-3.5 h-3.5" /> Full docs <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </CardHeader>
        <div className="relative">
          <pre className="bg-zinc-950 text-zinc-200 px-5 py-4 font-mono text-xs overflow-x-auto leading-relaxed">
            {CODE_EXAMPLE}
          </pre>
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-3 right-3 opacity-70 hover:opacity-100"
            onClick={copyCode}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </Card>

      {/* Webhooks */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Webhooks</h2>
            <Button variant="secondary" size="sm" leftIcon={<Webhook className="w-3.5 h-3.5" />} onClick={() => setWebhookModal(true)}>
              Add webhook
            </Button>
          </div>
        </CardHeader>
        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
          {WEBHOOKS.map(w => (
            <div key={w.id} className="flex items-center gap-4 px-5 py-4 group">
              <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center flex-shrink-0">
                <Webhook className="w-4 h-4 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{w.name}</p>
                <p className="text-xs text-zinc-400 truncate font-mono">{w.url}</p>
                <div className="flex gap-1 mt-1">
                  {w.events.map(e => <Badge key={e} variant="default" className="text-[10px]">{e}</Badge>)}
                </div>
              </div>
              <Badge variant={w.status === "active" ? "success" : "warning"} dot>{w.status}</Badge>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm">{w.status === "active" ? "Pause" : "Resume"}</Button>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create key modal */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create API Key"
        description="Name your key so you can identify it later."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setCreateModal(false)} leftIcon={<Key className="w-3.5 h-3.5" />}>
              Create key
            </Button>
          </>
        }
      >
        <Input label="Key name" placeholder="e.g. Production, CI/CD, Mobile App" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
      </Modal>

      {/* Webhook modal */}
      <Modal
        open={webhookModal}
        onClose={() => setWebhookModal(false)}
        title="Add Webhook"
        description="We'll POST a JSON payload to your URL on selected events."
        footer={
          <>
            <Button variant="ghost" onClick={() => setWebhookModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setWebhookModal(false)}>Save webhook</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Endpoint URL" type="url" placeholder="https://your-server.com/webhook" />
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-2">Events to listen for</label>
            <div className="space-y-2">
              {["analysis.complete", "analysis.error", "team.member_joined", "billing.payment_failed"].map(ev => (
                <label key={ev} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-zinc-300 text-indigo-500" />
                  <code className="text-xs text-zinc-600 dark:text-zinc-300 font-mono">{ev}</code>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
