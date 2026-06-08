import { useState } from "react";
import { UserPlus, MoreHorizontal, Shield, Crown, User, Mail } from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Avatar } from "../../components/ui/Avatar";

const MEMBERS = [
  { id: "1", name: "Alex Johnson",    email: "alex@company.com",     role: "owner",   status: "active",  joinedAt: "Jan 15, 2026", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Alex" },
  { id: "2", name: "Sara Williams",   email: "sara@company.com",     role: "admin",   status: "active",  joinedAt: "Feb 3, 2026",  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sara" },
  { id: "3", name: "Marcus Chen",     email: "marcus@company.com",   role: "member",  status: "active",  joinedAt: "Mar 10, 2026", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus" },
  { id: "4", name: "Priya Sharma",    email: "priya@company.com",    role: "member",  status: "invited", joinedAt: "Jun 7, 2026",  avatar: "" },
];

const ROLE_CONFIG = {
  owner:   { label: "Owner",   icon: Crown,  variant: "warning" as const,  color: "text-amber-500" },
  admin:   { label: "Admin",   icon: Shield, variant: "error" as const,    color: "text-rose-500" },
  manager: { label: "Manager", icon: Shield, variant: "info" as const,     color: "text-sky-500" },
  member:  { label: "Member",  icon: User,   variant: "default" as const,  color: "text-zinc-400" },
  guest:   { label: "Guest",   icon: User,   variant: "outline" as const,  color: "text-zinc-300" },
};

export function TeamPage() {
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Team</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your workspace members and permissions.
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => setInviteModal(true)}>
          Invite member
        </Button>
      </div>

      {/* Team overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total members", value: "4", sub: "of 5 seats" },
          { label: "Active",        value: "3", sub: "members" },
          { label: "Pending",       value: "1", sub: "invitation" },
          { label: "Seats left",    value: "1", sub: "on Pro plan" },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{s.value}</p>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{s.label}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Members list */}
      <Card className="overflow-hidden">
        <CardHeader>
          <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Members ({MEMBERS.length})</h2>
        </CardHeader>
        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
          {MEMBERS.map(m => {
            const roleConfig = ROLE_CONFIG[m.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.member;
            return (
              <div key={m.id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group">
                <Avatar src={m.avatar} name={m.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{m.name}</p>
                    {m.status === "invited" && (
                      <Badge variant="warning" className="text-[10px]">Pending</Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{m.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <roleConfig.icon className={`w-3.5 h-3.5 ${roleConfig.color}`} />
                  <Badge variant={roleConfig.variant} className="text-[10px]">{roleConfig.label}</Badge>
                </div>
                <p className="text-xs text-zinc-400 hidden md:block whitespace-nowrap">Joined {m.joinedAt}</p>
                {m.role !== "owner" && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Roles reference */}
      <Card className="overflow-hidden">
        <CardHeader>
          <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Role Permissions</h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b border-zinc-100 dark:border-zinc-800">
                  <th className="pb-2 pr-6 text-zinc-500 font-semibold">Permission</th>
                  {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                    <th key={role} className="pb-2 pr-4 text-center">
                      <Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-zinc-600 dark:text-zinc-300">
                {[
                  { perm: "Run analyses",          owner: true, admin: true, manager: true, member: true, guest: true },
                  { perm: "View team history",      owner: true, admin: true, manager: true, member: true, guest: false },
                  { perm: "Invite members",         owner: true, admin: true, manager: true, member: false, guest: false },
                  { perm: "Manage roles",           owner: true, admin: true, manager: false, member: false, guest: false },
                  { perm: "Manage billing",         owner: true, admin: false, manager: false, member: false, guest: false },
                  { perm: "Delete workspace",       owner: true, admin: false, manager: false, member: false, guest: false },
                ].map(row => (
                  <tr key={row.perm} className="border-b border-zinc-50 dark:border-zinc-800/50">
                    <td className="py-2 pr-6 font-medium">{row.perm}</td>
                    {["owner", "admin", "manager", "member", "guest"].map(role => (
                      <td key={role} className="py-2 pr-4 text-center">
                        {(row as any)[role] ? (
                          <span className="text-emerald-500">✓</span>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-700">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Invite Modal */}
      <Modal
        open={inviteModal}
        onClose={() => setInviteModal(false)}
        title="Invite Team Member"
        description="Send an invitation to join your workspace."
        footer={
          <>
            <Button variant="ghost" onClick={() => setInviteModal(false)}>Cancel</Button>
            <Button variant="primary" leftIcon={<Mail className="w-3.5 h-3.5" />} onClick={() => setInviteModal(false)}>
              Send invitation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Role</label>
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="w-full rounded-[10px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            >
              <option value="admin">Admin — full access except billing</option>
              <option value="manager">Manager — can invite members</option>
              <option value="member">Member — standard access</option>
              <option value="guest">Guest — view-only</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
