"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import Link from "next/link"
import {
  Search,
  Star,
  Users,
  BookOpen,
  Award,
  MapPin,
  ArrowRight,
  Filter,
  GraduationCap,
  Briefcase,
  Globe,
  Shield,
  TrendingUp,
} from "lucide-react"

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "STOCK_MARKET", label: "Stock Market" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "BONDS_TREASURY", label: "Bonds & Treasury" },
  { value: "SACCO_INVESTMENT", label: "SACCO Investment" },
  { value: "FOREX_EDUCATION", label: "Forex Education" },
  { value: "MUTUAL_FUNDS", label: "Mutual Funds" },
  { value: "STARTUP_INVESTMENT", label: "Startup Investment" },
  { value: "PERSONAL_FINANCE", label: "Personal Finance" },
  { value: "SME_INVESTMENT", label: "SME Investment" },
]

interface Expert {
  id: string
  bio: string | null
  headline: string | null
  experienceYears: number
  rating: number
  totalReviews: number
  totalStudents: number
  hourlyRate: number
  currency: string
  location: string | null
  specializations: string[]
  isAvailableOnline: boolean
  isAvailablePhysical: boolean
  user: {
    id: string
    name: string
    avatar: string | null
  }
  _count: {
    courses: number
    bookings: number
  }
}

function getCategoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label || value.replace(/_/g, " ")
}

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")

  useEffect(() => {
    fetchExperts()
  }, [category])

  const fetchExperts = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set("category", category)
      if (search) params.set("search", search)

      const res = await fetch(`/api/experts?${params}`)
      const data = await res.json()
      if (Array.isArray(data)) setExperts(data)
    } catch (error) {
      console.error("Failed to fetch experts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchExperts()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative border-b border-border bg-navy py-20 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-navy" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
            <ScrollAnimation animation="slide-up" className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm text-gold">
                <Shield className="h-4 w-4" />
                Verified Investment Experts
              </div>
              <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl text-balance">
                Connect with Tanzania&apos;s Top Investment Experts
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/70">
                Book consultations, take courses, and get expert guidance on your investment journey.
                All experts are verified and vetted by YIF Capital.
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="mt-8 flex w-full max-w-xl gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search experts by name..."
                    className="h-12 border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40 focus:border-gold"
                  />
                </div>
                <Button type="submit" className="h-12 bg-gold text-navy hover:bg-gold/90 px-6">
                  Search
                </Button>
              </form>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gold" />
                  <span>Verified Professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gold" />
                  <span>Online & In-person</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gold" />
                  <span>Courses Available</span>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Category Filter */}
        <section className="border-b border-border bg-muted/30 py-4">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    category === cat.value
                      ? "bg-gold text-navy"
                      : "bg-card border border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Expert Grid */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-muted" />
                          <div className="h-3 w-1/2 rounded bg-muted" />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="h-3 w-full rounded bg-muted" />
                        <div className="h-3 w-2/3 rounded bg-muted" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : experts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <GraduationCap className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold text-foreground">No Experts Found</h3>
                <p className="mt-2 text-muted-foreground max-w-md">
                  {search || category
                    ? "Try adjusting your search or filter criteria."
                    : "Investment experts will appear here once verified by the admin team."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {experts.map((expert, index) => (
                  <ScrollAnimation key={expert.id} animation="slide-up" delay={index * 50}>
                    <Card className="group overflow-hidden transition-all hover:border-gold/50 hover:shadow-lg hover:-translate-y-1">
                      <CardContent className="p-6">
                        {/* Profile Header */}
                        <div className="flex items-start gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold font-bold text-xl shrink-0">
                            {expert.user.avatar ? (
                              <img
                                src={expert.user.avatar}
                                alt={expert.user.name}
                                className="h-16 w-16 rounded-full object-cover"
                              />
                            ) : (
                              expert.user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">{expert.user.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {expert.headline || "Investment Expert"}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                                <span className="text-sm font-medium">{expert.rating.toFixed(1)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                ({expert.totalReviews} reviews)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        {expert.bio && (
                          <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{expert.bio}</p>
                        )}

                        {/* Specializations */}
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {expert.specializations.slice(0, 3).map((spec) => (
                            <Badge
                              key={spec}
                              variant="secondary"
                              className="text-[10px] font-medium"
                            >
                              {getCategoryLabel(spec)}
                            </Badge>
                          ))}
                          {expert.specializations.length > 3 && (
                            <Badge variant="secondary" className="text-[10px]">
                              +{expert.specializations.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-foreground">{expert.experienceYears}</div>
                            <div className="text-[10px] text-muted-foreground">Years Exp</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-foreground">{expert._count.courses}</div>
                            <div className="text-[10px] text-muted-foreground">Courses</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-foreground">{expert.totalStudents}</div>
                            <div className="text-[10px] text-muted-foreground">Students</div>
                          </div>
                        </div>

                        {/* Price + CTA */}
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            {expert.hourlyRate > 0 && (
                              <span className="text-sm font-semibold text-gold">
                                {expert.currency} {expert.hourlyRate.toLocaleString()}/hr
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              {expert.isAvailableOnline && (
                                <span className="flex items-center gap-0.5">
                                  <Globe className="h-3 w-3" /> Online
                                </span>
                              )}
                              {expert.isAvailablePhysical && (
                                <span className="flex items-center gap-0.5 ml-2">
                                  <MapPin className="h-3 w-3" /> In-person
                                </span>
                              )}
                            </div>
                          </div>
                          <Button asChild size="sm" className="bg-gold text-navy hover:bg-gold/90">
                            <Link href={`/experts/${expert.id}`}>
                              View Profile
                              <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollAnimation>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-navy">
          <div className="mx-auto max-w-7xl px-4 lg:px-8 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gold" />
            <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
              Are You an Investment Expert?
            </h2>
            <p className="mt-4 text-white/70 max-w-xl mx-auto">
              Join our platform and share your expertise with thousands of Tanzanian investors.
              Teach courses, offer consultations, and grow your practice.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-gold text-navy hover:bg-gold/90">
                <Link href="/contact">
                  Apply as Expert
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                <Link href="/academy">Browse Courses</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
