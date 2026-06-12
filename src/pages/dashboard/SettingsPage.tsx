import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bell, Shield, Key, Trash2, Camera, AlertCircle, Laptop, Smartphone } from "lucide-react";
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

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  const [deleteModal, setDeleteModal] = useState(false);
  const { user } = useAuth();

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 14 } }
  } as const;

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
        className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-850 pb-5"
      >
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">System Settings</h1>
          <p className="text-sm text-zinc-550 dark:text-zinc-450 mt-1 font-medium">Manage credentials, profile metadata, alert flags, and active sessions.</p>
        </div>
      </motion.div>

      {/* Tab navigations */}
      <motion.div 
        variants={itemVariants}
        className="flex gap-1.5 bg-zinc-100/80 dark:bg-zinc-900/60 rounded-xl p-1.5 w-fit border border-zinc-200/20"
      >
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all relative ${
              tab === t.id
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-450 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
            {tab === t.id && (
              <motion.div 
                layoutId="activeSettingTab" 
                className="absolute inset-0 rounded-lg border border-indigo-400/20 pointer-events-none" 
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {tab === "profile" && (
          <motion.div
            key="profile-tab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850 shadow-sm">
              <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
                <h2 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wider select-none">Profile Metadata</h2>
              </CardHeader>
              <CardBody className="p-6 space-y-6">
                
                {/* Avatar change */}
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <Avatar src={user?.avatar} name={user?.name ?? ""} size="xl" className="border-2 border-indigo-400/20 shadow-md shadow-indigo-550/5" />
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90" title="Upload new photo">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-zinc-900 dark:text-white leading-tight">{user?.name}</p>
                    <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold mt-1">{user?.email}</p>
                    <Button variant="ghost" size="sm" className="mt-2.5 -ml-2 text-xs font-bold text-indigo-500 hover:text-indigo-650 hover:bg-indigo-50 dark:hover:bg-indigo-950/20">Change Photo</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" defaultValue={user?.name} className="shadow-sm" />
                  <Input label="Email Address" type="email" defaultValue={user?.email} className="shadow-sm" />
                  <Input label="Organization" placeholder="e.g. Acme Inc." className="shadow-sm" />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-405 uppercase tracking-wider select-none">Preferred Timezone</label>
                    <select className="w-full rounded-xl border border-zinc-250 dark:border-zinc-850 bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-100 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 shadow-sm">
                      <option>UTC+05:30 India Standard Time</option>
                      <option>UTC−05:00 Eastern Standard Time</option>
                      <option>UTC+00:00 London UTC</option>
                      <option>UTC+09:00 Tokyo JST</option>
                    </select>
                  </div>
                </div>
                <Button variant="primary" size="sm" className="text-xs font-bold shadow-sm">Save Changes</Button>
              </CardBody>
            </Card>

            {/* Danger Zone */}
            <Card className="overflow-hidden glass-card border-rose-200/60 dark:border-rose-900/40 shadow-sm">
              <CardHeader className="bg-rose-500/5 dark:bg-rose-950/20 border-b border-rose-200/40 dark:border-rose-900/30">
                <h2 className="text-sm font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider select-none">Danger Zone</h2>
              </CardHeader>
              <CardBody className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Delete Workspace Account</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-1 leading-relaxed">Permanently delete current credentials, saved code snippets, history, and API configurations. This cannot be undone.</p>
                  </div>
                  <Button variant="destructive" size="sm" className="text-xs font-bold flex items-center gap-1.5 shadow-sm flex-shrink-0" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeleteModal(true)}>
                    Delete Account
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <motion.div
            key="notifications-tab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
              <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
                <h2 className="text-sm font-bold text-zinc-850 dark:text-white uppercase tracking-wider select-none">Notification Preferences</h2>
              </CardHeader>
              <CardBody className="p-6 space-y-4">
                {[
                  { label: "Analysis completion", desc: "When an algorithm compilation finishes mapping steps", email: true, inApp: true },
                  { label: "Team requests", desc: "When invited to participate in a shared workspace", email: true, inApp: true },
                  { label: "Billing invoice alerts", desc: "Payment receipts, subscription changes", email: true, inApp: false },
                  { label: "Security authorization notices", desc: "New terminal logins, password rotates", email: true, inApp: true },
                  { label: "Product changelogs", desc: "Release updates and feature notes", email: false, inApp: true },
                ].map(n => (
                  <div key={n.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 border-b border-zinc-100 dark:border-zinc-850/50 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">{n.label}</p>
                      <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-0.5 leading-relaxed">{n.desc}</p>
                    </div>
                    <div className="flex items-center gap-6 select-none flex-shrink-0">
                      <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" defaultChecked={n.email} className="sr-only peer" />
                        <div className="w-8.5 h-4.5 bg-zinc-200 dark:bg-zinc-800 rounded-full transition-colors peer-checked:bg-indigo-600 relative">
                          <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform peer-checked:translate-x-4 shadow" />
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-450 dark:text-zinc-500">Email</span>
                      </label>
                      <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" defaultChecked={n.inApp} className="sr-only peer" />
                        <div className="w-8.5 h-4.5 bg-zinc-200 dark:bg-zinc-800 rounded-full transition-colors peer-checked:bg-indigo-600 relative">
                          <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform peer-checked:translate-x-4 shadow" />
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-450 dark:text-zinc-500">In-app</span>
                      </label>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="primary" size="sm" className="text-xs font-bold shadow-sm">Save Preferences</Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Security */}
        {tab === "security" && (
          <motion.div
            key="security-tab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Password */}
            <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
              <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
                <h2 className="text-sm font-bold text-zinc-850 dark:text-white uppercase tracking-wider select-none">Change Password</h2>
              </CardHeader>
              <CardBody className="p-6 space-y-4">
                <Input label="Current Password" type="password" placeholder="••••••••" className="shadow-sm" />
                <Input label="New Password" type="password" placeholder="••••••••" className="shadow-sm" />
                <Input label="Confirm New Password" type="password" placeholder="••••••••" className="shadow-sm" />
                <Button variant="primary" size="sm" className="text-xs font-bold shadow-sm">Update Password</Button>
              </CardBody>
            </Card>

            {/* 2FA */}
            <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
              <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-850 dark:text-white uppercase tracking-wider select-none">MFA / 2FA Settings</h2>
                  <Badge variant="warning" className="font-bold select-none py-0.5">Recommended</Badge>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-450 leading-relaxed mb-5">
                  Protect account integrations. Enabling two-factor authentication requires entering verification codes from mobile authenticator keys during login.
                </p>
                <Button variant="primary" size="sm" className="text-xs font-bold shadow-sm flex items-center gap-1.5" leftIcon={<Shield className="w-3.5 h-3.5" />}>Enable 2-Factor</Button>
              </CardBody>
            </Card>

            {/* Active Sessions */}
            <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
              <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
                <h2 className="text-sm font-bold text-zinc-850 dark:text-white uppercase tracking-wider select-none">Active Login Sessions</h2>
              </CardHeader>
              <div className="divide-y divide-zinc-150 dark:divide-zinc-850">
                {[
                  { device: "Chrome on Windows 11", ip: "192.168.1.42", location: "Mumbai, IN", current: true, time: "Now", icon: Laptop },
                  { device: "Safari on iPhone 15",  ip: "103.54.21.1",    location: "Pune, IN",  current: false, time: "3 hours ago", icon: Smartphone },
                ].map(s => (
                  <div key={s.device} className="flex items-center gap-3.5 px-5 py-4 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30 transition-colors">
                    <div className="w-8.5 h-8.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center flex-shrink-0">
                      <s.icon className="w-4.5 h-4.5 text-zinc-450" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{s.device}</p>
                        {s.current && <Badge variant="success" className="text-[9px] font-bold select-none px-2 py-0.5">This Device</Badge>}
                      </div>
                      <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold mt-0.5">{s.ip} · {s.location} · {s.time}</p>
                    </div>
                    {!s.current && (
                      <Button variant="destructive" size="sm" className="text-xs font-bold px-3 py-1.5 shadow-sm">Revoke</Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* API keys config summary */}
        {tab === "api" && (
          <motion.div
            key="api-keys-tab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
              <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-850 dark:text-white uppercase tracking-wider select-none">Developer Tokens</h2>
                  <Link to="/dashboard/api">
                    <Button variant="primary" size="sm" className="text-xs font-bold shadow-sm" leftIcon={<Key className="w-3.5 h-3.5" />}>Manage Keys</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-450 leading-relaxed">
                  Use authorization tokens to fetch analysis JSON schemas from custom build terminals or CI/CD testing pipelines.
                </p>
                <div className="mt-4 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Production Key active</p>
                    <code className="text-xs text-zinc-450 dark:text-zinc-500 font-mono mt-0.5 block">avp_live_****8f9c</code>
                  </div>
                  <Badge variant="success" className="font-bold py-0.5">Active</Badge>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete account confirmation dialog */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Permanently Delete Account?"
        footer={
          <>
            <Button variant="ghost" className="text-xs font-bold" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="destructive" className="text-xs font-bold shadow-sm">Verify & Delete</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-400">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold leading-relaxed">
              Warning: Account deletions wipe login credentials, custom API setups, keys list, and saved compilations history. This action is permanent.
            </p>
          </div>
          <Input className="shadow-sm" placeholder={`Type "${user?.email}" to verify`} />
        </div>
      </Modal>
    </motion.div>
  );
}
