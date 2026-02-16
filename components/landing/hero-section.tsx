"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import { Typewriter } from "@/components/ui/typewriter"

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
        <ScrollAnimation animation="slide-up" duration={800}>
          <div className="text-center">
            <h1 className="hero-title text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl text-balance leading-tight">
              Empowering Your <br className="hidden sm:block" />
              <Typewriter
                phrases={["Financial Future", "Investment Journey", "Wealth Creation"]}
                className="text-white"
              /> <br className="hidden sm:block" />
              with <span className="text-gradient-gold">YIF Capital</span>
            </h1>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  )
}
