"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    ShieldCheck,
    ShieldAlert,
    Search,
    Download,
    Filter,
    RefreshCcw,
    Smartphone,
    Globe,
    User,
    Clock
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface AccessLog {
    id: string
    userId: string | null
    userName?: string
    userEmail?: string
    sessionId: string | null
    sessionTitle?: string
    ipAddress: string | null
    deviceFingerprint: string | null
    userAgent: string | null
    status: "success" | "denied"
    reason: string | null
    createdAt: string
}

export default function AdminAccessLogsPage() {
    const [logs, setLogs] = useState<AccessLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        // In production: fetch('/api/admin/access-logs')
        const mockLogs: AccessLog[] = [
            {
                id: "1",
                userId: "u123",
                userName: "John Doe",
                userEmail: "john@example.com",
                sessionId: "s1",
                sessionTitle: "Tanzania Stocks Intro",
                ipAddress: "192.168.1.1",
                deviceFingerprint: "sha256:abc123def",
                userAgent: "Chrome / Windows 11",
                status: "success",
                reason: null,
                createdAt: new Date().toISOString()
            },
            {
                id: "2",
                userId: "u456",
                userName: "Unknown Share",
                userEmail: "unauthorized@user.com",
                sessionId: "s1",
                sessionTitle: "Tanzania Stocks Intro",
                ipAddress: "10.0.0.5",
                deviceFingerprint: "sha256:xyz789",
                userAgent: "iPhone / Mobile Safari",
                status: "denied",
                reason: "wrong_device",
                createdAt: new Date(Date.now() - 500000).toISOString()
            },
            {
                id: "3",
                userId: null,
                userName: "Anonymous",
                sessionId: "s1",
                sessionTitle: "Tanzania Stocks Intro",
                ipAddress: "45.23.11.2",
                deviceFingerprint: "sha256:999000",
                userAgent: "Firefox / macOS",
                status: "denied",
                reason: "enrollment_missing",
                createdAt: new Date(Date.now() - 1000000).toISOString()
            }
        ]
        setLogs(mockLogs)
        setIsLoading(false)
    }

    const filteredLogs = logs.filter(log =>
        (log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) || "") ||
        (log.reason?.toLowerCase().includes(searchQuery.toLowerCase()) || "") ||
        (log.sessionTitle?.toLowerCase().includes(searchQuery.toLowerCase()) || "")
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Security Audit Logs</h1>
                    <p className="text-muted-foreground">Monitor live session access attempts and detect link sharing abuse.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchLogs}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <StatsCard title="Total Attempts" value={logs.length} icon={<Clock className="text-blue-500" />} />
                <StatsCard title="Secured Entry" value={logs.filter(l => l.status === 'success').length} icon={<ShieldCheck className="text-success" />} />
                <StatsCard title="Blocked Abuse" value={logs.filter(l => l.status === 'denied' && (l.reason === 'used' || l.reason === 'wrong_device')).length} icon={<ShieldAlert className="text-error" />} />
                <StatsCard title="Lead Gen (Paywall)" value={logs.filter(l => l.reason === 'enrollment_missing').length} icon={<User className="text-gold" />} />
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by user, session, or reason..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">User / IP</th>
                                    <th className="px-4 py-3 text-left font-medium">Session</th>
                                    <th className="px-4 py-3 text-left font-medium">Device Info</th>
                                    <th className="px-4 py-3 text-left font-medium">Status / Reason</th>
                                    <th className="px-4 py-3 text-right font-medium">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">{log.userName}</span>
                                                <span className="text-[10px] text-muted-foreground">{log.ipAddress}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-xs truncate max-w-[150px] inline-block">{log.sessionTitle}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-xs">
                                                <Smartphone className="h-3 w-3 text-muted-foreground" />
                                                <span className="truncate max-w-[100px]">{log.userAgent}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                {log.status === "success" ? (
                                                    <Badge className="bg-success/10 text-success border-success/20">GRANTED</Badge>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="destructive">DENIED</Badge>
                                                        <span className="text-[10px] font-medium text-error uppercase">{log.reason?.replace('_', ' ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(log.createdAt), "HH:mm:ss")}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function StatsCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">{title}</p>
                    <p className="text-xl font-bold mt-1">{value}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}
