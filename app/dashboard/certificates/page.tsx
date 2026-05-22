"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Award,
    Download,
    ExternalLink,
    Calendar,
    User,
    BookOpen,
    Shield,
    QrCode,
    Search,
    Star,
    CheckCircle,
    FileText
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"


export default function CertificatesPage() {
    const router = useRouter()
    const [certificates, setCertificates] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCert, setSelectedCert] = useState<any | null>(null)
    const [isViewerOpen, setIsViewerOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        async function fetchCertificates() {
            try {
                const res = await fetch("/api/lms/certificates")
                if (res.ok) {
                    const data = await res.json()
                    setCertificates(Array.isArray(data) ? data : data.certificates || [])
                }
            } catch (err) {
                console.error("Failed to load certificates:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCertificates()
    }, [])

    const filteredCerts = certificates.filter(
        (c) =>
            c.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case "Distinction":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            case "Merit":
                return "bg-amber-500/10 text-amber-400 border-amber-500/20"
            case "Pass":
                return "bg-blue-500/10 text-blue-400 border-blue-500/20"
            default:
                return "bg-white/10 text-white/60"
        }
    }

    const handleDownload = (cert: any) => {
        toast.success(`Downloading certificate ${cert.code}...`)
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Award className="h-8 w-8 text-amber-400" /> My Certificates
                    </h1>
                    <p className="text-white/60 mt-1">
                        Your verified academic achievements from YIF Capital Academy courses.
                    </p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 h-8 px-3 text-sm shrink-0">
                    {certificates.length} Certificates Earned
                </Badge>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                <input
                    type="text"
                    placeholder="Search by course or certificate code..."
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Certificates Grid */}
            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse bg-slate-800/30 border-white/10 h-48" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCerts.map((cert) => (
                        <Card
                            key={cert.id}
                            onClick={() => {
                                setSelectedCert(cert)
                                setIsViewerOpen(true)
                            }}
                            className="bg-slate-800/30 border-white/10 hover:border-amber-500/30 cursor-pointer transition-all duration-300 text-white group relative overflow-hidden"
                        >
                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                                <div className="absolute top-0 right-0 w-[140%] h-[140%] -translate-x-1/3 -translate-y-1/3 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full" />
                            </div>

                            <CardContent className="p-6 space-y-5">
                                {/* Cert emblem */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                            <Award className="h-6 w-6 text-amber-400" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-white/40 font-mono block">{cert.code}</span>
                                            <Badge className={`${getGradeColor(cert.grade)} text-[10px] mt-0.5`}>
                                                {cert.grade} — {cert.score}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <Shield className="h-5 w-5 text-emerald-400/40" />
                                </div>

                                {/* Course Title */}
                                <div>
                                    <h3 className="text-base font-bold leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors">
                                        {cert.courseTitle}
                                    </h3>
                                    <span className="text-[11px] text-emerald-400 mt-1 block">{cert.courseCategory}</span>
                                </div>

                                {/* Meta */}
                                <div className="flex items-center justify-between text-xs text-white/50 border-t border-white/5 pt-3">
                                    <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" /> {cert.expertName}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {new Date(cert.issuedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {filteredCerts.length === 0 && (
                <div className="text-center py-16 space-y-3">
                    <Award className="h-16 w-16 text-white/10 mx-auto" />
                    <h3 className="text-lg font-semibold text-white/60">No certificates yet</h3>
                    <p className="text-white/40 max-w-sm mx-auto text-sm">
                        Complete courses from the YIF Academy to earn verifiable certificates of competency.
                    </p>
                    <Button
                        onClick={() => router.push("/courses")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
                    >
                        Browse Courses
                    </Button>
                </div>
            )}

            {/* Certificate Viewer Dialog */}
            {selectedCert && (
                <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
                    <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg p-0 overflow-hidden">
                        {/* Certificate Visual Frame */}
                        <div className="bg-gradient-to-br from-slate-800 via-slate-800/90 to-slate-900 p-8 border-b border-white/10 relative">
                            {/* Decorative border accents */}
                            <div className="absolute inset-4 border border-amber-500/10 rounded-xl pointer-events-none" />
                            <div className="absolute inset-6 border border-amber-500/5 rounded-lg pointer-events-none" />

                            <div className="relative z-10 text-center space-y-5">
                                {/* Logo / Seal */}
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <Award className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div className="text-left">
                                        <span className="text-sm font-bold text-white block">YIF Capital Academy</span>
                                        <span className="text-[10px] text-amber-400 uppercase tracking-wider">Certificate of Completion</span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="w-16 h-px bg-amber-500/30 mx-auto" />

                                {/* Awarded To */}
                                <div>
                                    <span className="text-[10px] text-white/40 uppercase tracking-wider block">This is to certify that</span>
                                    <h2 className="text-2xl font-bold text-amber-400 mt-1">{selectedCert.studentName}</h2>
                                </div>

                                {/* Course */}
                                <div>
                                    <span className="text-[10px] text-white/40 uppercase tracking-wider block">has successfully completed</span>
                                    <h3 className="text-lg font-semibold text-white mt-1">{selectedCert.courseTitle}</h3>
                                    <div className="flex items-center justify-center gap-3 mt-2">
                                        <Badge className={`${getGradeColor(selectedCert.grade)}`}>
                                            {selectedCert.grade}
                                        </Badge>
                                        <span className="text-sm text-emerald-400 font-bold">{selectedCert.score}%</span>
                                    </div>
                                </div>

                                {/* Signatures */}
                                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5 mt-6">
                                    <div className="text-center">
                                        <div className="h-8 flex items-center justify-center">
                                            <span className="text-white/30 italic text-sm font-serif">E. Kitundu</span>
                                        </div>
                                        <div className="w-20 h-px bg-white/20 mx-auto mb-1" />
                                        <span className="text-[10px] text-white/40 block">{selectedCert.expertName}</span>
                                        <span className="text-[9px] text-white/30 block">Course Instructor</span>
                                    </div>
                                    <div className="text-center">
                                        <div className="h-8 flex items-center justify-center">
                                            <span className="text-white/30 italic text-sm font-serif">YIF Capital</span>
                                        </div>
                                        <div className="w-20 h-px bg-white/20 mx-auto mb-1" />
                                        <span className="text-[10px] text-white/40 block">YIF Capital Ltd</span>
                                        <span className="text-[9px] text-white/30 block">Platform Issuer</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer: Metadata + QR */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-white/40 block">Certificate Code</span>
                                    <span className="text-xs font-mono font-bold text-emerald-400">{selectedCert.code}</span>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-[10px] text-white/40 block">Issued On</span>
                                    <span className="text-xs font-semibold text-white">{new Date(selectedCert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/15 p-3 rounded-lg">
                                <div className="h-10 w-10 bg-white rounded flex items-center justify-center shrink-0">
                                    <QrCode className="h-6 w-6 text-slate-900" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Verified & Tamper-Proof</span>
                                    <span className="text-[10px] text-white/50 block mt-0.5">Scan QR code or visit verification URL to validate</span>
                                </div>
                                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleDownload(selectedCert)}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Download className="h-4 w-4 mr-1.5" /> Download PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-white/10 text-white hover:bg-white/5"
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedCert.qrVerificationUrl)
                                        toast.success("Verification link copied to clipboard!")
                                    }}
                                >
                                    <ExternalLink className="h-4 w-4 mr-1.5" /> Share
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
