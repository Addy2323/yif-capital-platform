"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, TrendingUp, Shield } from "lucide-react"
import { FadeIn, FadeInLeft, FadeInRight, AnimatedCounter } from "@/components/ui/animated"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-navy">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-30"
        >
          <source src="https://media.istockphoto.com/id/472839487/video/positive-trend-chart.mp4?s=mp4-640x640-is&k=20&c=I9kVit25mTLa4UbrZO3TAVK8EpZRQKsqJxoqkYTF7AA=" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-navy/60" />
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212, 160, 23, 0.3) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-20 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Content */}
          <FadeInLeft className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm text-gold animate-pulse-ring">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold"></span>
              </span>
              Live Market Data
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
              Your Gateway to
              <span className="text-gradient-gold"> Tanzanian Capital Markets</span>
            </h1>

            <p className="mt-6 text-lg text-white/70 leading-relaxed text-pretty">
              YIF Capital is a unified digital investment ecosystem designed to empower individuals and institutions
              through data, learning, and investing tools.
            </p>

            <ScrollAnimation animation="slide-up" delay={200} className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" asChild className="bg-gold text-navy hover:bg-gold/90 text-base press-effect glow-gold-hover transition-all duration-300">
                <Link href="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 text-base bg-transparent press-effect transition-all duration-300 hover:border-gold/50">
                <Link href="/analytics">Explore Analytics</Link>
              </Button>
            </ScrollAnimation>

            {/* Trust Badges */}
            <FadeIn delay={0.3} className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-white/60 hover:text-white/80 transition-colors">
                <Shield className="h-5 w-5 text-gold" />
                <span>CMSA Regulated</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60 hover:text-white/80 transition-colors">
                <BarChart3 className="h-5 w-5 text-gold" />
                <span>Real-time Data</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60 hover:text-white/80 transition-colors">
                <TrendingUp className="h-5 w-5 text-gold" />
                <span><AnimatedCounter value={10000} suffix="+" /> Users</span>
              </div>
            </FadeIn>
          </FadeInLeft>

          {/* Stats Card */}
          <FadeInRight className="relative">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm lg:p-8 hover-lift glass">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">DSE Market Overview</h3>
                <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-medium text-success flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
                  </span>
                  Live
                </span>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors duration-300">
                  <p className="text-sm text-white/60">All Share Index</p>
                  <p className="mt-1 text-2xl font-bold text-white"><AnimatedCounter value={2145.67} decimals={2} /></p>
                  <p className="mt-1 text-sm font-medium text-success">+0.87%</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors duration-300">
                  <p className="text-sm text-white/60">Trading Volume</p>
                  <p className="mt-1 text-2xl font-bold text-white"><AnimatedCounter value={3.2} decimals={1} suffix="M" /></p>
                  <p className="mt-1 text-sm font-medium text-success">+12.4%</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors duration-300">
                  <p className="text-sm text-white/60">Market Cap</p>
                  <p className="mt-1 text-2xl font-bold text-white"><AnimatedCounter value={18.5} decimals={1} suffix="T" /></p>
                  <p className="mt-1 text-sm text-white/60">TZS</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors duration-300">
                  <p className="text-sm text-white/60">Active Stocks</p>
                  <p className="mt-1 text-2xl font-bold text-white"><AnimatedCounter value={28} /></p>
                  <p className="mt-1 text-sm font-medium text-success">+2 today</p>
                </div>
              </div>

              {/* Mini Chart with Animation */}
              <div className="mt-6">
                <div className="flex items-end gap-1 h-20">
                  {[40, 55, 45, 60, 50, 70, 65, 80, 75, 90, 85, 95].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gold/60 transition-all duration-500 hover:bg-gold cursor-pointer"
                      style={{
                        height: `${height}%`,
                        animation: `slide-up 0.5s ease-out ${i * 0.05}s forwards`,
                        opacity: 0,
                      }}
                    />
                  ))}
                </div>
                <p className="mt-2 text-center text-xs text-white/50">DSE All Share Index - Last 12 months</p>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -right-4 -top-4 rounded-xl border border-gold/30 bg-navy p-3 shadow-lg lg:-right-8 lg:-top-8 animate-float glow-gold">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20">
                  <TrendingUp className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-white/60">Top Gainer</p>
                  <p className="font-semibold text-white">CRDB +3.45%</p>
                </div>
              </div>
            </div>
          </FadeInRight>
        </div>
      </div>
    </section>
  )
}
