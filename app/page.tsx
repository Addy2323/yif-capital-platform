"use client"

import { AuthProvider } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { ProductsSection } from "@/components/landing/products-section"
import { MarketOverviewSection } from "@/components/landing/market-overview-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CTASection } from "@/components/landing/cta-section"

export default function HomePage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          {/* <MarketOverviewSection /> */}
          <ProductsSection />
          <FeaturesSection />
          <PricingSection />
          <TestimonialsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
