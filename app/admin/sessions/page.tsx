"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Plus,
    Search,
    Calendar,
    Video,
    VideoOff,
    MoreVertical,
    Edit2,
    DollarSign,
    Trash2,
    Users,
    Settings,
    ShieldAlert
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"

interface LiveSession {
    id: string
    courseId: string
    title: string
    shortDescription: string | null
    description: string | null
    meetingUrl: string | null
    recordingUrl: string | null
    scheduledStart: string
    scheduledEnd: string
    status: "scheduled" | "live" | "ended" | "cancelled"
    price: number
    currency: string
    isFree: boolean
    _count?: {
        payments: number
    }
}

export default function AdminSessionsPage() {
    const [sessions, setSessions] = useState<LiveSession[]>([])
    const [isAddingSession, setIsAddingSession] = useState(false)
    const [isDeletingSession, setIsDeletingSession] = useState(false)
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
    const [editingSession, setEditingSession] = useState<LiveSession | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        shortDescription: "",
        description: "",
        courseId: "",
        meetingUrl: "",
        recordingUrl: "",
        scheduledStart: "",
        scheduledEnd: "",
        price: 0,
        currency: "TZS",
        isFree: true,
        status: "scheduled" as "scheduled" | "live" | "ended" | "cancelled"
    })

    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/sessions')
            const data = await res.json()
            if (Array.isArray(data)) {
                setSessions(data)
            }
        } catch (error) {
            toast.error("Failed to load sessions")
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            title: "",
            shortDescription: "",
            description: "",
            courseId: "",
            meetingUrl: "",
            recordingUrl: "",
            scheduledStart: "",
            scheduledEnd: "",
            price: 0,
            currency: "TZS",
            isFree: true,
            status: "scheduled"
        })
        setEditingSession(null)
    }

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault()
        toast.loading("Creating session...", { id: "session-action" })

        try {
            const dataToSend = {
                ...formData,
                scheduledStart: new Date(formData.scheduledStart).toISOString(),
                scheduledEnd: new Date(formData.scheduledEnd).toISOString(),
            }

            const res = await fetch('/api/admin/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            })

            if (res.ok) {
                const newSession = await res.json()
                setSessions([newSession, ...sessions])
                setIsAddingSession(false)
                resetForm()
                toast.success("Live session scheduled and secured!", { id: "session-action" })
            } else {
                toast.error("Failed to create session", { id: "session-action" })
            }
        } catch (error) {
            toast.error("Network error", { id: "session-action" })
        }
    }

    const handleUpdateSession = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingSession) return

        toast.loading("Updating session...", { id: "session-action" })
        console.log("Saving updated session data:", formData)

        try {
            const dataToSend = {
                ...formData,
                scheduledStart: new Date(formData.scheduledStart).toISOString(),
                scheduledEnd: new Date(formData.scheduledEnd).toISOString(),
            }

            const res = await fetch(`/api/admin/sessions/${editingSession.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            })

            if (res.ok) {
                const updatedSession = await res.json()
                console.log("Updated session response:", updatedSession)
                setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s))
                setIsAddingSession(false)
                resetForm()
                toast.success("Live session updated!", { id: "session-action" })
            } else {
                const err = await res.json()
                console.error("Update failed:", err)
                toast.error(`Update failed: ${err.error || 'Server error'}`, { id: "session-action" })
            }
        } catch (error) {
            console.error("Network error during update:", error)
            toast.error("Network error", { id: "session-action" })
        }
    }

    const handleDeleteSession = async () => {
        if (!sessionToDelete) return

        toast.loading("Deleting session...", { id: "delete-session" })

        try {
            const res = await fetch(`/api/admin/sessions/${sessionToDelete}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                setSessions(sessions.filter(s => s.id !== sessionToDelete))
                setIsDeletingSession(false)
                setSessionToDelete(null)
                toast.success("Session deleted successfully", { id: "delete-session" })
            } else {
                toast.error("Failed to delete session", { id: "delete-session" })
            }
        } catch (error) {
            toast.error("Network error", { id: "delete-session" })
        }
    }

    const openEditModal = (session: LiveSession) => {
        setEditingSession(session)
        const start = session.scheduledStart ? new Date(session.scheduledStart) : new Date()
        const end = session.scheduledEnd ? new Date(session.scheduledEnd) : new Date()

        setFormData({
            title: session.title,
            shortDescription: session.shortDescription || "",
            description: session.description || "",
            courseId: session.courseId,
            meetingUrl: session.meetingUrl || "",
            recordingUrl: session.recordingUrl || "",
            scheduledStart: start.toISOString().slice(0, 16),
            scheduledEnd: end.toISOString().slice(0, 16),
            price: session.price,
            currency: session.currency,
            isFree: session.isFree,
            status: session.status
        })
        setIsAddingSession(true)
    }

    const filteredSessions = sessions.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.courseId.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Live Session Management</h1>
                    <p className="text-muted-foreground">Schedule and manage secure live classes.</p>
                </div>
                <Button onClick={() => { resetForm(); setIsAddingSession(true) }} className="bg-gold text-navy hover:bg-gold/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Session
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search sessions by title or course ID..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline">
                            <Calendar className="mr-2 h-4 w-4" />
                            Filter by Date
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Session Info</th>
                                    <th className="px-4 py-3 text-left font-medium">Scheduled Time</th>
                                    <th className="px-4 py-3 text-left font-medium">Price</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Participants</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredSessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">{session.title}</span>
                                                <span className="text-[10px] font-bold text-gold uppercase tracking-wider">{session.courseId}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col text-xs">
                                                <span>{format(new Date(session.scheduledStart), "MMM d, yyyy")}</span>
                                                <span className="text-muted-foreground">
                                                    {format(new Date(session.scheduledStart), "HH:mm")} - {format(new Date(session.scheduledEnd), "HH:mm")}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {session.isFree ? (
                                                <Badge variant="outline" className="text-success border-success/30 bg-success/5">Free</Badge>
                                            ) : (
                                                <div className="flex flex-col text-xs font-medium">
                                                    <span>{session.currency} {session.price.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={session.status} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>{session._count?.payments || 0} Enrolled</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => openEditModal(session)}>
                                                        <Edit2 className="mr-2 h-4 w-4" />
                                                        Edit Session
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Video className="mr-2 h-4 w-4" />
                                                        Manage Room
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <ShieldAlert className="mr-2 h-4 w-4 text-gold" />
                                                        View Access logs
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="cursor-pointer text-error"
                                                        onClick={() => {
                                                            setSessionToDelete(session.id)
                                                            setIsDeletingSession(true)
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Session Dialog */}
            <Dialog open={isAddingSession} onOpenChange={(open) => {
                if (!open) {
                    setIsAddingSession(false)
                    resetForm()
                } else {
                    setIsAddingSession(true)
                }
            }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingSession ? "Edit Secure Live Session" : "Schedule Secure Live Session"}</DialogTitle>
                        <DialogDescription>
                            This session will be protected by payment-verified enrollment and single-use tokens.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={editingSession ? handleUpdateSession : handleCreateSession} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">Session Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Fundamental Analysis Workshop"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="courseId">Course ID</Label>
                                <Input
                                    id="courseId"
                                    placeholder="e.g. technical-analysis"
                                    value={formData.courseId}
                                    onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shortDescription">Short Description (for simple view)</Label>
                            <Input
                                id="shortDescription"
                                placeholder="A brief one-sentence summary"
                                value={formData.shortDescription}
                                onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Full Session description</Label>
                            <Textarea
                                id="description"
                                placeholder="What will students learn in this session?"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meetingUrl">Internal Meeting URL (BBB/Zoom/Teams)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="meetingUrl"
                                    placeholder="https://meet.yifcapital.co.tz/rooms/..."
                                    value={formData.meetingUrl}
                                    onChange={e => setFormData({ ...formData, meetingUrl: e.target.value })}
                                    required
                                />
                                <Button type="button" variant="outline" size="icon">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                This URL is NEVER shared with students directly. They only receive a temporary token.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3 border-t pt-4">
                            <div className="flex items-center space-x-2 pt-8">
                                <input
                                    type="checkbox"
                                    id="isFree"
                                    className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
                                    checked={formData.isFree}
                                    onChange={e => setFormData({ ...formData, isFree: e.target.checked })}
                                />
                                <Label htmlFor="isFree" className="cursor-pointer">Mark as Free</Label>
                            </div>

                            {!formData.isFree && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="price"
                                                type="number"
                                                className="pl-9"
                                                placeholder="0"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                                required={!formData.isFree}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currency">Currency</Label>
                                        <select
                                            id="currency"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.currency}
                                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                        >
                                            <option value="TZS">TZS</option>
                                            <option value="USD">USD</option>
                                            <option value="KES">KES</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="start">Scheduled Start</Label>
                                <Input
                                    id="start"
                                    type="datetime-local"
                                    value={formData.scheduledStart}
                                    onChange={e => setFormData({ ...formData, scheduledStart: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end">Scheduled End</Label>
                                <Input
                                    id="end"
                                    type="datetime-local"
                                    value={formData.scheduledEnd}
                                    onChange={e => setFormData({ ...formData, scheduledEnd: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {editingSession && (
                            <div className="space-y-2">
                                <Label htmlFor="status">Session Status</Label>
                                <select
                                    id="status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="scheduled">Scheduled</option>
                                    <option value="live">Live Now</option>
                                    <option value="ended">Ended</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="recordingUrl">Recording URL (YouTube/Drive/etc.)</Label>
                            <Input
                                id="recordingUrl"
                                placeholder="https://youtube.com/watch?v=... or any recording link"
                                value={formData.recordingUrl}
                                onChange={e => setFormData({ ...formData, recordingUrl: e.target.value })}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Add a recording link after the session ends. This will be shown to users on the Recording tab.
                            </p>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsAddingSession(false); resetForm() }}>Cancel</Button>
                            <Button type="submit" className="bg-gold text-navy hover:bg-gold/90">
                                {editingSession ? "Update Session" : "Create & Secure Session"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeletingSession} onOpenChange={setIsDeletingSession}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Session</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this session? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeletingSession(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteSession}>Delete Permanently</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "live":
            return <Badge className="bg-red-500 animate-pulse">LIVE NOW</Badge>
        case "scheduled":
            return <Badge variant="outline" className="border-gold text-gold">SCHEDULED</Badge>
        case "ended":
            return <Badge variant="secondary">ENDED</Badge>
        case "cancelled":
            return <Badge variant="destructive">CANCELLED</Badge>
        default:
            return <Badge>{status}</Badge>
    }
}
