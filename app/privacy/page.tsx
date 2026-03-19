import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "YIF Capital Privacy Policy. How we collect, use, and protect your personal data. Transparent and compliant with data protection standards for our Tanzania investment platform.",
  openGraph: {
    title: "Privacy Policy | YIF Capital",
    description: "How YIF Capital collects, uses, and protects your personal data.",
    url: "/privacy",
  },
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: March 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">1. Introduction</h2>
            <p>
              YIF Capital ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and disclose your personal information when you use our website and platform at yifcapital.co.tz. We operate in accordance with applicable data protection laws and best practices for financial services. Your trust is important to us, and we handle your data with care and transparency.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">2. Information We Collect</h2>
            <p>
              We may collect: (a) <strong>Account information</strong> — name, email, phone number, and password when you register; (b) <strong>Usage data</strong> — how you use the Platform (pages visited, features used) to improve our services; (c) <strong>Device and log data</strong> — IP address, browser type, and access times for security and analytics; (d) <strong>Communications</strong> — when you contact us via email or contact forms. We do not store sensitive payment card details on our servers; payment processing is handled by secure third-party providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">3. How We Use Your Information</h2>
            <p>
              We use your information to: provide and maintain the Platform; authenticate your account; send service-related notifications; improve our products and user experience; comply with legal and regulatory obligations; and, with your consent where required, send marketing communications. We do not sell your personal data to third parties. We may share data with trusted service providers (e.g. hosting, analytics) under strict confidentiality and data-processing agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encryption in transit (HTTPS), secure authentication, and access controls. Despite our efforts, no method of transmission over the internet is 100% secure; we encourage you to use a strong password and keep your login details confidential.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">5. Data Retention</h2>
            <p>
              We retain your personal data only for as long as necessary to fulfill the purposes set out in this policy, or as required by law (e.g. for regulatory or tax purposes). When data is no longer needed, we securely delete or anonymize it. You may request deletion of your account and associated data subject to applicable retention obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">6. Your Rights</h2>
            <p>
              Depending on applicable law, you may have the right to: access your personal data; correct inaccurate data; request deletion; object to or restrict certain processing; and data portability. To exercise these rights, contact us at{" "}
              <a href="mailto:privacy@yifcapital.co.tz" className="text-primary hover:underline">privacy@yifcapital.co.tz</a>. You may also withdraw consent where processing is based on consent. If you believe we have not handled your data properly, you have the right to lodge a complaint with a supervisory authority.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">7. Cookies and Similar Technologies</h2>
            <p>
              We use cookies and similar technologies to enable essential functionality, remember your preferences, and analyze site usage. You can control cookies through your browser settings. Disabling certain cookies may affect the functionality of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will post the updated policy on this page and update the "Last updated" date. For material changes, we may notify you by email or through the Platform. Your continued use after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">9. Contact Us</h2>
            <p>
              For privacy-related questions or requests, contact us at{" "}
              <a href="mailto:privacy@yifcapital.co.tz" className="text-primary hover:underline">privacy@yifcapital.co.tz</a> or visit our{" "}
              <Link href="/contact" className="text-primary hover:underline">Contact</Link> page. YIF Capital, Ohio Street, Dar es Salaam, Tanzania.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
