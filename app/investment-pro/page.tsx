"use client"

import { AuthProvider } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  Briefcase,
  PieChart,
  Shield,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Wallet,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

const features = [
  {
    icon: PieChart,
    title: "Portfolio Management",
    description: "Build and manage diversified portfolios with real-time tracking and performance analytics.",
  },
  {
    icon: Target,
    title: "Goal-Based Investing",
    description: "Set financial goals and track progress with personalized investment strategies.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Access professional-grade analytics, risk metrics, and portfolio optimization tools.",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Comprehensive risk profiling and portfolio stress testing capabilities.",
  },
  {
    icon: Users,
    title: "Advisory Services",
    description: "Connect with certified investment advisors for personalized guidance.",
  },
  {
    icon: Wallet,
    title: "Multi-Asset Support",
    description: "Invest across stocks, bonds, mutual funds, and government securities.",
  },
]

const benefits = [
  "Real-time portfolio valuation",
  "Automated dividend tracking",
  "Tax optimization reports",
  "Performance benchmarking",
  "Custom alerts and notifications",
  "Dedicated relationship manager",
]

function InvestmentProContent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-navy py-20 lg:py-32">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/logo%20payment/background/Professional%20Portfolio%20Management.png"
              alt="Background"
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-navy/60" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <ScrollAnimation animation="slide-right">
                <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2 text-sm text-gold">
                  <Briefcase className="h-4 w-4" />
                  YIF Investment Pro
                </div>
                <h1 className="mt-6 text-4xl font-bold text-white lg:text-5xl text-balance">
                  Professional Portfolio Management
                </h1>
                <p className="mt-6 text-lg text-white/70 leading-relaxed text-pretty">
                  Take control of your investments with our comprehensive portfolio management platform.
                  Built for serious investors who demand professional-grade tools and insights.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button asChild className="bg-gold text-navy hover:bg-gold/90">
                    <Link href="/register?plan=pro">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                    <Link href="/contact">Inquire About Pro</Link>
                  </Button>
                </div>
              </ScrollAnimation>
              <ScrollAnimation animation="slide-left" className="hidden lg:block">
                <Card className="border-0 bg-white/5 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Portfolio Value</span>
                        <span className="text-2xl font-bold text-white">TZS 125.4M</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-full w-3/4 rounded-full bg-gold" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="text-center">
                          <div className="text-sm text-white/70">Return</div>
                          <div className="text-lg font-semibold text-green-400">+18.5%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-white/70">Holdings</div>
                          <div className="text-lg font-semibold text-white">12</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-white/70">Risk</div>
                          <div className="text-lg font-semibold text-gold">Medium</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
                Everything You Need to Invest Smarter
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional tools and features designed for the modern Tanzanian investor.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <ScrollAnimation key={feature.title} animation="slide-up" delay={index * 100}>
                  <Card className="border-0 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10">
                        <feature.icon className="h-6 w-6 text-gold" />
                      </div>
                      <CardTitle className="mt-4">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-muted py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
                  Why Choose YIF Investment Pro?
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Join thousands of investors who trust YIF Capital for their portfolio management needs.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-gold" />
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Ready to Get Started?</CardTitle>
                  <CardDescription>
                    Create your account and start building your investment portfolio today.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Pro Plan</div>
                        <div className="text-sm text-muted-foreground">Full access to all features</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">$49</div>
                        <div className="text-sm text-muted-foreground">/month</div>
                      </div>
                    </div>
                  </div>
                  <Button asChild className="w-full bg-gold text-navy hover:bg-gold/90">
                    <Link href="/contact">
                      Inquire About Pro
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    No credit card required. Cancel anytime.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
            <TrendingUp className="mx-auto h-12 w-12 text-gold" />
            <h2 className="mt-6 text-3xl font-bold text-foreground lg:text-4xl">
              Start Your Investment Journey Today
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join the growing community of smart investors using YIF Investment Pro.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-gold text-navy hover:bg-gold/90">
                <Link href="/register">Create Free Account</Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default function InvestmentProPage() {
  return (
    <AuthProvider>
      <InvestmentProContent />
    </AuthProvider>
  )
}
