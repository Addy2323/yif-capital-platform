"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    Award,
    Download,
    ExternalLink,
    Calendar,
    User,
    Shield,
    QrCode,
    CheckCircle,
    ChevronLeft
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Mock certificates database lookup
const ALL_CERTIFICATES = [
    {
        id: "cert-1",
        code: "YIF-CERT-2026-48291",
        courseTitle: "Introduction to Dar es Salaam Stock Exchange (DSE)",
        courseCategory: "Stock Market",
        expertName: "Dr. Elirehema Kitundu",
        studentName: "John Mwangi",
        issuedAt: "2026-05-15",
        grade: "Distinction",
        score: 94,
        duration: "4 hours",
        qrVerificationUrl: "https://verify.yifcapital.co.tz/cert/YIF-CERT-2026-48291"
    },
    {
        id: "cert-2",
        code: "YIF-CERT-2026-37104",
        courseTitle: "Personal Finance & Saccos Strategy in East Africa",
        courseCategory: "SACCO Investment",
        expertName: "Lilian Mushi",
        studentName: "John Mwangi",
        issuedAt: "2026-04-28",
        grade: "Merit",
        score: 82,
        duration: "1.5 hours",
        qrVerificationUrl: "https://verify.yifcapital.co.tz/cert/YIF-CERT-2026-37104"
    },
    {
        id: "cert-3",
        code: "YIF-CERT-2026-55823",
        courseTitle: "Tanzania Treasury Bonds Masterclass",
        courseCategory: "Bonds & Treasury",
        expertName: "Dr. Elirehema Kitundu",
        studentName: "John Mwangi",
        issuedAt: "2026-05-10",
        grade: "Distinction",
        score: 97,
        duration: "3 hours",
        qrVerificationUrl: "https://verify.yifcapital.co.tz/cert/YIF-CERT-2026-55823"
    }
]

export default function CertificateIdViewerPage() {
    const params = useParams()
    const router = useRouter()
    const certificateId = params?.certificateId as string

    // Find requested certificate
    const cert = ALL_CERTIFICATES.find((c) => c.id === certificateId) || ALL_CERTIFICATES[0]

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

    const handleDownload = () => {
        toast.success(`Downloading PDF for certificate: ${cert.code}...`)
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4 md:p-8">
            <div className="w-full max-w-2xl mb-4 flex justify-between items-center">
                <Button
                    onClick={() => router.push("/dashboard/certificates")}
                    variant="ghost"
                    className="text-white/60 hover:text-white"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to Certificates
                </Button>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Verified Award
                </Badge>
            </div>

            <Card className="w-full max-w-2xl bg-slate-800/40 border-white/10 text-white overflow-hidden shadow-2xl">
                {/* Visual Certificate Frame */}
                <div className="bg-gradient-to-br from-slate-800 via-slate-800/90 to-slate-900 p-8 md:p-12 border-b border-white/10 relative">
                    <div className="absolute inset-4 border border-amber-500/10 rounded-2xl pointer-events-none" />
                    <div className="absolute inset-6 border border-amber-500/5 rounded-lg pointer-events-none" />

                    <div className="relative z-10 text-center space-y-6">
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Award className="h-5 w-5 text-amber-400" />
                            </div>
                            <div className="text-left">
                                <span className="text-sm font-bold text-white block">YIF Capital Academy</span>
                                <span className="text-[10px] text-amber-400 uppercase tracking-wider">Certificate of Completion</span>
                            </div>
                        </div>

                        <div className="w-16 h-px bg-amber-500/30 mx-auto" />

                        <div>
                            <span className="text-[10px] text-white/40 uppercase tracking-wider block">This is to certify that</span>
                            <h2 className="text-3xl font-extrabold text-amber-400 mt-2">{cert.studentName}</h2>
                        </div>

                        <div>
                            <span className="text-[10px] text-white/40 uppercase tracking-wider block">has successfully completed the course</span>
                            <h3 className="text-xl font-bold text-white mt-2 leading-snug">{cert.courseTitle}</h3>
                            <div className="flex items-center justify-center gap-3 mt-3">
                                <Badge className={`${getGradeColor(cert.grade)}`}>
                                    {cert.grade}
                                </Badge>
                                <span className="text-sm text-emerald-400 font-bold">{cert.score}% score</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5 mt-8">
                            <div className="text-center">
                                <div className="h-8 flex items-center justify-center">
                                    <span className="text-white/30 italic text-sm font-serif">E. Kitundu</span>
                                </div>
                                <div className="w-20 h-px bg-white/20 mx-auto mb-1" />
                                <span className="text-[10px] text-white/45 block">{cert.expertName}</span>
                                <span className="text-[9px] text-white/30 block">Course Instructor</span>
                            </div>
                            <div className="text-center">
                                <div className="h-8 flex items-center justify-center">
                                    <span className="text-white/30 italic text-sm font-serif">YIF Capital</span>
                                </div>
                                <div className="w-20 h-px bg-white/20 mx-auto mb-1" />
                                <span className="text-[10px] text-white/45 block">YIF Capital Ltd</span>
                                <span className="text-[9px] text-white/30 block">Platform Issuer</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verification footer block */}
                <div className="p-6 md:p-8 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] text-white/40 block">Certificate Reference</span>
                            <span className="text-xs font-mono font-bold text-emerald-400">{cert.code}</span>
                        </div>
                        <div className="space-y-1 text-left sm:text-right">
                            <span className="text-[10px] text-white/40 block">Completion Date</span>
                            <span className="text-xs font-semibold text-white">
                                {new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-xl">
                        <div className="h-10 w-10 bg-white rounded flex items-center justify-center shrink-0">
                            <QrCode className="h-6 w-6 text-slate-900" />
                        </div>
                        <div className="flex-1">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Tamper-Proof Ledger Signed</span>
                            <span className="text-[10px] text-white/50 block mt-0.5">Verification URL registered on hash chain</span>
                        </div>
                        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={handleDownload}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Download className="h-4 w-4 mr-1.5" /> Download PDF Certificate
                        </Button>
                        <Button
                            variant="outline"
                            className="border-white/10 text-white hover:bg-white/5"
                            onClick={() => {
                                navigator.clipboard.writeText(cert.qrVerificationUrl)
                                toast.success("Shareable URL copied to clipboard!")
                            }}
                        >
                            <ExternalLink className="h-4 w-4 mr-1.5" /> Copy Verification Link
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
