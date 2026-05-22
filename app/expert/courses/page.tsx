"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    PlusCircle,
    BookOpen,
    Users,
    Clock,
    DollarSign,
    Edit,
    TrendingUp,
    FileText,
    ArrowRight,
    Check,
    Layers,
    ChevronDown,
    ChevronUp,
    ImageIcon,
    Video,
    FileUp,
    X,
    AlertCircle,
    UserCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth-context"

interface CourseData {
    id: string
    title: string
    slug: string
    category: string
    level: string
    price: number
    isFree: boolean
    status: string
    lessonsCount: number
    duration: number
    studentsCount: number
    rating: number
    createdAt: string
    instructorName: string
    instructorPhotoUrl?: string
    bannerUrl?: string
}


const CATEGORIES = [
    { value: "STOCK_MARKET", label: "Stock Market & DSE" },
    { value: "REAL_ESTATE", label: "Real Estate & Land" },
    { value: "BONDS_TREASURY", label: "Treasury Bonds & Bills" },
    { value: "SACCO_INVESTMENT", label: "SACCOs & Microfinance" },
    { value: "FOREX_EDUCATION", label: "Forex & Currency Education" },
    { value: "MUTUAL_FUNDS", label: "Mutual Funds (UTT AMIS)" },
    { value: "STARTUP_INVESTMENT", label: "Startup & Angel Investing" },
    { value: "PERSONAL_FINANCE", label: "Personal Finance & Budgeting" },
    { value: "SME_INVESTMENT", label: "SME & Agribusiness Lending" }
]

const LEVELS = [
    { value: "BEGINNER", label: "Beginner" },
    { value: "INTERMEDIATE", label: "Intermediate" },
    { value: "ADVANCED", label: "Advanced" }
]

const CATEGORY_COLORS: Record<string, string> = {
    STOCK_MARKET: "from-emerald-900 to-slate-900",
    REAL_ESTATE: "from-amber-900 to-slate-900",
    BONDS_TREASURY: "from-blue-900 to-slate-900",
    SACCO_INVESTMENT: "from-purple-900 to-slate-900",
    FOREX_EDUCATION: "from-cyan-900 to-slate-900",
    MUTUAL_FUNDS: "from-rose-900 to-slate-900",
    STARTUP_INVESTMENT: "from-orange-900 to-slate-900",
    PERSONAL_FINANCE: "from-teal-900 to-slate-900",
    SME_INVESTMENT: "from-lime-900 to-slate-900",
}

const TOTAL_STEPS = 4
const STEP_LABELS = ["Course Info", "Curriculum", "Media & Uploads", "Pricing"]

export default function LmsCoursesPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [courses, setCourses] = useState<CourseData[]>([])
    const [isLoadingCourses, setIsLoadingCourses] = useState(true)
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

    // Local object-URL overrides for newly created courses (not persisted to DB)
    const [localBanners, setLocalBanners] = useState<Record<string, string>>({})
    const [localPhotos, setLocalPhotos] = useState<Record<string, string>>({})
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [createStep, setCreateStep] = useState(1)

    // Step 1
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [shortDescription, setShortDescription] = useState("")
    const [category, setCategory] = useState("STOCK_MARKET")
    const [level, setLevel] = useState("BEGINNER")

    // Step 2
    const [modulesCount, setModulesCount] = useState(3)
    const [lessonsCount, setLessonsCount] = useState(10)

    // Step 3 — uploads
    const [thumbnail, setThumbnail] = useState<File | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
    const [instructorPhoto, setInstructorPhoto] = useState<File | null>(null)
    const [instructorPhotoPreview, setInstructorPhotoPreview] = useState<string | null>(null)
    const [introVideo, setIntroVideo] = useState<File | null>(null)
    const [videoError, setVideoError] = useState("")
    const [documents, setDocuments] = useState<File[]>([])
    const thumbnailRef = useRef<HTMLInputElement>(null)
    const instructorPhotoRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLInputElement>(null)
    const docsRef = useRef<HTMLInputElement>(null)

    // Step 4
    const [price, setPrice] = useState(25000)
    const [isFree, setIsFree] = useState(false)


    // Load expert's courses from the database
    useEffect(() => {
        const load = async () => {
            setIsLoadingCourses(true)
            try {
                const res = await fetch("/api/lms/courses?expertMode=true")
                if (res.ok) {
                    const data = await res.json()
                    if (Array.isArray(data)) {
                        setCourses(data.map((c: any) => ({
                            id: c.id,
                            title: c.title,
                            slug: c.slug,
                            category: c.category,
                            level: c.level,
                            price: c.price,
                            isFree: c.isFree,
                            status: c.status,
                            lessonsCount: c._count?.modules ?? 0,
                            duration: 0,
                            studentsCount: c._count?.enrollments ?? 0,
                            rating: 0,
                            createdAt: c.createdAt,
                            instructorName: c.expert?.user?.name ?? user?.name ?? "Expert",
                            instructorPhotoUrl: c.expert?.user?.avatar ?? undefined,
                            bannerUrl: c.thumbnailUrl ?? undefined,
                        })))
                    }
                }
            } catch {
                // keep mock data if API fails
            } finally {
                setIsLoadingCourses(false)
            }
        }
        load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const toggleCard = (id: string) => {
        setExpandedCards(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) { toast.error("Banner image must be under 5 MB."); e.target.value = ""; return }
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
        setThumbnail(file)
        setThumbnailPreview(URL.createObjectURL(file))
    }

    const handleInstructorPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) { toast.error("Instructor photo must be under 5 MB."); e.target.value = ""; return }
        if (instructorPhotoPreview) URL.revokeObjectURL(instructorPhotoPreview)
        setInstructorPhoto(file)
        setInstructorPhotoPreview(URL.createObjectURL(file))
    }

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 100 * 1024 * 1024) { setVideoError("Video must be under 100 MB."); e.target.value = ""; return }
        setVideoError("")
        setIntroVideo(file)
    }

    const handleDocsSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDocuments(prev => [...prev, ...Array.from(e.target.files || [])])
        e.target.value = ""
    }

    const removeDoc = (index: number) => setDocuments(prev => prev.filter((_, i) => i !== index))

    const fmtSize = (bytes: number) =>
        bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

    const resetForm = () => {
        setTitle(""); setDescription(""); setShortDescription("")
        setCategory("STOCK_MARKET"); setLevel("BEGINNER")
        setModulesCount(3); setLessonsCount(10)
        // Do NOT revoke object URLs here — they may still be referenced by saved course cards
        setThumbnail(null); setThumbnailPreview(null)
        setInstructorPhoto(null); setInstructorPhotoPreview(null)
        setIntroVideo(null); setVideoError(""); setDocuments([])
        setPrice(25000); setIsFree(false)
        setCreateStep(1)
    }

    const uploadFile = async (file: File, folder: string): Promise<string | null> => {
        const form = new FormData()
        form.append("file", file)
        form.append("folder", folder)
        const res = await fetch("/api/upload", { method: "POST", body: form })
        if (!res.ok) return null
        const data = await res.json()
        return data.url ?? null
    }

    const handleCreateCourse = async () => {
        if (!title.trim() || !description.trim()) {
            toast.error("Please fill out the course title and description.")
            return
        }
        try {
            // Upload images first, get persistent URLs
            let uploadedThumbnailUrl: string | null = null
            let uploadedPhotoUrl: string | null = null

            if (thumbnail) {
                toast.info("Uploading banner image…")
                uploadedThumbnailUrl = await uploadFile(thumbnail, "courses")
            }
            if (instructorPhoto) {
                uploadedPhotoUrl = await uploadFile(instructorPhoto, "instructors")
            }

            const res = await fetch("/api/lms/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title, description, shortDescription,
                    category, level,
                    price: isFree ? 0 : price, isFree,
                    thumbnailUrl: uploadedThumbnailUrl,
                    instructorPhotoUrl: uploadedPhotoUrl,
                }),
            })
            if (!res.ok) throw new Error(await res.text())
            const created = await res.json()

            const newCourse: CourseData = {
                id: created.id,
                title: created.title,
                slug: created.slug,
                category: created.category,
                level: created.level,
                price: created.price,
                isFree: created.isFree,
                status: created.status,
                lessonsCount,
                duration: lessonsCount * 15,
                studentsCount: 0, rating: 0,
                createdAt: created.createdAt,
                instructorName: user?.name ?? "Expert",
                instructorPhotoUrl: uploadedPhotoUrl ?? instructorPhotoPreview ?? undefined,
                bannerUrl: uploadedThumbnailUrl ?? thumbnailPreview ?? undefined,
            }

            if (newCourse.bannerUrl) setLocalBanners(p => ({ ...p, [created.id]: newCourse.bannerUrl! }))
            if (newCourse.instructorPhotoUrl) setLocalPhotos(p => ({ ...p, [created.id]: newCourse.instructorPhotoUrl! }))

            setCourses(prev => [newCourse, ...prev])
            toast.success("Course saved to database as Draft!")
            resetForm()
            setIsCreateOpen(false)
        } catch (err) {
            console.error(err)
            toast.error("Failed to save course. Please try again.")
        }
    }

    const togglePublishStatus = async (id: string) => {
        const course = courses.find(c => c.id === id)
        if (!course) return
        const newStatus = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
        // Optimistic update
        setCourses(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
        try {
            const res = await fetch(`/api/lms/courses/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })
            if (!res.ok) throw new Error(await res.text())
            toast.success(newStatus === "PUBLISHED"
                ? `"${course.title}" is now live on the academy!`
                : `"${course.title}" moved back to drafts.`)
        } catch (err) {
            // Revert on failure
            setCourses(prev => prev.map(c => c.id === id ? { ...c, status: course.status } : c))
            toast.error("Failed to update course status.")
        }
    }

    const formatCategory = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label ?? cat

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PUBLISHED": return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">Published</Badge>
            case "DRAFT": return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">Draft</Badge>
            default: return <Badge className="text-[10px]">{status}</Badge>
        }
    }

    const getLevelBadge = (lvl: string) => {
        switch (lvl) {
            case "BEGINNER": return <Badge variant="outline" className="text-blue-400 border-blue-400/20 bg-blue-400/5 text-[10px]">Beginner</Badge>
            case "INTERMEDIATE": return <Badge variant="outline" className="text-yellow-400 border-yellow-400/20 bg-yellow-400/5 text-[10px]">Intermediate</Badge>
            case "ADVANCED": return <Badge variant="outline" className="text-red-400 border-red-400/20 bg-red-400/5 text-[10px] font-bold">Advanced</Badge>
            default: return <Badge variant="outline" className="text-[10px]">{lvl}</Badge>
        }
    }

    const instructorInitial = (name: string) => name.charAt(0).toUpperCase()

    return (
        <div className="space-y-8 min-h-screen p-1">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">My Courses Builder</h1>
                    <p className="text-muted-foreground">Create modules, upload lessons, set rates, and teach Tanzanian investors.</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setIsCreateOpen(true) }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 h-11 shrink-0"
                >
                    <PlusCircle className="h-5 w-5" /> Build a Course
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card border-border text-foreground">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{courses.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">{courses.filter(c => c.status === "PUBLISHED").length} Active on Market</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border text-foreground">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Students</CardTitle>
                        <Users className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{courses.reduce((s, c) => s + c.studentsCount, 0)}</div>
                        <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3" /> +15.2% this week</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border text-foreground">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
                        <Check className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.8 / 5.0</div>
                        <p className="text-xs text-muted-foreground mt-1">From 82 course reviews</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border text-foreground">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">LMS Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">950,000 TZS</div>
                        <p className="text-xs text-muted-foreground mt-1">Payout balance: 250,000 TZS</p>
                    </CardContent>
                </Card>
            </div>

            {/* Course Cards */}
            <div className="grid gap-5 md:grid-cols-2">
                {isLoadingCourses ? (
                    [1,2,3,4].map(i => (
                        <div key={i} className="animate-pulse rounded-xl bg-card border border-border overflow-hidden">
                            <div className="h-36 bg-muted/40" />
                            <div className="p-4 space-y-2">
                                <div className="h-3 w-1/3 rounded bg-muted/40" />
                                <div className="h-4 w-2/3 rounded bg-muted/40" />
                            </div>
                        </div>
                    ))
                ) : courses.map(course => {
                    const isExpanded = expandedCards.has(course.id)
                    const gradientClass = CATEGORY_COLORS[course.category] ?? "from-slate-800 to-slate-900"
                    const bannerSrc = localBanners[course.id] ?? course.bannerUrl
                    const photoSrc = localPhotos[course.id] ?? course.instructorPhotoUrl
                    return (
                        <Card
                            key={course.id}
                            className="bg-card border border-border hover:border-emerald-500/20 transition-all duration-200 text-card-foreground overflow-hidden flex flex-col"
                        >
                            {/* ── Banner / Thumbnail ── */}
                            <div className={`relative h-36 bg-gradient-to-br ${gradientClass} overflow-hidden shrink-0`}>
                                {bannerSrc ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={bannerSrc}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                        <BookOpen className="h-20 w-20 text-white" />
                                    </div>
                                )}

                                {/* Status + level badges top-right */}
                                <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                                    {getStatusBadge(course.status)}
                                    {getLevelBadge(course.level)}
                                </div>

                                {/* Instructor photo — bottom-left corner, overlapping the banner */}
                                <div className="absolute -bottom-5 left-4 flex items-end gap-2.5">
                                    {photoSrc ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={photoSrc}
                                            alt={course.instructorName}
                                            className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-800 shadow-lg"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-slate-800 shadow-lg shrink-0">
                                            {instructorInitial(course.instructorName)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Card Body ── */}
                            <div
                                className="pt-8 px-4 pb-3 cursor-pointer select-none"
                                onClick={() => toggleCard(course.id)}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                                            {formatCategory(course.category)}
                                        </span>
                                        <h3 className="text-sm font-bold leading-snug line-clamp-2 mt-0.5">{course.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">by {course.instructorName}</p>
                                    </div>
                                    <div className="shrink-0 mt-1">
                                        {isExpanded
                                            ? <ChevronUp className="h-4 w-4 text-muted-foreground/60" />
                                            : <ChevronDown className="h-4 w-4 text-muted-foreground/60" />
                                        }
                                    </div>
                                </div>

                                {/* Expanded detail grid */}
                                {isExpanded && (
                                    <div className="grid grid-cols-3 gap-2 bg-muted/30 p-3 rounded-lg border border-border/50 text-center text-xs text-foreground/70 mt-3">
                                        <div className="space-y-0.5">
                                            <span className="text-muted-foreground block">Lessons</span>
                                            <span className="font-semibold text-foreground flex items-center justify-center gap-1">
                                                <FileText className="h-3.5 w-3.5 text-emerald-400" /> {course.lessonsCount}
                                            </span>
                                        </div>
                                        <div className="space-y-0.5 border-x border-border/50">
                                            <span className="text-muted-foreground block">Duration</span>
                                            <span className="font-semibold text-foreground flex items-center justify-center gap-1">
                                                <Clock className="h-3.5 w-3.5 text-emerald-400" /> {course.duration}m
                                            </span>
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-muted-foreground block">Students</span>
                                            <span className="font-semibold text-foreground flex items-center justify-center gap-1">
                                                <Users className="h-3.5 w-3.5 text-emerald-400" /> {course.studentsCount}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Bottom bar ── */}
                            <div className="mt-auto bg-muted/50 border-t border-border px-4 py-3 flex items-center justify-between gap-3">
                                <div>
                                    <span className="text-[10px] text-muted-foreground block">Course Price</span>
                                    <span className="text-sm font-bold text-emerald-400">
                                        {course.isFree ? "FREE" : `${course.price.toLocaleString()} TZS`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="bg-transparent border-border hover:bg-muted/50 text-foreground flex items-center gap-1 h-8 px-3 text-xs"
                                        onClick={() => router.push(`/expert/courses/${course.id}/curriculum`)}
                                    >
                                        <Edit className="h-3.5 w-3.5" /> Curriculum
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => togglePublishStatus(course.id)}
                                        className={course.status === "PUBLISHED"
                                            ? "bg-muted hover:bg-muted/80 h-8 px-3 text-xs"
                                            : "bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs"
                                        }
                                    >
                                        {course.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>


            {/* ════ Create Course Wizard ════ */}
            <Dialog open={isCreateOpen} onOpenChange={open => { if (!open) resetForm(); setIsCreateOpen(open) }}>
                <DialogContent className="bg-background border border-border text-foreground max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <span className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0">
                                {createStep}
                            </span>
                            {STEP_LABELS[createStep - 1]}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs">
                            Step {createStep} of {TOTAL_STEPS} — Course Builder Wizard
                        </DialogDescription>
                    </DialogHeader>

                    {/* Progress bar */}
                    <div className="flex items-center gap-1 mb-1">
                        {STEP_LABELS.map((label, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className={`h-1 w-full rounded-full transition-all duration-300 ${i < createStep ? "bg-emerald-500" : "bg-muted"}`} />
                                <span className={`text-[9px] font-medium hidden sm:block ${i + 1 === createStep ? "text-emerald-400" : "text-muted-foreground/60"}`}>{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* ── Step 1: Course Info ── */}
                    {createStep === 1 && (
                        <div className="space-y-4 mt-2">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground/70">Course Title *</label>
                                <input type="text" placeholder="e.g. Introduction to Dar es Salaam Stock Exchange"
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500 placeholder:text-muted-foreground/50"
                                    value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground/70">Short Summary</label>
                                <input type="text" placeholder="e.g. Learn how to open a CSD account and buy shares."
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500 placeholder:text-muted-foreground/50"
                                    value={shortDescription} onChange={e => setShortDescription(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground/70">Full Description *</label>
                                <textarea placeholder="What students will learn, prerequisites, target audience..."
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500 placeholder:text-muted-foreground/50"
                                    rows={4} value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground/70">Category</label>
                                    <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                                        value={category} onChange={e => setCategory(e.target.value)}>
                                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground/70">Level</label>
                                    <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                                        value={level} onChange={e => setLevel(e.target.value)}>
                                        {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Curriculum ── */}
                    {createStep === 2 && (
                        <div className="space-y-4 mt-2">
                            <div className="bg-muted/30 border border-border/50 p-4 rounded-lg flex items-start gap-3">
                                <Layers className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold">Curriculum Blueprint</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                                        Set the structure. Individual lesson videos, PDFs, and MCQs are added in the Curriculum editor after creation.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground/70">Number of Modules</label>
                                    <input type="number" min="1"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                                        value={modulesCount} onChange={e => setModulesCount(parseInt(e.target.value) || 1)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground/70">Estimated Lessons</label>
                                    <input type="number" min="1"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                                        value={lessonsCount} onChange={e => setLessonsCount(parseInt(e.target.value) || 1)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Media & Uploads ── */}
                    {createStep === 3 && (
                        <div className="space-y-5 mt-2">
                            <p className="text-xs text-muted-foreground">Upload your course banner, instructor photo, an intro video, and supporting documents.</p>

                            {/* Instructor Photo */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5">
                                    <UserCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    Instructor Photo
                                    <span className="text-muted-foreground/60 font-normal">(max 5 MB)</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    {/* Preview circle */}
                                    <div className="shrink-0">
                                        {instructorPhotoPreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={instructorPhotoPreview} alt="Instructor"
                                                className="h-20 w-20 rounded-full object-cover ring-2 ring-emerald-500/40" />
                                        ) : (
                                            <div className="h-20 w-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                                                <UserCircle2 className="h-10 w-10 text-muted-foreground/40" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <button
                                            onClick={() => instructorPhotoRef.current?.click()}
                                            className="w-full border border-dashed border-border bg-background rounded-lg p-3 text-center hover:border-emerald-500/40 transition-all cursor-pointer group"
                                        >
                                            <span className="text-xs text-emerald-400 font-semibold block">
                                                {instructorPhoto ? instructorPhoto.name : "Upload your photo"}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/60 block mt-0.5">
                                                {instructorPhoto ? fmtSize(instructorPhoto.size) : "PNG, JPG — max 2 MB · Square recommended"}
                                            </span>
                                        </button>
                                        {instructorPhoto && (
                                            <button onClick={() => { setInstructorPhoto(null); if (instructorPhotoPreview) URL.revokeObjectURL(instructorPhotoPreview); setInstructorPhotoPreview(null) }}
                                                className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 mt-1">
                                                <X className="h-3 w-3" /> Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <input ref={instructorPhotoRef} type="file" accept="image/png,image/jpeg,image/webp"
                                    className="hidden" onChange={handleInstructorPhotoSelect} />
                            </div>

                            {/* Course Banner */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5">
                                    <ImageIcon className="h-3.5 w-3.5 text-blue-400" />
                                    Course Banner / Thumbnail
                                    <span className="text-muted-foreground/60 font-normal">(max 5 MB)</span>
                                </label>
                                {thumbnailPreview && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={thumbnailPreview} alt="Banner preview"
                                        className="w-full h-28 object-cover rounded-lg border border-border" />
                                )}
                                <div onClick={() => thumbnailRef.current?.click()}
                                    className="border border-dashed border-border bg-background rounded-lg p-4 text-center hover:border-blue-500/40 transition-all cursor-pointer group">
                                    <ImageIcon className="h-5 w-5 text-white/20 mx-auto mb-1 group-hover:text-blue-500/50 transition-colors" />
                                    <span className="text-xs text-blue-400 font-semibold block">
                                        {thumbnail ? `${thumbnail.name} · ${fmtSize(thumbnail.size)}` : "Click to upload banner image"}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground/60 block mt-0.5">PNG, JPG — max 5 MB · 16:9 ratio recommended</span>
                                </div>
                                <input ref={thumbnailRef} type="file" accept="image/png,image/jpeg,image/webp"
                                    className="hidden" onChange={handleThumbnailSelect} />
                                {thumbnail && (
                                    <button onClick={() => { setThumbnail(null); if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview); setThumbnailPreview(null) }}
                                        className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1">
                                        <X className="h-3 w-3" /> Remove banner
                                    </button>
                                )}
                            </div>

                            {/* Intro Video */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5">
                                    <Video className="h-3.5 w-3.5 text-purple-400" />
                                    Course Intro Video
                                    <span className="text-muted-foreground/60 font-normal">(max 100 MB)</span>
                                </label>
                                <div onClick={() => videoRef.current?.click()}
                                    className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-all group ${videoError ? "border-red-500/40 bg-red-500/5" : "border-border bg-background hover:border-purple-500/40"}`}>
                                    <Video className="h-5 w-5 text-white/20 mx-auto mb-1 group-hover:text-purple-500/50 transition-colors" />
                                    <span className="text-xs text-purple-400 font-semibold block">
                                        {introVideo ? `${introVideo.name} · ${fmtSize(introVideo.size)}` : "Click to upload intro video"}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground/60 block mt-0.5">MP4, MOV — max 100 MB</span>
                                </div>
                                {videoError && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3 shrink-0" /> {videoError}
                                    </p>
                                )}
                                <input ref={videoRef} type="file" accept="video/mp4,video/quicktime,video/webm,video/*"
                                    className="hidden" onChange={handleVideoSelect} />
                                {introVideo && !videoError && (
                                    <button onClick={() => { setIntroVideo(null); setVideoError("") }}
                                        className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1">
                                        <X className="h-3 w-3" /> Remove video
                                    </button>
                                )}
                            </div>

                            {/* Documents */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5">
                                    <FileUp className="h-3.5 w-3.5 text-amber-400" />
                                    Course Documents & PDFs
                                    <span className="text-muted-foreground/60 font-normal">(multiple)</span>
                                </label>
                                <div onClick={() => docsRef.current?.click()}
                                    className="border border-dashed border-border bg-background rounded-lg p-4 text-center hover:border-amber-500/40 transition-all cursor-pointer group">
                                    <FileUp className="h-5 w-5 text-white/20 mx-auto mb-1 group-hover:text-amber-500/50 transition-colors" />
                                    <span className="text-xs text-amber-400 font-semibold block">Click to add documents</span>
                                    <span className="text-[10px] text-muted-foreground/60 block mt-0.5">PDF, DOCX, PPTX, XLSX — multiple allowed</span>
                                </div>
                                <input ref={docsRef} type="file" multiple
                                    accept=".pdf,.docx,.pptx,.xlsx,application/pdf"
                                    className="hidden" onChange={handleDocsSelect} />
                                {documents.length > 0 && (
                                    <div className="space-y-1.5">
                                        {documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                                                <FileUp className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                                <span className="text-xs text-foreground/70 truncate flex-1">{doc.name}</span>
                                                <span className="text-[10px] text-muted-foreground/60 shrink-0">{fmtSize(doc.size)}</span>
                                                <button onClick={() => removeDoc(idx)} className="text-muted-foreground/60 hover:text-red-400 transition-colors shrink-0">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Step 4: Pricing & Review ── */}
                    {createStep === 4 && (
                        <div className="space-y-4 mt-2">
                            <div className="flex items-center justify-between bg-muted/30 border border-border/50 p-4 rounded-lg">
                                <div>
                                    <h4 className="text-sm font-semibold">Make Course Free</h4>
                                    <p className="text-xs text-muted-foreground">Any registered user can enroll at no cost</p>
                                </div>
                                <Switch checked={isFree} onCheckedChange={setIsFree} className="data-[state=checked]:bg-emerald-500" />
                            </div>
                            {!isFree && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground/70">Course Price (TZS)</label>
                                    <div className="relative">
                                        <input type="number" step="5000"
                                            className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                                            value={price} onChange={e => setPrice(parseInt(e.target.value) || 0)} />
                                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-emerald-400" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Suggested: 25,000 – 150,000 TZS based on content depth.</p>
                                </div>
                            )}

                            {/* Summary with instructor preview */}
                            <div className="bg-background border border-border rounded-xl overflow-hidden">
                                {/* Mini banner preview */}
                                <div className={`h-16 bg-gradient-to-br ${CATEGORY_COLORS[category] ?? "from-slate-800 to-slate-900"} relative`}>
                                    {thumbnailPreview && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute bottom-0 left-3 translate-y-1/2">
                                        {instructorPhotoPreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={instructorPhotoPreview} alt=""
                                                className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-900" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold ring-2 ring-slate-900">
                                                {instructorInitial(user?.name ?? "E")}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-7 px-4 pb-4 space-y-2">
                                    <p className="font-semibold text-foreground text-sm truncate">{title || "Untitled Course"}</p>
                                    <p className="text-xs text-muted-foreground">by {user?.name ?? "Expert"}</p>
                                    <div className="flex flex-wrap gap-1.5 text-xs">
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{formatCategory(category)}</Badge>
                                        <Badge variant="outline" className="border-border text-muted-foreground">{level}</Badge>
                                        <Badge variant="outline" className="border-border text-muted-foreground">{isFree ? "Free" : `${price.toLocaleString()} TZS`}</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                                        <span>Modules: <strong className="text-foreground/70">{modulesCount}</strong></span>
                                        <span>Lessons: <strong className="text-foreground/70">{lessonsCount}</strong></span>
                                        <span>Banner: <strong className={thumbnail ? "text-blue-400" : "text-muted-foreground/40"}>{thumbnail ? "✓" : "—"}</strong></span>
                                        <span>Photo: <strong className={instructorPhoto ? "text-emerald-400" : "text-muted-foreground/40"}>{instructorPhoto ? "✓" : "—"}</strong></span>
                                        <span>Video: <strong className={introVideo ? "text-purple-400" : "text-muted-foreground/40"}>{introVideo ? "✓" : "—"}</strong></span>
                                        <span>Docs: <strong className="text-amber-400">{documents.length} file{documents.length !== 1 ? "s" : ""}</strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border/50 mt-4">
                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted/30"
                            onClick={() => createStep === 1 ? (resetForm(), setIsCreateOpen(false)) : setCreateStep(s => s - 1)}>
                            {createStep === 1 ? "Cancel" : "Back"}
                        </Button>
                        {createStep < TOTAL_STEPS ? (
                            <Button
                                onClick={() => {
                                    if (createStep === 1 && !title.trim()) { toast.error("Please provide a course title."); return }
                                    setCreateStep(s => s + 1)
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                Continue <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        ) : (
                            <Button onClick={handleCreateCourse} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                Create Draft Course
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
