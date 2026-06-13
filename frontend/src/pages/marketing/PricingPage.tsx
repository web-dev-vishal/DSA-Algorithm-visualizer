import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Minus, HelpCircle, Zap } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { PLANS } from "../../data/plans";

const FAQ = [
  { q: "Can I change plans later?", a: "Yes, upgrade or downgrade anytime. Changes take effect immediately for upgrades and at end of billing period for downgrades." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and wire transfer for Enterprise plans." },
  { q: "Is there a free trial?", a: "Yes! Every paid plan comes with a 14-day free trial. No credit card required to start." },
  { q: "How do team seats work?", a: "Each team member needs one seat. The plan owner can invite members up to the seat limit and manage roles and permissions." },
  { q: "What's included in Enterprise?", a: "Enterprise includes everything in Business plus custom SLA, dedicated infrastructure, on-premise options, and a dedicated success manager." },
  { q: "Can I get a refund?", a: "We offer a 30-day money-back guarantee on all paid plans, no questions asked." },
];

const COMPARISON_FEATURES = [
  { feature: "Analyses per month", free: "10", starter: "100", pro: "Unlimited", business: "Unlimited", enterprise: "Unlimited" },
  { feature: "Team members", free: "1", starter: "1", pro: "5", business: "Unlimited", enterprise: "Unlimited" },
  { feature: "API calls/month", free: "100", starter: "1,000", pro: "1,000", business: "10,000", enterprise: "Unlimited" },
  { feature: "History retention", free: "7 days", starter: "30 days", pro: "Unlimited", business: "Unlimited", enterprise: "Unlimited" },
  { feature: "Export (PNG/PDF)", free: false, starter: true, pro: true, business: true, enterprise: true },
  { feature: "Custom templates", free: false, starter: false, pro: true, business: true, enterprise: true },
  { feature: "API access", free: false, starter: false, pro: true, business: true, enterprise: true },
  { feature: "Webhooks", free: false, starter: false, pro: true, business: true, enterprise: true },
  { feature: "SSO / SAML", free: false, starter: false, pro: false, business: true, enterprise: true },
  { feature: "Audit logs", free: false, starter: false, pro: false, business: true, enterprise: true },
  { feature: "Custom roles", free: false, starter: false, pro: false, business: true, enterprise: true },
  { feature: "On-premise deploy", free: false, starter: false, pro: false, business: false, enterprise: true },
  { feature: "SLA guarantee", free: false, starter: false, pro: false, business: "99.9%", enterprise: "99.99%" },
  { feature: "Support", free: "Community", starter: "Email", pro: "Priority", business: "Dedicated", enterprise: "24/7" },
];

export function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="bg-white dark:bg-zinc-950 pt-24">
      {/* Header */}
      <section className="py-16 px-4 text-center">
        <Badge variant="primary" className="mb-4">Pricing</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-8">
          No hidden fees. Cancel anytime. Free plan always available.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 rounded-full p-1">
          <button
            onClick={() => setYearly(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${!yearly ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${yearly ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400"}`}
          >
            Yearly
            <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">-20%</span>
          </button>
        </div>
      </section>

      {/* Plans grid */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PLANS.map(plan => {
            const price = plan.id === "enterprise" ? null : (yearly ? plan.yearlyPrice : plan.monthlyPrice);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-5 flex flex-col transition-all duration-200 ${
                  plan.highlighted
                    ? "border-indigo-500 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/40 dark:to-zinc-900 shadow-xl shadow-indigo-100/50 dark:shadow-indigo-900/20 scale-[1.02]"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-5">
                  {price !== null ? (
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">${price}</span>
                      <span className="text-sm text-zinc-400 mb-1">/mo</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">Custom</div>
                  )}
                  {yearly && price !== null && price > 0 && (
                    <p className="text-xs text-zinc-400 mt-0.5">billed annually</p>
                  )}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link to={plan.id === "enterprise" ? "/contact" : "/signup"}>
                  <Button
                    variant={plan.highlighted ? "primary" : "secondary"}
                    className="w-full"
                    size="sm"
                  >
                    {plan.id === "free" ? "Get started free" : plan.id === "enterprise" ? "Contact sales" : `Start ${plan.name}`}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-center mb-8">Full feature comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Feature</th>
                  {PLANS.map(p => (
                    <th key={p.id} className={`text-center px-4 py-3 text-xs font-bold uppercase tracking-wide ${p.highlighted ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500"}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-zinc-100 dark:border-zinc-800/50 ${i % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-900/30"}`}>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 font-medium">{row.feature}</td>
                    {(["free", "starter", "pro", "business", "enterprise"] as const).map(pid => {
                      const val = row[pid];
                      return (
                        <td key={pid} className="text-center px-4 py-3">
                          {typeof val === "boolean" ? (
                            val ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <Minus className="w-4 h-4 text-zinc-300 dark:text-zinc-700 mx-auto" />
                          ) : (
                            <span className="text-xs text-zinc-600 dark:text-zinc-300">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQ.map(f => (
              <div key={f.q} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white mb-1.5">{f.q}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 text-center">
        <Zap className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Still have questions?</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">Our team is happy to help you find the right plan.</p>
        <Link to="/contact">
          <Button variant="primary" size="lg">Contact sales</Button>
        </Link>
      </section>
    </div>
  );
}
