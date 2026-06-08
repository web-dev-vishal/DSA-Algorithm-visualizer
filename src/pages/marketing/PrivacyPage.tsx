import { Badge } from "../../components/ui/Badge";

export function PrivacyPage() {
  return (
    <div className="bg-white dark:bg-zinc-950 pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Badge variant="primary" className="mb-4">Legal</Badge>
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-zinc-400 text-sm mb-10">Last updated: June 8, 2026</p>

        <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-7 space-y-6">
          {[
            { title: "1. Information We Collect", body: "We collect information you provide directly, such as when you create an account, subscribe to a plan, or contact us. This includes your name, email address, payment information (processed by Stripe — we never store card numbers), and any algorithm code you choose to analyze." },
            { title: "2. How We Use Your Information", body: "We use your information to provide and improve our services, process transactions, send transactional emails, and respond to support requests. We analyze aggregate usage patterns to improve the product. We do not sell your personal data." },
            { title: "3. Data Storage & Security", body: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use industry-standard security practices including rate limiting, CSRF protection, and regular security audits. Algorithm code you analyze is processed server-side and is not stored beyond the session unless you explicitly save it to your history." },
            { title: "4. API Keys", body: "Your Groq API key is stored only in your browser's sessionStorage and is never transmitted to our servers. It goes directly from your browser to the Groq API." },
            { title: "5. Cookies", body: "We use cookies for authentication sessions and preference storage (dark mode, language). We use analytics cookies to understand how the product is used. You can opt out of analytics cookies at any time through our cookie settings." },
            { title: "6. Third-Party Services", body: "We use Groq for AI inference, Stripe for payments, and Resend for transactional email. Each service has its own privacy policy. We share only the minimum data necessary for each service to function." },
            { title: "7. Your Rights (GDPR)", body: "If you are in the EU/EEA, you have the right to access, correct, delete, or export your personal data. You can exercise these rights by contacting privacy@algoviz.pro. We respond to all requests within 30 days." },
            { title: "8. Data Retention", body: "We retain your account data for as long as your account is active. After account deletion, personal data is removed within 30 days. Analysis history is retained per your plan tier (7 days free, 30 days Starter, unlimited Pro+)." },
            { title: "9. Children's Privacy", body: "AlgoViz Pro is not directed at children under 13. We do not knowingly collect information from children under 13." },
            { title: "10. Contact Us", body: "Questions about this policy? Email privacy@algoviz.pro or write to: AlgoViz Pro, Inc., 123 Tech Street, San Francisco, CA 94105." },
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
