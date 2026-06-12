import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Download, Check, Zap, AlertCircle, Calendar, Receipt } from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { PLANS } from "../../data/plans";
import { useAuth } from "../../hooks/useAuth";

const INVOICES = [
  { id: "inv_001", date: "Jun 1, 2026",  amount: "$19.00", status: "paid", plan: "Pro (Yearly)" },
  { id: "inv_002", date: "May 1, 2026",  amount: "$19.00", status: "paid", plan: "Pro (Yearly)" },
  { id: "inv_003", date: "Apr 1, 2026",  amount: "$19.00", status: "paid", plan: "Pro (Yearly)" },
  { id: "inv_004", date: "Mar 1, 2026",  amount: "$19.00", status: "paid", plan: "Pro (Yearly)" },
];

export function BillingPage() {
  const { user } = useAuth();
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const currentPlan = PLANS.find(p => p.id === user?.plan) ?? PLANS[0]!;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Billing & Subscription</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage your plan, payment method, and invoices.</p>
      </div>

      {/* Current plan */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Current Plan</h2>
            <Badge variant={currentPlan.id === "free" ? "default" : "success"} dot>
              {currentPlan.id === "free" ? "Free" : "Active"}
            </Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg text-zinc-900 dark:text-white">{currentPlan.name} Plan</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {currentPlan.monthlyPrice === 0 ? "Free forever" : `$${currentPlan.yearlyPrice}/mo · billed annually`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {currentPlan.features.slice(0, 4).map(f => (
                  <div key={f} className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button variant="primary" size="sm" onClick={() => setUpgradeModal(true)}>
                {currentPlan.id === "free" ? "Upgrade plan" : "Change plan"}
              </Button>
              {currentPlan.id !== "free" && (
                <Button variant="ghost" size="sm" onClick={() => setCancelModal(true)}>
                  Cancel subscription
                </Button>
              )}
            </div>
          </div>

          {/* Usage */}
          {currentPlan.id === "free" && (
            <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Monthly Analyses</p>
                <p className="text-xs text-zinc-500">7 / 10</p>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full w-[70%] bg-indigo-500 rounded-full" />
              </div>
              <p className="text-xs text-zinc-400 mt-1.5">3 analyses remaining this month. Resets Jul 1.</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Payment method */}
      {currentPlan.id !== "free" && (
        <Card className="overflow-hidden">
          <CardHeader>
            <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Payment Method</h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-zinc-100 dark:bg-zinc-800 rounded-md flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">Visa ending in 4242</p>
                  <p className="text-xs text-zinc-400">Expires 12/28</p>
                </div>
              </div>
              <Button variant="secondary" size="sm">Update</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Next billing */}
      {currentPlan.id !== "free" && (
        <Card className="overflow-hidden">
          <CardHeader>
            <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Upcoming Invoice</h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <div>
                <p className="text-sm text-zinc-900 dark:text-white">
                  <span className="font-semibold">$19.00</span> due on <span className="font-semibold">Jul 1, 2026</span>
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">Pro Plan · Annual subscription</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Invoice history */}
      <Card className="overflow-hidden">
        <CardHeader>
          <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Invoice History</h2>
        </CardHeader>
        {currentPlan.id === "free" ? (
          <CardBody>
            <div className="text-center py-6">
              <Receipt className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No invoices yet</p>
              <p className="text-xs text-zinc-400 mt-1">Upgrade to a paid plan to see invoice history</p>
            </div>
          </CardBody>
        ) : (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
            {INVOICES.map(inv => (
              <div key={inv.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{inv.plan}</p>
                  <p className="text-xs text-zinc-400">{inv.date} · {inv.id}</p>
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{inv.amount}</p>
                <Badge variant="success">Paid</Badge>
                <Button variant="ghost" size="icon">
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Upgrade modal */}
      <Modal
        open={upgradeModal}
        onClose={() => setUpgradeModal(false)}
        title="Choose a Plan"
        description="Upgrade or change your subscription at any time."
        size="xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.filter(p => p.id !== "enterprise").map(plan => (
            <div
              key={plan.id}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                plan.id === user?.plan
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700"
              }`}
            >
              <p className="font-bold text-zinc-900 dark:text-white">{plan.name}</p>
              <p className="text-2xl font-extrabold my-1 text-zinc-900 dark:text-white">
                {plan.monthlyPrice === 0 ? "Free" : `$${plan.yearlyPrice}/mo`}
              </p>
              <p className="text-xs text-zinc-400 mb-3">{plan.monthlyPrice > 0 ? "billed annually" : "forever"}</p>
              <ul className="space-y-1">
                {plan.features.slice(0, 3).map(f => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.id === user?.plan ? "secondary" : "primary"}
                size="sm"
                className="w-full mt-3"
                disabled={plan.id === user?.plan}
              >
                {plan.id === user?.plan ? "Current plan" : "Select"}
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Need Enterprise features? <Link to="/contact" className="text-indigo-500 hover:underline">Contact sales</Link> for custom pricing.
          </p>
        </div>
      </Modal>

      {/* Cancel modal */}
      <Modal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancel Subscription?"
        description="You'll keep Pro access until Jul 1, 2026."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelModal(false)}>Keep subscription</Button>
            <Button variant="destructive" onClick={() => setCancelModal(false)}>Yes, cancel</Button>
          </>
        }
      >
        <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-1">This will cancel your subscription</p>
            <ul className="text-xs text-rose-600 dark:text-rose-400 space-y-1">
              <li>• Your plan downgrades to Free on Jul 1, 2026</li>
              <li>• Team workspaces will be locked</li>
              <li>• Analysis history older than 7 days will be removed</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}
