"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import Link from "next/link"
import {
  Star,
  Users,
  BookOpen,
  Award,
  MapPin,
  ArrowRight,
  Globe,
  Clock,
  Calendar,
  Video,
  Briefcase,
  CheckCircle,
  GraduationCap,
} from "lucide-react"

const CATEGORY_LABELS: Record<string, string> = {
  STOCK_MARKET: "Stock Market Investing",
  BONDS_FIXED_INCOME: "Bond & Fixed Income Investing",
  MUTUAL_FUNDS: "Mutual Funds Investing",
  PERSONAL_FINANCE: "Personal Finance",
  REAL_ESTATE_ALT: "Real Estate & Alternative Investments",
  ENTREPRENEURSHIP_BUSINESS: "Entrepreneurship & Business Finance",
  INSURANCE_RISK: "Insurance & Risk Management",
  SACCOS_COOPERATIVE: "SACCOs & Cooperative Finance",
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

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
  languages: string[]
  specializations: string[]
  isAvailableOnline: boolean
  isAvailablePhysical: boolean
  physicalAddress: string | null
  user: { id: string; name: string; avatar: string | null }
  courses: any[]
  availability: { dayOfWeek: number; startTime: string; endTime: string }[]
  _count: { bookings: number }
}

export default function ExpertProfilePage() {
  const params = useParams()
  const expertId = params.expertId as string
  const [expert, setExpert] = useState<Expert | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/experts/${expertId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setExpert(data)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [expertId])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!expert) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center">
          <GraduationCap className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold">Expert Not Found</h2>
          <p className="text-muted-foreground mt-2">This expert profile doesn&apos;t exist or has been removed.</p>
          <Button asChild className="mt-6 bg-gold text-navy hover:bg-gold/90">
            <Link href="/experts">Browse Experts</Link>
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-navy py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <ScrollAnimation animation="slide-up">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                {/* Avatar */}
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gold/20 text-gold text-4xl font-bold ring-4 ring-gold/30 shrink-0">
                  {expert.user.avatar ? (
                    <img src={expert.user.avatar} alt={expert.user.name} className="h-28 w-28 rounded-full object-cover" />
                  ) : (
                    expert.user.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h1 className="text-3xl font-bold text-white">{expert.user.name}</h1>
                    <Badge className="bg-gold/20 text-gold border-gold/30">
                      <CheckCircle className="mr-1 h-3 w-3" /> Verified Expert
                    </Badge>
                  </div>
                  <p className="mt-2 text-lg text-white/70">{expert.headline || "Investment Expert"}</p>

                  <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      <span className="font-medium text-white">{expert.rating.toFixed(1)}</span>
                      <span>({expert.totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gold" />
                      <span>{expert.totalStudents} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-gold" />
                      <span>{expert.experienceYears} years experience</span>
                    </div>
                    {expert.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gold" />
                        <span>{expert.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {expert.specializations.map((spec) => (
                      <Badge key={spec} variant="outline" className="border-white/20 text-white/80 text-xs">
                        {CATEGORY_LABELS[spec] || spec}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                    <Button asChild className="bg-gold text-navy hover:bg-gold/90">
                      <Link href={`/book/${expert.id}`}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Consultation
                      </Link>
                    </Button>
                    {expert.hourlyRate > 0 && (
                      <div className="flex items-center rounded-lg border border-white/20 px-4 py-2 text-white">
                        <span className="text-sm text-white/60 mr-2">From</span>
                        <span className="font-bold text-gold">
                          {expert.currency} {expert.hourlyRate.toLocaleString()}/hr
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Content Tabs */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted">
                <TabsTrigger value="about" className="data-[state=active]:bg-gold data-[state=active]:text-navy">About</TabsTrigger>
                <TabsTrigger value="courses" className="data-[state=active]:bg-gold data-[state=active]:text-navy">
                  Courses ({expert.courses.length})
                </TabsTrigger>
                <TabsTrigger value="availability" className="data-[state=active]:bg-gold data-[state=active]:text-navy">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-8">
                <div className="grid gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>About</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {expert.bio || "This expert hasn't added a bio yet."}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Quick Info</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-gold" />
                          <div>
                            <div className="text-sm font-medium">{expert.experienceYears}+ Years</div>
                            <div className="text-xs text-muted-foreground">Experience</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-gold" />
                          <div>
                            <div className="text-sm font-medium">{expert.courses.length} Courses</div>
                            <div className="text-xs text-muted-foreground">Published</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Video className="h-5 w-5 text-gold" />
                          <div>
                            <div className="text-sm font-medium">{expert._count.bookings} Sessions</div>
                            <div className="text-xs text-muted-foreground">Completed</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-gold" />
                          <div>
                            <div className="text-sm font-medium">{expert.languages.join(", ")}</div>
                            <div className="text-xs text-muted-foreground">Languages</div>
                          </div>
                        </div>
                        {expert.isAvailableOnline && (
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                            <span className="text-sm text-success font-medium">Available Online</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="courses" className="mt-8">
                {expert.courses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="font-semibold text-lg">No Courses Yet</h3>
                    <p className="text-muted-foreground mt-1">This expert hasn&apos;t published any courses yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {expert.courses.map((course: any) => (
                      <Card key={course.id} className="overflow-hidden transition-all hover:border-gold/50 hover:shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold shrink-0">
                              <BookOpen className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground">{course.title}</h3>
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                {course.shortDescription || course.description}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <Badge variant="secondary">{CATEGORY_LABELS[course.category] || course.category}</Badge>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {course.totalDuration}m
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5" /> {course.totalLessons} lessons
                            </span>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="font-semibold text-gold">
                              {course.isFree ? "Free" : `${course.currency} ${course.price.toLocaleString()}`}
                            </span>
                            <Button asChild size="sm" className="bg-gold text-navy hover:bg-gold/90">
                              <Link href={`/courses/${course.slug}`}>
                                View Course <ArrowRight className="ml-1 h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="availability" className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Availability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {expert.availability.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No availability set yet. Contact the expert for scheduling.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {expert.availability.map((slot, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                            <span className="font-medium">{DAY_NAMES[slot.dayOfWeek]}</span>
                            <Badge variant="outline" className="text-gold border-gold/30">
                              {slot.startTime} - {slot.endTime}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button asChild className="w-full mt-6 bg-gold text-navy hover:bg-gold/90">
                      <Link href={`/book/${expert.id}`}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Book a Session
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
