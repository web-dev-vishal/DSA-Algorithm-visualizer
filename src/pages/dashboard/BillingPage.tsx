import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Download, Check, Zap, AlertCircle, Calendar, Receipt, Sparkles } from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { PLANS } from "../../data/plans";
import { useAuth } from "../../hooks/useAuth";

const INVOICES = [
  { id: "inv_001", date: "Jun 1, 2026",  amount: "$12.00", status: "paid", plan: "Pro (Monthly)" },
  { id: "inv_002", date: "May 1, 2026",  amount: "$12.00", status: "paid", plan: "Pro (Monthly)" },
  { id: "inv_003", date: "Apr 1, 2026",  amount: "$12.00", status: "paid", plan: "Pro (Monthly)" },
  { id: "inv_004", date: "Mar 1, 2026",  amount: "$12.00", status: "paid", plan: "Pro (Monthly)" },
];

export function BillingPage() {
  const { user } = useAuth();
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const currentPlan = PLANS.find(p => p.id === user?.plan) ?? PLANS[0]!;

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
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Billing & Subscriptions</h1>
          <p className="text-sm text-zinc-550 dark:text-zinc-450 mt-1 font-medium">Manage payment methods, adjust plans, and check invoices.</p>
        </div>
      </motion.div>

      {/* Current Subscription Card */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-850 dark:text-white uppercase tracking-wider select-none">Current Plan Details</h2>
              <Badge variant={currentPlan.id === "free" ? "default" : "success"} className="font-bold select-none px-2.5 py-0.5">
                {currentPlan.id === "free" ? "Free Tier" : "Active Subscription"}
              </Badge>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow shadow-indigo-500/10">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">{currentPlan.name} Subscription</h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">
                      {currentPlan.monthlyPrice === 0 ? "Free forever tier" : `$${currentPlan.monthlyPrice}/mo · billed monthly`}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mt-5">
                  {currentPlan.features.slice(0, 4).map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs font-semibold text-zinc-650 dark:text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                <Button variant="primary" className="shadow-sm w-full md:w-40 text-xs font-bold" onClick={() => setUpgradeModal(true)}>
                  {currentPlan.id === "free" ? "Upgrade Account" : "Change Subscription"}
                </Button>
                {currentPlan.id !== "free" && (
                  <Button variant="ghost" className="w-full md:w-40 text-xs text-zinc-450 hover:text-zinc-700 hover:bg-zinc-100/60" onClick={() => setCancelModal(true)}>
                    Cancel Plan
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Meter for Free Tier users */}
            {currentPlan.id === "free" && (
              <div className="mt-6 pt-5 border-t border-zinc-150 dark:border-zinc-850">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-650 dark:text-zinc-450 mb-2">
                  <span>Monthly Workspace Runs</span>
                  <span>7 / 10 used</span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full w-[70%] bg-indigo-500 rounded-full shadow" />
                </div>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-550 font-medium mt-2">
                  Downgraded to free limits. Plan resets to 10 visual runs on Jul 1.
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Grid: Payment Method & Next Invoice */}
      {currentPlan.id !== "free" && (
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Payment Method */}
          <Card className="glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm flex flex-col justify-between">
            <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
              <h2 className="text-xs font-bold text-zinc-850 dark:text-white uppercase tracking-wider select-none">Card Settings</h2>
            </CardHeader>
            <CardBody className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-8 bg-zinc-100 border border-zinc-200/60 dark:bg-zinc-800 dark:border-zinc-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">Visa ending in 4242</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">Expires 12/28</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="text-xs font-bold px-3 py-1.5 border border-zinc-200/60 dark:border-zinc-800">Edit Card</Button>
            </CardBody>
          </Card>

          {/* Upcoming invoice */}
          <Card className="glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm flex flex-col justify-between">
            <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
              <h2 className="text-xs font-bold text-zinc-850 dark:text-white uppercase tracking-wider select-none">Upcoming Invoice</h2>
            </CardHeader>
            <CardBody className="p-5 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-zinc-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  <span className="font-extrabold text-indigo-650 dark:text-indigo-400">$12.00</span> due on <span className="font-bold">Jul 1, 2026</span>
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">Pro plan subscription · Monthly invoice</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Invoice list */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden glass-card border-zinc-200/60 dark:border-zinc-850/60 shadow-sm">
          <CardHeader className="border-b border-zinc-150 dark:border-zinc-850">
            <h2 className="text-xs font-bold text-zinc-850 dark:text-white uppercase tracking-wider select-none">Payment History</h2>
          </CardHeader>
          {currentPlan.id === "free" ? (
            <CardBody className="p-6 text-center py-10">
              <Receipt className="w-10 h-10 text-zinc-300 dark:text-zinc-750 mx-auto mb-3" />
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-450 select-none">No transactions found</p>
              <p className="text-xs text-zinc-400 mt-1 select-none">Visual records generate automatically after upgrading subscriptions.</p>
            </CardBody>
          ) : (
            <div className="divide-y divide-zinc-150 dark:divide-zinc-850">
              {INVOICES.map(inv => (
                <div key={inv.id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{inv.plan}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">{inv.date} · {inv.id}</p>
                  </div>
                  <p className="text-sm font-black text-zinc-900 dark:text-white">{inv.amount}</p>
                  <Badge variant="success" className="font-bold select-none px-2 py-0.5">Paid</Badge>
                  <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-zinc-100 dark:hover:bg-zinc-800" title="Download invoice pdf">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Upgrade pricing plans modal */}
      <Modal
        open={upgradeModal}
        onClose={() => setUpgradeModal(false)}
        title="Choose a Subscription Plan"
        description="Select from our flexible pricing tiers. Cancel anytime."
        size="xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-2">
          {PLANS.filter(p => p.id !== "enterprise").map(plan => {
            const isCurrent = plan.id === user?.plan;
            return (
              <div
                key={plan.id}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
                  isCurrent
                    ? "border-indigo-650 bg-indigo-50/40 dark:bg-indigo-950/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-400/40 dark:hover:border-indigo-700/40"
                }`}
              >
                {plan.id === "pro" && (
                  <span className="absolute -top-3 right-1/2 translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[9px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full shadow flex items-center gap-1 select-none">
                    <Sparkles className="w-2.5 h-2.5 fill-current" /> Recommended
                  </span>
                )}
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white text-base">{plan.name} Plan</h4>
                  <p className="text-2xl font-black my-2.5 text-zinc-900 dark:text-white">
                    {plan.monthlyPrice === 0 ? "Free" : `$${plan.monthlyPrice}`}
                    {plan.monthlyPrice > 0 && <span className="text-xs text-zinc-450 dark:text-zinc-550 font-normal"> / mo</span>}
                  </p>
                  <p className="text-[10px] text-zinc-450 dark:text-zinc-550 font-bold uppercase tracking-wider mb-4">{plan.monthlyPrice > 0 ? "Monthly billings" : "No credit card needed"}</p>
                  <ul className="space-y-2">
                    {plan.features.slice(0, 4).map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs font-semibold text-zinc-650 dark:text-zinc-350">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant={isCurrent ? "secondary" : "primary"}
                  size="sm"
                  className="w-full mt-5 text-xs font-bold"
                  disabled={isCurrent}
                >
                  {isCurrent ? "Current Plan" : "Upgrade"}
                </Button>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-start gap-2.5 bg-zinc-100/50 dark:bg-zinc-900 p-4 rounded-xl">
          <AlertCircle className="w-4.5 h-4.5 text-zinc-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-500 dark:text-zinc-450 font-semibold leading-relaxed">
            Need customized organization integrations or volume discounts? <Link to="/contact" className="text-indigo-500 hover:underline">Contact our product sales representatives</Link> for custom terms.
          </p>
        </div>
      </Modal>

      {/* Cancel subscription verification modal */}
      <Modal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancel subscription benefits?"
        description="If you cancel, your account Pro access privileges remain active until Jul 1, 2026."
        footer={
          <>
            <Button variant="ghost" className="text-xs font-bold" onClick={() => setCancelModal(false)}>Keep Subscription</Button>
            <Button variant="destructive" className="text-xs font-bold" onClick={() => setCancelModal(false)}>Cancel Subscription</Button>
          </>
        }
      >
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-450">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold select-none">Important cancellation notice</h4>
            <ul className="text-xs space-y-1.5 mt-2">
              <li>• Your workspace limits downgrade to 10 visual runs per month on reset date.</li>
              <li>• Shared team bookmarks and collaborator workspace features will lock.</li>
              <li>• Saved snippet logs older than 7 days will be deleted.</li>
            </ul>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
