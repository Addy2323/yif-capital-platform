import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions of use for YIF Capital, Tanzania's digital investment platform. Read our legal terms, user obligations, and service agreement.",
  openGraph: {
    title: "Terms & Conditions | YIF Capital",
    description:
      "Terms and conditions of use for YIF Capital, Tanzania's digital investment platform.",
    url: "/terms",
  },
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Terms & Conditions</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: March 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the YIF Capital platform ("Platform") and website at yifcapital.co.tz, you agree to be bound by these Terms and Conditions. If you do not agree, do not use our services. YIF Capital is a Tanzania-based digital investment and analytics platform designed to provide information and tools for investors. Our services are offered in compliance with applicable Tanzanian regulations, including the Capital Markets and Securities Authority (CMSA).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">2. Use of the Platform</h2>
            <p>
              You agree to use the Platform only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the Platform. You must not use the Platform to distribute harmful or misleading financial advice, manipulate data, or attempt to gain unauthorized access to any system or user account. All data and analytics provided (including NAV, fund performance, and market data) are for informational purposes only and do not constitute investment advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">3. Account and Registration</h2>
            <p>
              When you register, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. YIF Capital reserves the right to suspend or terminate accounts that violate these terms or that we reasonably believe pose a risk to the Platform or other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">4. Privacy and Data</h2>
            <p>
              Your use of the Platform is also governed by our{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. We process personal data in accordance with applicable data protection laws and our Privacy Policy. By using the Platform, you consent to such processing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">5. Intellectual Property</h2>
            <p>
              All content, branding, logos, and software on the Platform are owned by YIF Capital or our licensors. You may not copy, modify, or distribute our content without prior written permission. Trademarks and names of third-party funds, exchanges (e.g. DSE), or products remain the property of their respective owners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">6. Disclaimer of Investment Advice</h2>
            <p>
              YIF Capital provides data, analytics, and educational content only. We do not provide personalized investment advice, and nothing on the Platform should be construed as such. Past performance of funds or securities does not guarantee future results. You should seek advice from a licensed financial adviser before making investment decisions. Investment in capital markets involves risk, including possible loss of principal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, YIF Capital and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform or reliance on any content or data. Our total liability shall not exceed the amount you paid to us (if any) in the twelve months preceding the claim. We do not guarantee the accuracy, completeness, or timeliness of third-party data (e.g. fund NAV, DSE data) displayed on the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">8. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Platform after changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">9. Governing Law and Contact</h2>
            <p>
              These Terms are governed by the laws of the United Republic of Tanzania. Any disputes shall be subject to the exclusive jurisdiction of the courts of Tanzania. For questions about these Terms, contact us at{" "}
              <a href="mailto:legal@yifcapital.co.tz" className="text-primary hover:underline">legal@yifcapital.co.tz</a> or visit our{" "}
              <Link href="/contact" className="text-primary hover:underline">Contact</Link> page.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
