import { Header } from "@/components/header"
import { HeroSection } from "@/components/landing/hero-section"
import { ProductsSection } from "@/components/landing/products-section"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"

export default function HomePage() {
  return (
    <div
      className="flex flex-col h-screen overflow-hidden sm:overflow-hidden overflow-y-auto bg-navy bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/logo%20payment/background/mobile.png')" }}
    >
      <Header />
      <HeroSection />
      <ProductsSection />
      <div className="mt-auto">
        <Footer />
      </div>
      <MobileNav />
    </div>
  )
}
