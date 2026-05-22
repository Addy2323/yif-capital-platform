"use client"

import { useState, useEffect } from "react"
import {
    Users,
    Search,
    Filter,
    MoreHorizontal,
    Mail,
    BookOpen,
    Calendar,
    Download,
    CheckCircle2,
    Clock,
    Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Student {
    userId: string
    name: string
    email: string
    avatar: string | null
    enrolledCourses: string[]
    totalProgress: number
    isCompleted: boolean
    enrolledAt: string
}

function formatTimeAgo(dateString: string) {
    const diff = Date.now() - new Date(dateString).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function ExpertStudentsPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetch("/api/expert/students")
            .then(r => r.json())
            .then(data => {
                setStudents(Array.isArray(data) ? data : [])
                setIsLoading(false)
            })
            .catch(() => setIsLoading(false))
    }, [])

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalStudents = students.length
    const completedCount = students.filter(s => s.isCompleted).length
    const avgProgress = students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + s.totalProgress, 0) / students.length)
        : 0

    const topStudents = [...students]
        .sort((a, b) => b.totalProgress - a.totalProgress)
        .slice(0, 3)

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        Student Management <Users className="h-8 w-8 text-emerald-500" />
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track and manage students enrolled in your courses.
                    </p>
                </div>
                <Button variant="outline" className="bg-transparent border-border text-foreground hover:bg-muted/50">
                    <Download className="mr-2 h-4 w-4" /> Export List
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-muted/30 border-border text-foreground">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                        <p className="text-xs text-muted-foreground mt-1">Across all courses</p>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border text-foreground">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">{completedCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0}% completion rate
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border text-foreground">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Average Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgProgress}%</div>
                        <Progress value={avgProgress} className="h-1.5 mt-2 bg-muted/30" />
                    </CardContent>
                </Card>
            </div>

            {/* Student Table */}
            <Card className="bg-muted/30 border-border text-foreground">
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>Students List</CardTitle>
                            <CardDescription className="text-muted-foreground">Search and filter your student base</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search student..."
                                    className="pl-10 bg-muted/30 border-border text-foreground h-9"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="bg-transparent border-border text-foreground hover:bg-muted/50 h-9 w-9">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg bg-muted/30 animate-pulse" />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                            <p className="text-muted-foreground">
                                {searchQuery ? "No students match your search." : "No students enrolled yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border border-border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="border-border">
                                        <TableHead className="text-muted-foreground">Student</TableHead>
                                        <TableHead className="text-muted-foreground">Courses</TableHead>
                                        <TableHead className="text-muted-foreground">Progress</TableHead>
                                        <TableHead className="text-muted-foreground">Enrolled</TableHead>
                                        <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map(student => (
                                        <TableRow key={student.userId} className="border-border hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                                                        {student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{student.name}</span>
                                                        <span className="text-xs text-muted-foreground">{student.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 max-w-[200px]">
                                                    {student.enrolledCourses.slice(0, 2).map((course, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-[10px] bg-muted/30 border-border text-foreground/80 py-0 font-normal truncate">
                                                            {course}
                                                        </Badge>
                                                    ))}
                                                    {student.enrolledCourses.length > 2 && (
                                                        <span className="text-[10px] text-muted-foreground">+{student.enrolledCourses.length - 2} more</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 min-w-[100px]">
                                                    <Progress value={student.totalProgress} className="h-1.5 flex-1 bg-muted/30" />
                                                    <span className={cn(
                                                        "text-xs font-medium shrink-0",
                                                        student.isCompleted ? "text-emerald-400" : "text-foreground/80"
                                                    )}>
                                                        {student.totalProgress}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatTimeAgo(student.enrolledAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground">
                                                            <Mail className="mr-2 h-4 w-4" /> Message Student
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground">
                                                            <BookOpen className="mr-2 h-4 w-4" /> View Progress
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground">
                                                            <Calendar className="mr-2 h-4 w-4" /> Schedule Session
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-muted/50" />
                                                        <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400">
                                                            Revoke Access
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bottom Row */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-muted/30 border-border text-foreground">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-400" />
                            Engagement Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-48 flex items-center justify-center border-t border-border">
                        <div className="text-center">
                            <Activity className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Detailed analytics coming soon</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border text-foreground">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            Top Students
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">Highest overall progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topStudents.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No students yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {topStudents.map(s => (
                                    <div key={s.userId} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold">
                                                {s.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium">{s.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Progress value={s.totalProgress} className="h-1.5 w-20 bg-muted/30" />
                                            <span className="text-xs font-bold text-emerald-400">{s.totalProgress}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
