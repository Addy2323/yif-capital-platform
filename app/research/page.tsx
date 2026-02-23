"use client"

import { AuthProvider } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FileText, Download, Lock, Clock, TrendingUp, Building2, Landmark, Globe } from "lucide-react"

const reports = [
  {
    id: 1,
    title: "Tanzania Market Outlook 2026",
    description: "Comprehensive analysis of the Tanzanian capital markets with forecasts for the coming year.",
    category: "Market Analysis",
    date: "Jan 15, 2026",
    pages: 45,
    premium: true,
    icon: TrendingUp,
  },
  {
    id: 2,
    title: "Banking Sector Review Q4 2025",
    description: "In-depth review of listed banks including CRDB, NMB, and DCB with financial metrics.",
    category: "Sector Report",
    date: "Jan 10, 2026",
    pages: 32,
    premium: true,
    icon: Building2,
  },
  {
    id: 3,
    title: "DSE Monthly Bulletin - January 2026",
    description: "Monthly summary of DSE trading activity, top performers, and market statistics.",
    category: "Market Update",
    date: "Jan 5, 2026",
    pages: 12,
    premium: false,
    icon: Landmark,
  },
  {
    id: 4,
    title: "East African Markets Comparison",
    description: "Comparative analysis of stock exchanges in Tanzania, Kenya, Uganda, and Rwanda.",
    category: "Regional Analysis",
    date: "Dec 20, 2025",
    pages: 28,
    premium: true,
    icon: Globe,
  },
  {
    id: 5,
    title: "Introduction to DSE Investing",
    description: "Beginner's guide to investing in the Dar es Salaam Stock Exchange.",
    category: "Educational",
    date: "Dec 15, 2025",
    pages: 18,
    premium: false,
    icon: FileText,
  },
  {
    id: 6,
    title: "Telecommunications Sector Deep Dive",
    description: "Analysis of TTCL, Vodacom Tanzania, and the telecom industry outlook.",
    category: "Sector Report",
    date: "Dec 10, 2025",
    pages: 35,
    premium: true,
    icon: TrendingUp,
  },
]

function ResearchContent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-navy py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white lg:text-5xl text-balance">
                Research & Insights
              </h1>
              <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto text-pretty">
                Access professional-grade research reports, market analysis, and investment insights from our team of experts.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Report */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <Card className="overflow-hidden border-0 bg-gradient-to-r from-navy to-navy-light text-white shadow-xl">
              <div className="grid lg:grid-cols-2">
                <CardHeader className="p-8 lg:p-12">
                  <Badge className="w-fit bg-gold text-navy">Featured Report</Badge>
                  <CardTitle className="mt-4 text-2xl lg:text-3xl text-white">
                    Tanzania Market Outlook 2026
                  </CardTitle>
                  <CardDescription className="mt-4 text-white/70 text-base">
                    Our flagship annual report covering macroeconomic trends, sector analysis,
                    stock picks, and investment strategies for the year ahead.
                  </CardDescription>
                  <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Jan 15, 2026
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      45 pages
                    </span>
                  </div>
                  <div className="mt-8 flex gap-4">
                    <Button className="bg-gold text-navy hover:bg-gold/90">
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                      View Summary
                    </Button>
                  </div>
                </CardHeader>
                <div className="hidden lg:flex items-center justify-center p-8">
                  <div className="h-64 w-48 rounded-lg bg-white/10 flex items-center justify-center">
                    <FileText className="h-24 w-24 text-gold" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Reports Grid */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Latest Reports</h2>
                <p className="mt-1 text-muted-foreground">Browse our collection of research and analysis</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="bg-transparent">All</Button>
                <Button variant="ghost" size="sm">Market Analysis</Button>
                <Button variant="ghost" size="sm">Sector Reports</Button>
                <Button variant="ghost" size="sm">Educational</Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <Card key={report.id} className="group relative overflow-hidden transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10">
                        <report.icon className="h-6 w-6 text-gold" />
                      </div>
                      {report.premium && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-4 text-lg">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {report.date}
                      </span>
                      <span>{report.pages} pages</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {report.premium ? (
                        <Button asChild className="w-full bg-gold text-navy hover:bg-gold/90">
                          <Link href="/contact">Inquire About Access</Link>
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full bg-transparent">
                          <Download className="mr-2 h-4 w-4" />
                          Download Free
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted py-16">
          <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
            <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
              Want Full Access to All Reports?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Upgrade to YIF Pro and get unlimited access to all research reports,
              real-time market data, and advanced analytics tools.
            </p>
            <Button asChild className="mt-8 bg-gold text-navy hover:bg-gold/90">
              <Link href="/contact">Inquire About Pro</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default function ResearchPage() {
  return (
    <ResearchContent />
  )
}
