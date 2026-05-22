"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Plus,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronRight,
    Video,
    FileText,
    BookOpen,
    GripVertical,
    Clock,
    Unlock,
    Lock,
    Loader2,
    Upload,
    X as XIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Lesson {
    id: string
    title: string
    description: string | null
    videoUrl: string | null
    pdfUrl: string | null
    content: string | null
    duration: number
    sortOrder: number
    isFree: boolean
}

interface Module {
    id: string
    title: string
    description: string | null
    sortOrder: number
    lessons: Lesson[]
}

const emptyLessonForm = {
    title: "",
    description: "",
    videoUrl: "",
    pdfUrl: "",
    content: "",
    duration: 0,
    isFree: false,
}

export default function CurriculumPage() {
    const { courseId } = useParams<{ courseId: string }>()
    const router = useRouter()

    const [courseTitle, setCourseTitle] = useState("")
    const [courseStatus, setCourseStatus] = useState("")
    const [modules, setModules] = useState<Module[]>([])
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingVideo, setUploadingVideo] = useState(false)
    const [uploadingPdf, setUploadingPdf] = useState(false)
    const videoInputRef = useRef<HTMLInputElement>(null)
    const pdfInputRef = useRef<HTMLInputElement>(null)

    // Module dialog
    const [moduleDialog, setModuleDialog] = useState<{ open: boolean; mode: "add" | "edit"; module?: Module }>({ open: false, mode: "add" })
    const [moduleForm, setModuleForm] = useState({ title: "", description: "" })

    // Lesson dialog
    const [lessonDialog, setLessonDialog] = useState<{ open: boolean; mode: "add" | "edit"; moduleId?: string; lesson?: Lesson }>({ open: false, mode: "add" })
    const [lessonForm, setLessonForm] = useState(emptyLessonForm)

    // Delete confirm
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; type: "module" | "lesson"; id: string; name: string }>({
        open: false, type: "module", id: "", name: ""
    })

    useEffect(() => {
        loadData()
    }, [courseId])

    async function loadData() {
        setLoading(true)
        try {
            const [courseRes, modulesRes] = await Promise.all([
                fetch(`/api/lms/courses/${courseId}`),
                fetch(`/api/lms/courses/${courseId}/modules`),
            ])
            if (courseRes.ok) {
                const c = await courseRes.json()
                setCourseTitle(c.title)
                setCourseStatus(c.status)
            }
            if (modulesRes.ok) {
                const m = await modulesRes.json()
                setModules(m)
                if (m.length > 0) setExpandedModules(new Set([m[0].id]))
            }
        } catch {
            toast.error("Failed to load curriculum")
        } finally {
            setLoading(false)
        }
    }

    function toggleModule(id: string) {
        setExpandedModules(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    // ── Module CRUD ──────────────────────────────────────────────────────────

    function openAddModule() {
        setModuleForm({ title: "", description: "" })
        setModuleDialog({ open: true, mode: "add" })
    }

    function openEditModule(mod: Module) {
        setModuleForm({ title: mod.title, description: mod.description ?? "" })
        setModuleDialog({ open: true, mode: "edit", module: mod })
    }

    async function saveModule() {
        if (!moduleForm.title.trim()) { toast.error("Module title is required"); return }
        setSaving(true)
        try {
            if (moduleDialog.mode === "add") {
                const res = await fetch(`/api/lms/courses/${courseId}/modules`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: moduleForm.title, description: moduleForm.description || null, sortOrder: modules.length }),
                })
                if (!res.ok) throw new Error()
                const newMod: Module = { ...(await res.json()), lessons: [] }
                setModules(prev => [...prev, newMod])
                setExpandedModules(prev => new Set([...prev, newMod.id]))
                toast.success("Module added")
            } else if (moduleDialog.module) {
                const res = await fetch(`/api/lms/modules/${moduleDialog.module.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: moduleForm.title, description: moduleForm.description || null }),
                })
                if (!res.ok) throw new Error()
                const updated = await res.json()
                setModules(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m))
                toast.success("Module updated")
            }
            setModuleDialog({ open: false, mode: "add" })
        } catch {
            toast.error("Failed to save module")
        } finally {
            setSaving(false)
        }
    }

    async function deleteModule(id: string) {
        try {
            const res = await fetch(`/api/lms/modules/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error()
            setModules(prev => prev.filter(m => m.id !== id))
            toast.success("Module deleted")
        } catch {
            toast.error("Failed to delete module")
        }
    }

    // ── Lesson CRUD ──────────────────────────────────────────────────────────

    function openAddLesson(moduleId: string) {
        setLessonForm(emptyLessonForm)
        setLessonDialog({ open: true, mode: "add", moduleId })
    }

    function openEditLesson(lesson: Lesson, moduleId: string) {
        setLessonForm({
            title: lesson.title,
            description: lesson.description ?? "",
            videoUrl: lesson.videoUrl ?? "",
            pdfUrl: lesson.pdfUrl ?? "",
            content: lesson.content ?? "",
            duration: lesson.duration,
            isFree: lesson.isFree,
        })
        setLessonDialog({ open: true, mode: "edit", moduleId, lesson })
    }

    async function saveLesson() {
        if (!lessonForm.title.trim()) { toast.error("Lesson title is required"); return }
        setSaving(true)
        try {
            const body = {
                title: lessonForm.title,
                description: lessonForm.description || null,
                videoUrl: lessonForm.videoUrl || null,
                pdfUrl: lessonForm.pdfUrl || null,
                content: lessonForm.content || null,
                duration: Number(lessonForm.duration) || 0,
                isFree: lessonForm.isFree,
            }

            if (lessonDialog.mode === "add" && lessonDialog.moduleId) {
                const mod = modules.find(m => m.id === lessonDialog.moduleId)
                const res = await fetch(`/api/lms/modules/${lessonDialog.moduleId}/lessons`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...body, sortOrder: mod?.lessons.length ?? 0 }),
                })
                if (!res.ok) throw new Error()
                const newLesson = await res.json()
                setModules(prev => prev.map(m =>
                    m.id === lessonDialog.moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
                ))
                toast.success("Lesson added")
            } else if (lessonDialog.lesson) {
                const res = await fetch(`/api/lms/lessons/${lessonDialog.lesson.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                })
                if (!res.ok) throw new Error()
                const updated = await res.json()
                setModules(prev => prev.map(m =>
                    m.id === lessonDialog.moduleId
                        ? { ...m, lessons: m.lessons.map(l => l.id === updated.id ? updated : l) }
                        : m
                ))
                toast.success("Lesson updated")
            }
            setLessonDialog({ open: false, mode: "add" })
        } catch {
            toast.error("Failed to save lesson")
        } finally {
            setSaving(false)
        }
    }

    async function deleteLesson(lessonId: string, moduleId: string) {
        try {
            const res = await fetch(`/api/lms/lessons/${lessonId}`, { method: "DELETE" })
            if (!res.ok) throw new Error()
            setModules(prev => prev.map(m =>
                m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m
            ))
            toast.success("Lesson deleted")
        } catch {
            toast.error("Failed to delete lesson")
        }
    }

    async function uploadFile(file: File, folder: string): Promise<string | null> {
        const form = new FormData()
        form.append("file", file)
        form.append("folder", folder)
        const res = await fetch("/api/upload", { method: "POST", body: form })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            toast.error(err.error || "Upload failed")
            return null
        }
        return (await res.json()).url ?? null
    }

    async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingVideo(true)
        const url = await uploadFile(file, "lessons/videos")
        if (url) setLessonForm(f => ({ ...f, videoUrl: url }))
        setUploadingVideo(false)
        e.target.value = ""
    }

    async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingPdf(true)
        const url = await uploadFile(file, "lessons/pdfs")
        if (url) setLessonForm(f => ({ ...f, pdfUrl: url }))
        setUploadingPdf(false)
        e.target.value = ""
    }

    function getLessonIcon(lesson: Lesson) {
        if (lesson.videoUrl) return <Video className="w-3.5 h-3.5 text-blue-500" />
        if (lesson.pdfUrl) return <FileText className="w-3.5 h-3.5 text-orange-500" />
        if (lesson.content) return <BookOpen className="w-3.5 h-3.5 text-green-500" />
        return <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
    }

    const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0)
    const totalDuration = modules.reduce((s, m) => s + m.lessons.reduce((ls, l) => ls + l.duration, 0), 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Button variant="ghost" size="sm" onClick={() => router.push("/expert/courses")} className="shrink-0">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Curriculum Editor</p>
                            <h1 className="font-semibold text-foreground truncate">{courseTitle}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={courseStatus === "PUBLISHED" ? "default" : "secondary"}>
                            {courseStatus === "PUBLISHED" ? "Published" : "Draft"}
                        </Badge>
                        <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{modules.length} modules</span>
                            <span>·</span>
                            <span>{totalLessons} lessons</span>
                            {totalDuration > 0 && <>
                                <span>·</span>
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{Math.round(totalDuration / 60)}m</span>
                            </>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-3">
                {modules.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium text-foreground">No modules yet</p>
                        <p className="text-sm mt-1">Add your first module to start building the curriculum.</p>
                    </div>
                )}

                {modules.map((mod, modIdx) => {
                    const isExpanded = expandedModules.has(mod.id)
                    return (
                        <div key={mod.id} className="border border-border rounded-lg bg-card overflow-hidden">
                            {/* Module header */}
                            <div
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
                                onClick={() => toggleModule(mod.id)}
                            >
                                <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            Section {modIdx + 1}
                                        </span>
                                        {mod.lessons.length > 0 && (
                                            <span className="text-xs text-muted-foreground">
                                                · {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-medium text-foreground truncate">{mod.title}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEditModule(mod)}>
                                        <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 hover:text-destructive"
                                        onClick={() => setDeleteConfirm({ open: true, type: "module", id: mod.id, name: mod.title })}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                                {isExpanded
                                    ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                                    : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                }
                            </div>

                            {/* Lessons */}
                            {isExpanded && (
                                <div className="border-t border-border">
                                    {mod.lessons.length === 0 && (
                                        <p className="px-6 py-3 text-sm text-muted-foreground italic">
                                            No lessons yet — add one below.
                                        </p>
                                    )}
                                    {mod.lessons.map((lesson, lessonIdx) => (
                                        <div
                                            key={lesson.id}
                                            className="flex items-center gap-3 px-6 py-2.5 border-b border-border/50 last:border-b-0 hover:bg-muted/30 group"
                                        >
                                            <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
                                            <span className="text-xs text-muted-foreground w-5 shrink-0">{lessonIdx + 1}</span>
                                            {getLessonIcon(lesson)}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-foreground truncate">{lesson.title}</p>
                                                {lesson.duration > 0 && (
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {lesson.duration < 60
                                                            ? `${lesson.duration}s`
                                                            : `${Math.floor(lesson.duration / 60)}m ${lesson.duration % 60 > 0 ? `${lesson.duration % 60}s` : ""}`}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {lesson.isFree
                                                    ? <Unlock className="w-3.5 h-3.5 text-green-500" title="Free preview" />
                                                    : <Lock className="w-3.5 h-3.5 text-muted-foreground/50" title="Paid" />
                                                }
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                                    onClick={() => openEditLesson(lesson, mod.id)}
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                                                    onClick={() => setDeleteConfirm({ open: true, type: "lesson", id: lesson.id + "|" + mod.id, name: lesson.title })}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="px-6 py-2.5">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-primary hover:text-primary/80 h-8 text-xs gap-1"
                                            onClick={() => openAddLesson(mod.id)}
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add Lesson
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}

                <Button
                    onClick={openAddModule}
                    variant="outline"
                    className="w-full border-dashed gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Module
                </Button>
            </div>

            {/* Module Dialog */}
            <Dialog open={moduleDialog.open} onOpenChange={open => !open && setModuleDialog({ open: false, mode: "add" })}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{moduleDialog.mode === "add" ? "Add Module" : "Edit Module"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Title *</label>
                            <Input
                                value={moduleForm.title}
                                onChange={e => setModuleForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="e.g. Introduction to Investment"
                                className="text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                            <Textarea
                                value={moduleForm.description}
                                onChange={e => setModuleForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Brief overview of this module..."
                                className="text-foreground resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModuleDialog({ open: false, mode: "add" })}>Cancel</Button>
                        <Button onClick={saveModule} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {moduleDialog.mode === "add" ? "Add Module" : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Lesson Dialog */}
            <Dialog open={lessonDialog.open} onOpenChange={open => !open && setLessonDialog({ open: false, mode: "add" })}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{lessonDialog.mode === "add" ? "Add Lesson" : "Edit Lesson"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Title *</label>
                            <Input
                                value={lessonForm.title}
                                onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="e.g. What is a Mutual Fund?"
                                className="text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                            <Textarea
                                value={lessonForm.description}
                                onChange={e => setLessonForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Short lesson summary..."
                                className="text-foreground resize-none"
                                rows={2}
                            />
                        </div>
                        {/* Video */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Video</label>
                            <div className="flex gap-2">
                                <Input
                                    value={lessonForm.videoUrl}
                                    onChange={e => setLessonForm(f => ({ ...f, videoUrl: e.target.value }))}
                                    placeholder="Paste URL or upload a file"
                                    className="text-foreground flex-1"
                                />
                                {lessonForm.videoUrl && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="shrink-0 px-2 hover:text-destructive"
                                        onClick={() => setLessonForm(f => ({ ...f, videoUrl: "" }))}
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0 gap-1.5"
                                    disabled={uploadingVideo}
                                    onClick={() => videoInputRef.current?.click()}
                                >
                                    {uploadingVideo
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        : <Upload className="w-3.5 h-3.5" />
                                    }
                                    Upload
                                </Button>
                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                    className="hidden"
                                    onChange={handleVideoUpload}
                                />
                            </div>
                            {lessonForm.videoUrl && lessonForm.videoUrl.startsWith("/uploads/") && (
                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                    Uploaded: {lessonForm.videoUrl.split("/").pop()}
                                </p>
                            )}
                        </div>

                        {/* PDF */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">PDF / Document</label>
                            <div className="flex gap-2">
                                <Input
                                    value={lessonForm.pdfUrl}
                                    onChange={e => setLessonForm(f => ({ ...f, pdfUrl: e.target.value }))}
                                    placeholder="Paste URL or upload a file"
                                    className="text-foreground flex-1"
                                />
                                {lessonForm.pdfUrl && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="shrink-0 px-2 hover:text-destructive"
                                        onClick={() => setLessonForm(f => ({ ...f, pdfUrl: "" }))}
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0 gap-1.5"
                                    disabled={uploadingPdf}
                                    onClick={() => pdfInputRef.current?.click()}
                                >
                                    {uploadingPdf
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        : <Upload className="w-3.5 h-3.5" />
                                    }
                                    Upload
                                </Button>
                                <input
                                    ref={pdfInputRef}
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={handlePdfUpload}
                                />
                            </div>
                            {lessonForm.pdfUrl && lessonForm.pdfUrl.startsWith("/uploads/") && (
                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                    Uploaded: {lessonForm.pdfUrl.split("/").pop()}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Text Content</label>
                            <Textarea
                                value={lessonForm.content}
                                onChange={e => setLessonForm(f => ({ ...f, content: e.target.value }))}
                                placeholder="Lesson content in plain text or markdown..."
                                className="text-foreground resize-none"
                                rows={4}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-foreground mb-1 block">Duration (seconds)</label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={lessonForm.duration}
                                    onChange={e => setLessonForm(f => ({ ...f, duration: Number(e.target.value) }))}
                                    className="text-foreground"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-5">
                                <Switch
                                    checked={lessonForm.isFree}
                                    onCheckedChange={v => setLessonForm(f => ({ ...f, isFree: v }))}
                                />
                                <label className="text-sm text-foreground">Free preview</label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLessonDialog({ open: false, mode: "add" })}>Cancel</Button>
                        <Button onClick={saveLesson} disabled={saving || uploadingVideo || uploadingPdf}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {lessonDialog.mode === "add" ? "Add Lesson" : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <AlertDialog
                open={deleteConfirm.open}
                onOpenChange={open => !open && setDeleteConfirm(d => ({ ...d, open: false }))}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {deleteConfirm.type === "module" ? "Module" : "Lesson"}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            &ldquo;{deleteConfirm.name}&rdquo; will be permanently deleted.
                            {deleteConfirm.type === "module" && " All lessons inside it will also be removed."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            onClick={() => {
                                if (deleteConfirm.type === "module") {
                                    deleteModule(deleteConfirm.id)
                                } else {
                                    const [lessonId, moduleId] = deleteConfirm.id.split("|")
                                    deleteLesson(lessonId, moduleId)
                                }
                                setDeleteConfirm(d => ({ ...d, open: false }))
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
