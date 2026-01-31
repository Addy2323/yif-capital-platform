"use client"

import { AuthProvider } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PricingSection } from "@/components/landing/pricing-section"

export default function PricingPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <PricingSection />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
