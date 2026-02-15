"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { FadeIn, FadeInLeft, FadeInRight, AnimatedCounter } from "@/components/ui/animated"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

export function HeroSection() {
  return (
    <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden bg-navy">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/logo%20payment/background/academy.png"
          alt="Wealth Background"
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-navy/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <ScrollAnimation animation="slide-up">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl">
              Empowering Your Financial <br />
              Future with <span className="text-gold">YIF Capital</span>
            </h1>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  )
}
