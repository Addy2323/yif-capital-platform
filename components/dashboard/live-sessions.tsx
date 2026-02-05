"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, Clock, Calendar, ExternalLink, ShieldCheck, AlertCircle, DollarSign, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { format } from "date-fns"

interface Session {
    id: string
    title: string
    description: string | null
    scheduledStart: string
    scheduledEnd: string
    status: "scheduled" | "live" | "ended" | "cancelled"
    courseId: string
    courseName?: string
    price: number
    currency: string
    isFree: boolean
}

export function LiveSessionsDashboard({ courseId }: { courseId?: string }) {
    const { user } = useAuth()
    const router = useRouter()
    const [sessions, setSessions] = useState<Session[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [refreshInterval, setRefreshInterval] = useState(60000) // Default 60s

    const fetchSessions = async () => {
        try {
            const res = await fetch(`/api/sessions?courseId=${courseId || ''}`)
            const data = await res.json()

            if (Array.isArray(data)) {
                setSessions(data)
            }
        } catch (error) {
            console.error("Failed to fetch sessions:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSessions()
        const interval = setInterval(fetchSessions, refreshInterval)
        return () => clearInterval(interval)
    }, [courseId, refreshInterval])

    const handleGoLive = async (sessionId: string) => {
        if (!user) {
            toast.error("Please log in to join live sessions")
            return
        }

        // Find the session to check if it's free or paid
        const session = sessions.find(s => s.id === sessionId)
        if (!session) {
            toast.error("Session not found")
            return
        }

        // For paid sessions, redirect to session-specific payment page
        if (!session.isFree) {
            router.push(`/sessions/${sessionId}/payment`)
            return
        }

        // For free sessions, try to access the session
        toast.loading("Securing your connection...", { id: "go-live" })

        try {
            const response = await fetch(`/api/sessions/${sessionId}/access`)
            const data = await response.json()

            if (!response.ok) {
                toast.error(data.message || "Access denied", { id: "go-live" })
                return
            }

            toast.success("Connection secured! Redirecting to live class...", { id: "go-live" })

            setTimeout(() => {
                window.location.href = data.redirectUrl
            }, 1500)

        } catch (error) {
            toast.error("Connection failed. Please try again.", { id: "go-live" })
        }
    }

    const liveSessions = sessions.filter(s => {
        const start = new Date(s.scheduledStart).getTime()
        const end = new Date(s.scheduledEnd).getTime()
        const now = Date.now()
        return now >= start - 30 * 60 * 1000 && now <= end
    })

    const upcomingSessions = sessions.filter(s => {
        const start = new Date(s.scheduledStart).getTime()
        return start > Date.now() + 30 * 60 * 1000
    })

    const pastSessions = sessions.filter(s => {
        const end = new Date(s.scheduledEnd).getTime()
        return end < Date.now()
    })

    return (
        <Card className="w-full border-gold/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="rounded-full bg-gold/10 p-2">
                        <Video className="h-5 w-5 text-gold" />
                    </div>
                    <CardTitle className="text-xl">Interactive Live Sessions</CardTitle>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Auto-refreshing in 60s
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="live" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-navy/5">
                        <TabsTrigger value="live" className="data-[state=active]:bg-gold data-[state=active]:text-navy">
                            Live Now
                            {liveSessions.length > 0 && (
                                <span className="ml-2 flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="upcoming" className="data-[state=active]:bg-gold data-[state=active]:text-navy">
                            Upcoming
                        </TabsTrigger>
                        <TabsTrigger value="past" className="data-[state=active]:bg-gold data-[state=active]:text-navy">
                            Recording
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="live" className="mt-4 space-y-4">
                        {liveSessions.length === 0 ? (
                            <EmptyState message="No live sessions at the moment" />
                        ) : (
                            liveSessions.map(session => (
                                <SessionItem
                                    key={session.id}
                                    session={session}
                                    onJoin={() => handleGoLive(session.id)}
                                    isLive={true}
                                />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="upcoming" className="mt-4 space-y-4">
                        {upcomingSessions.length === 0 ? (
                            <EmptyState message="No upcoming sessions scheduled" />
                        ) : (
                            upcomingSessions.map(session => (
                                <SessionItem
                                    key={session.id}
                                    session={session}
                                    onJoin={() => handleGoLive(session.id)}
                                    isLive={false}
                                />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="mt-4 space-y-4">
                        {pastSessions.length === 0 ? (
                            <EmptyState message="No past sessions found" />
                        ) : (
                            pastSessions.map(session => (
                                <SessionItem
                                    key={session.id}
                                    session={session}
                                    onJoin={() => handleGoLive(session.id)}
                                    isLive={false}
                                    isPast={true}
                                />
                            ))
                        )}
                    </TabsContent>
                </Tabs>

                <div className="mt-6 rounded-lg bg-navy/5 p-4 border border-gold/10">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-1 h-5 w-5 text-gold" />
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">Security Protocol Active</h4>
                            <p className="text-xs text-muted-foreground">
                                All meeting links are single-use and device-bound.
                                Attempting to share links or join from multiple devices will result in account suspension.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function SessionItem({
    session,
    onJoin,
    isLive,
    isPast
}: {
    session: Session,
    onJoin?: () => void,
    isLive: boolean,
    isPast?: boolean
}) {
    const startTime = new Date(session.scheduledStart)
    const isActuallyLive = Date.now() >= startTime.getTime()

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-gold/30">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    {session.courseName && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                            {session.courseName}
                        </span>
                    )}
                    <h3 className="font-semibold">{session.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{session.description}</p>
                </div>
                {isActuallyLive ? (
                    <Badge className="bg-red-500 hover:bg-red-600">LIVE</Badge>
                ) : isLive ? (
                    <Badge variant="outline" className="border-gold text-gold">STARTING SOON</Badge>
                ) : isPast ? (
                    <Badge variant="secondary">ENDED</Badge>
                ) : (
                    <Badge variant="outline">SCHEDULED</Badge>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gold" />
                    {format(new Date(session.scheduledStart), "EEE, MMM do")}
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gold" />
                    {format(new Date(session.scheduledStart), "HH:mm")} - {format(new Date(session.scheduledEnd), "HH:mm")}
                </div>
                {!session.isFree && (
                    <div className="flex items-center gap-1.5 font-semibold text-gold">
                        <DollarSign className="h-3.5 w-3.5" />
                        {session.currency} {session.price.toLocaleString()}
                    </div>
                )}
            </div>

            {!isPast && (
                <Button
                    onClick={onJoin}
                    disabled={!isLive && session.isFree}
                    className={`w-full ${isLive || !session.isFree ? 'bg-gold text-navy hover:bg-gold/90' : 'bg-muted'}`}
                >
                    {isLive ? (
                        <>
                            Click to Go Live
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </>
                    ) : !session.isFree ? (
                        <>
                            Pay to Reserve Seat ({session.currency} {session.price.toLocaleString()})
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    ) : (
                        <>
                            Go Live (Opens 30m before)
                            <Clock className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            )}

            {isPast && (
                <Button variant="outline" className="w-full border-gold/20 text-gold hover:bg-gold/5">
                    Watch Recording
                </Button>
            )}
        </div>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">{message}</p>
        </div>
    )
}
