import { Badge } from "../../components/ui/Badge";

export function TermsPage() {
  return (
    <div className="bg-white dark:bg-zinc-950 pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Badge variant="primary" className="mb-4">Legal</Badge>
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-zinc-400 text-sm mb-10">Last updated: June 8, 2026</p>
        <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-7 space-y-6">
          {[
            { title: "1. Acceptance of Terms", body: "By accessing or using AlgoViz Pro, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the service." },
            { title: "2. Description of Service", body: "AlgoViz Pro provides an AI-powered algorithm visualization platform. We reserve the right to modify, suspend, or discontinue any part of the service at any time with reasonable notice." },
            { title: "3. Account Responsibilities", body: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. You are responsible for all activity occurring under your account." },
            { title: "4. Acceptable Use", body: "You may not use AlgoViz Pro for any unlawful purpose, to violate any intellectual property rights, to transmit harmful code, to attempt unauthorized access to our systems, or to resell the service without our written permission." },
            { title: "5. Subscription and Billing", body: "Paid subscriptions are billed in advance on a monthly or annual basis. You may cancel at any time. No refunds are provided for partial billing periods, except as required by law or our 30-day money-back guarantee for new subscribers." },
            { title: "6. Intellectual Property", body: "AlgoViz Pro and its original content, features, and functionality are owned by AlgoViz Pro, Inc. and are protected by international copyright, trademark, and other intellectual property laws." },
            { title: "7. User Content", body: "You retain ownership of any algorithm code you submit. By using the service, you grant us a limited license to process your code for the purpose of providing the visualization service." },
            { title: "8. Disclaimer of Warranties", body: 'The service is provided "as is" without warranty of any kind. We do not warrant that the service will be error-free, uninterrupted, or that AI-generated analysis will be 100% accurate.' },
            { title: "9. Limitation of Liability", body: "In no event shall AlgoViz Pro be liable for indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability is limited to the amount you paid in the last 12 months." },
            { title: "10. Governing Law", body: "These terms are governed by the laws of the State of California, USA, without regard to conflict of law principles." },
          ].map(s => (
            <section key={s.title}>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-2">{s.title}</h2>
              <p className="text-zinc-600 dark:text-zinc-300">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
