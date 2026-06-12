import { useState } from "react";
import { User, Bell, Shield, Key, Trash2, Camera } from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Avatar } from "../../components/ui/Avatar";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../hooks/useAuth";

const TABS = [
  { id: "profile",       icon: User,   label: "Profile" },
  { id: "notifications", icon: Bell,   label: "Notifications" },
  { id: "security",      icon: Shield, label: "Security" },
  { id: "api",           icon: Key,    label: "API Keys" },
];

export function SettingsPage({ defaultTab = "profile" }: { defaultTab?: string }) {
  const [tab, setTab] = useState(defaultTab);
  const [deleteModal, setDeleteModal] = useState(false);
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage your account preferences.</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              tab === t.id
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === "profile" && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Profile Information</h2>
            </CardHeader>
            <CardBody className="space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar src={user?.avatar} name={user?.name ?? ""} size="xl" />
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white hover:bg-indigo-600 transition-colors">
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{user?.email}</p>
                  <Button variant="ghost" size="sm" className="mt-2 -ml-2">Change photo</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full name" defaultValue={user?.name} />
                <Input label="Email address" type="email" defaultValue={user?.email} />
                <Input label="Company" placeholder="Your company name" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Timezone</label>
                  <select className="w-full rounded-[10px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                    <option>UTC−05:00 Eastern Time</option>
                    <option>UTC+00:00 London</option>
                    <option>UTC+05:30 India</option>
                    <option>UTC+09:00 Tokyo</option>
                  </select>
                </div>
              </div>
              <Button variant="primary" size="sm">Save changes</Button>
            </CardBody>
          </Card>

          {/* Danger zone */}
          <Card className="overflow-hidden border-rose-200 dark:border-rose-900/50">
            <CardHeader className="bg-rose-50 dark:bg-rose-950/30">
              <h2 className="text-sm font-bold text-rose-700 dark:text-rose-300">Danger Zone</h2>
            </CardHeader>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">Delete account</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Permanently delete your account and all data. This cannot be undone.</p>
                </div>
                <Button variant="destructive" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeleteModal(true)}>
                  Delete account
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Notifications */}
      {tab === "notifications" && (
        <Card className="overflow-hidden">
          <CardHeader>
            <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Notification Preferences</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {[
              { label: "Analysis complete", desc: "When an analysis finishes running", email: true, inApp: true },
              { label: "Team invitations", desc: "When you're invited to a workspace", email: true, inApp: true },
              { label: "Billing updates", desc: "Invoices, payment failures, plan changes", email: true, inApp: false },
              { label: "Security alerts", desc: "New logins, password changes, MFA events", email: true, inApp: true },
              { label: "Product updates", desc: "New features, changelogs, announcements", email: false, inApp: true },
              { label: "Weekly digest", desc: "Weekly summary of your usage stats", email: true, inApp: false },
            ].map(n => (
              <div key={n.label} className="flex items-start justify-between gap-4 py-3 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{n.label}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{n.desc}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <label className="flex flex-col items-center gap-1 cursor-pointer">
                    <input type="checkbox" defaultChecked={n.email} className="sr-only" />
                    <div className={`w-8 h-4 rounded-full transition-colors ${n.email ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-700"}`}>
                      <div className={`w-3 h-3 bg-white rounded-full m-0.5 transition-transform ${n.email ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                    <span className="text-[10px] text-zinc-400">Email</span>
                  </label>
                  <label className="flex flex-col items-center gap-1 cursor-pointer">
                    <input type="checkbox" defaultChecked={n.inApp} className="sr-only" />
                    <div className={`w-8 h-4 rounded-full transition-colors ${n.inApp ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-700"}`}>
                      <div className={`w-3 h-3 bg-white rounded-full m-0.5 transition-transform ${n.inApp ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                    <span className="text-[10px] text-zinc-400">In-app</span>
                  </label>
                </div>
              </div>
            ))}
            <Button variant="primary" size="sm">Save preferences</Button>
          </CardBody>
        </Card>
      )}

      {/* Security */}
      {tab === "security" && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Password</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input label="Current password" type="password" placeholder="••••••••" />
              <Input label="New password" type="password" placeholder="••••••••" />
              <Input label="Confirm new password" type="password" placeholder="••••••••" />
              <Button variant="primary" size="sm">Update password</Button>
            </CardBody>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Two-Factor Authentication</h2>
                <Badge variant="warning">Recommended</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">Add an extra layer of security to your account. When enabled, you'll need to verify your identity with a second factor when signing in.</p>
              <Button variant="primary" size="sm" leftIcon={<Shield className="w-3.5 h-3.5" />}>Enable 2FA</Button>
            </CardBody>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Active Sessions</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {[
                { device: "Chrome on Windows", ip: "192.168.1.1", location: "New York, US", current: true, time: "Now" },
                { device: "Safari on iPhone",  ip: "10.0.0.2",    location: "Boston, US",  current: false, time: "2h ago" },
              ].map(s => (
                <div key={s.device} className="flex items-center justify-between py-2 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{s.device}</p>
                      {s.current && <Badge variant="success" className="text-[10px]">Current</Badge>}
                    </div>
                    <p className="text-xs text-zinc-400">{s.ip} · {s.location} · {s.time}</p>
                  </div>
                  {!s.current && (
                    <Button variant="destructive" size="sm">Revoke</Button>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {/* API Keys */}
      {tab === "api" && (
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">API Keys</h2>
              <Button variant="primary" size="sm" leftIcon={<Key className="w-3.5 h-3.5" />}>Create key</Button>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Use API keys to access the AlgoViz Pro API programmatically. Never share your keys publicly.</p>
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 space-y-3">
              {[
                { name: "Production Key",   created: "Jun 1, 2026",  last: "Today",       prefix: "avp_live_****8f9c" },
                { name: "Development Key",  created: "May 15, 2026", last: "3 days ago",  prefix: "avp_test_****2a7b" },
              ].map(k => (
                <div key={k.name} className="flex items-center gap-4 bg-white dark:bg-zinc-800 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
                  <Key className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{k.name}</p>
                    <p className="text-xs text-zinc-400 font-mono">{k.prefix}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-zinc-400">Created {k.created}</p>
                    <p className="text-xs text-zinc-400">Last used {k.last}</p>
                  </div>
                  <Button variant="destructive" size="sm">Revoke</Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Delete modal */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Account?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="destructive">Yes, delete my account</Button>
          </>
        }
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          This will permanently delete your account, all analyses, API keys, and team data. This action <strong>cannot be undone</strong>.
        </p>
        <Input className="mt-4" placeholder={`Type "${user?.email}" to confirm`} />
      </Modal>
    </div>
  );
}
