import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-navy">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gold/10 p-8 lg:p-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212, 160, 23, 0.5) 1px, transparent 0)`,
                backgroundSize: "30px 30px",
              }}
            />
          </div>

          <div className="relative text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl text-balance">
              Start Your Investment Journey Today
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70 text-pretty">
              Join thousands of investors who trust YIF Capital for market data, education, and portfolio management.
              Get started with a free account or try Pro for 14 days.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="bg-gold text-navy hover:bg-gold/90 text-base">
                <Link href="/register">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/30 text-white hover:bg-white/10 text-base bg-transparent"
              >
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-white/50">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
