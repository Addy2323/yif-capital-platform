import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { ProductsSection } from "@/components/landing/products-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { MarketOverviewSection } from "@/components/landing/market-overview-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CTASection } from "@/components/landing/cta-section"
import { AuthProvider } from "@/lib/auth-context"

export default function HomePage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <ProductsSection />
          {/* We can decide to hide these below if wanted to strictly match only the visible part of the image, 
              but usually, the image shows the top folds. I'll include them for a complete landing page experience. */}
          {/* <MarketOverviewSection /> */}
          {/* <FeaturesSection /> */}
          {/* <TestimonialsSection /> */}
          {/* <CTASection /> */}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
