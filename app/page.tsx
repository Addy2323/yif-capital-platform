import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { ProductsSection } from "@/components/landing/products-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { MarketOverviewSection } from "@/components/landing/market-overview-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CTASection } from "@/components/landing/cta-section"
import { AuthProvider } from "@/lib/auth-context"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

export default function HomePage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <ProductsSection />
          <ScrollAnimation animation="fade-in">
            <MarketOverviewSection />
          </ScrollAnimation>
          <ScrollAnimation animation="slide-up">
            <FeaturesSection />
          </ScrollAnimation>
          <ScrollAnimation animation="zoom-in" delay={200}>
            <TestimonialsSection />
          </ScrollAnimation>
          <CTASection />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
