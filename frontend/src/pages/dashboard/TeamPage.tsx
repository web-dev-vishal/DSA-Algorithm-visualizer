import React, { useState } from "react";
import { motion } from "framer-motion";
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

function isValidRole(role: string): role is keyof typeof ROLE_CONFIG {
  return role in ROLE_CONFIG;
}

export function TeamPage(): React.ReactElement {
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
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
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-850 pb-5"
      >
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Workspace Team</h1>
          <p className="text-sm text-zinc-550 dark:text-zinc-455 mt-1.5 font-medium">Manage members, update collaborator permissions, and monitor active seats.</p>
        </div>
        <Button variant="primary" size="sm" className="shadow-lg shadow-indigo-500/10 flex items-center gap-1.5 text-xs font-bold" leftIcon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => setInviteModal(true)}>
          Invite Member
        </Button>
      </motion.div>

      {/* Team stats counters */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 select-none"
      >
        {[
          { label: "Total Members", value: "4", sub: "of 5 seats" },
          { label: "Active seats",   value: "3", sub: "members verified" },
          { label: "Pending invites", value: "1", sub: "invitations sent" },
          { label: "Seats left",      value: "1", sub: "Pro subscription limit" },
        ].map((s, idx) => (
          <motion.div variants={itemVariants} key={idx}>
            <Card className="p-4 text-center glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm flex flex-col justify-center min-h-[6.5rem]">
              <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{s.value}</p>
              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1.5">{s.label}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1 font-medium">{s.sub}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Members list */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
            <h2 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wider select-none">Active Members ({MEMBERS.length})</h2>
          </CardHeader>
          <div className="divide-y divide-zinc-150 dark:divide-zinc-850">
            {MEMBERS.map(m => {
              const role = isValidRole(m.role) ? m.role : "member";
              const roleConfig = ROLE_CONFIG[role];
              return (
                <div key={m.id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30 transition-colors group">
                  <Avatar src={m.avatar} name={m.name} size="md" className="border border-zinc-200/65" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{m.name}</p>
                      {m.status === "invited" && (
                        <Badge variant="warning" className="text-[9px] font-bold select-none px-2 py-0.5">Pending Invite</Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-450 dark:text-zinc-500 truncate mt-0.5">{m.email}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 select-none">
                    <roleConfig.icon className={`w-3.5 h-3.5 ${roleConfig.color}`} />
                    <Badge variant={roleConfig.variant} className="text-[10px] font-bold py-0.5">{roleConfig.label}</Badge>
                  </div>
                  <p className="text-xs text-zinc-450 dark:text-zinc-500 font-medium hidden md:block whitespace-nowrap">Joined {m.joinedAt}</p>
                  {m.role !== "owner" && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                      <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-zinc-150/40">
                        <MoreHorizontal className="w-4 h-4 text-zinc-450" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Permissions Matrix */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
            <h2 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wider select-none">Permission Levels Matrix</h2>
          </CardHeader>
          <CardBody className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b border-zinc-150 dark:border-zinc-850 pb-2 select-none">
                    <th className="pb-3 pr-6 text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider">Permission Scope</th>
                    {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                      <th key={role} className="pb-3 pr-4 text-center">
                        <Badge variant={cfg.variant} className="text-[9px] font-bold py-0.5 select-none">{cfg.label}</Badge>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-zinc-650 dark:text-zinc-350 divide-y divide-zinc-100 dark:divide-zinc-900">
                  {[
                    { perm: "Execute code analysis", owner: true, admin: true, manager: true, member: true, guest: true },
                    { perm: "Browse shared history logs", owner: true, admin: true, manager: true, member: true, guest: false },
                    { perm: "Invite members to workspace", owner: true, admin: true, manager: true, member: false, guest: false },
                    { perm: "Adjust collaborator roles", owner: true, admin: true, manager: false, member: false, guest: false },
                    { perm: "Modify subscription billing", owner: true, admin: false, manager: false, member: false, guest: false },
                    { perm: "Delete current workspace", owner: true, admin: false, manager: false, member: false, guest: false },
                  ].map(row => (
                    <tr key={row.perm} className="hover:bg-zinc-100/10 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="py-3 pr-6 font-semibold text-zinc-700 dark:text-zinc-300">{row.perm}</td>
                      {["owner", "admin", "manager", "member", "guest"].map(role => (
                        <td key={role} className="py-3 pr-4 text-center font-bold text-base select-none">
                          {row[role as keyof typeof row] ? (
                            <span className="text-emerald-500">✓</span>
                          ) : (
                            <span className="text-zinc-350 dark:text-zinc-750 font-normal">—</span>
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
      </motion.div>

      {/* Invite Modal Dialog */}
      <Modal
        open={inviteModal}
        onClose={() => setInviteModal(false)}
        title="Invite Team Member"
        description="Send an invitation link to join your workspace."
        footer={
          <>
            <Button variant="ghost" className="text-xs font-bold" onClick={() => setInviteModal(false)}>Cancel</Button>
            <Button variant="primary" className="text-xs font-bold shadow-sm" leftIcon={<Mail className="w-3.5 h-3.5" />} onClick={() => setInviteModal(false)}>
              Send Invite Link
            </Button>
          </>
        }
      >
        <div className="space-y-4 mt-2">
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@yourcompany.com"
            value={inviteEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">Workspace Role</label>
            <select
              value={inviteRole}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setInviteRole(e.target.value)}
              className="w-full rounded-xl border border-zinc-250 dark:border-zinc-850 bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-100 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
            >
              <option value="admin">Admin — full access (excludes billing settings)</option>
              <option value="manager">Manager — can invite new collaborators</option>
              <option value="member">Member — standard workspace credentials</option>
              <option value="guest">Guest — view-only credentials</option>
            </select>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
