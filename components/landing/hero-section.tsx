"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { FadeIn, FadeInLeft, FadeInRight, AnimatedCounter } from "@/components/ui/animated"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] sm:min-h-[700px] flex items-center justify-center overflow-hidden bg-navy">
      {/* Background Image with Overlay & Animation */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-0 animate-auto-zoom">
          <Image
            src="/logo%20payment/background/academy.png"
            alt="Wealth Background"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/40 to-navy" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="text-center space-y-8">
          <ScrollAnimation animation="slide-up" duration={800}>
            <h1 className="hero-title text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl text-balance leading-tight">
              Empowering Your Financial <br className="hidden sm:block" />
              Future with <span className="text-gradient-gold">YIF Capital</span>
            </h1>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-in" delay={400} duration={1000}>
            <p className="mx-auto max-w-2xl text-lg text-white/70 sm:text-xl lg:text-2xl text-pretty">
              Your gateway to comprehensive investment data, expert learning, and advanced portfolio tools.
            </p>
          </ScrollAnimation>

          <ScrollAnimation animation="zoom-in" delay={800} duration={600}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto bg-gold text-navy hover:bg-gold/90 h-14 px-8 text-lg font-bold transition-all hover:scale-105 active:scale-95 glow-gold">
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg bg-transparent transition-all hover:border-gold/50">
                <Link href="/analytics">Explore Analytics</Link>
              </Button>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  )
}
