import { useState } from "react";
import { Mail, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState("general");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="bg-white dark:bg-zinc-950 pt-24">
      <section className="py-16 px-4 text-center">
        <Badge variant="primary" className="mb-4">Contact</Badge>
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">Get in touch</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">We'd love to hear from you — whether it's a question, bug report, feature request, or just a hello.</p>
      </section>

      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-5">
            {[
              { icon: Mail, title: "Email us", desc: "hello@algoviz.pro", sub: "We reply within 24h" },
              { icon: MessageSquare, title: "Live chat", desc: "Available in-app", sub: "Mon–Fri, 9am–6pm EST" },
              { icon: Clock, title: "Response time", desc: "< 24 hours", sub: "For all support tiers" },
            ].map(c => (
              <div key={c.title} className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
                  <c.icon className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{c.title}</p>
                  <p className="text-sm text-indigo-500 dark:text-indigo-400">{c.desc}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
              {sent ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Message sent!</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">We'll get back to you within 24 hours.</p>
                  <Button variant="ghost" size="sm" className="mt-4" onClick={() => setSent(false)}>Send another message</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="First name" placeholder="Alex" required />
                    <Input label="Last name" placeholder="Johnson" required />
                  </div>
                  <Input label="Email" type="email" placeholder="you@example.com" required />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Subject</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full rounded-[10px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-3 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                      <option value="general">General inquiry</option>
                      <option value="sales">Sales / Enterprise</option>
                      <option value="support">Technical support</option>
                      <option value="billing">Billing</option>
                      <option value="partnership">Partnership</option>
                      <option value="bug">Report a bug</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us how we can help…"
                      className="w-full rounded-[10px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-3 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                    />
                  </div>
                  <Button type="submit" variant="primary" className="w-full">Send message</Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
