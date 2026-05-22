"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, Download, BookOpen, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface Certificate {
    id: string
    issuedAt: string
    courseTitle: string
    expertName: string
    certificateUrl: string | null
}

export default function LmsCertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/lms/certificates")
                if (res.ok) {
                    const data = await res.json()
                    setCertificates(data.certificates || data || [])
                }
            } catch {
                // silently handle
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    Certificates <Award className="h-8 w-8 text-amber-500 dark:text-amber-400" />
                </h1>
                <p className="text-slate-500 dark:text-white/50 mt-1">Your earned learning credentials</p>
            </div>

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2].map(i => <div key={i} className="h-48 rounded-xl bg-gray-200 dark:bg-white/5 animate-pulse" />)}
                </div>
            ) : certificates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Award className="h-20 w-20 text-gray-200 dark:text-white/10" />
                    <div className="text-center">
                        <p className="text-xl font-semibold text-slate-500 dark:text-white/50">No certificates yet</p>
                        <p className="text-sm text-slate-400 dark:text-white/30 mt-1">Complete a course to earn your first certificate.</p>
                        <Link href="/lms/explore">
                            <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                                <BookOpen className="mr-2 h-4 w-4" /> Start Learning
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {certificates.map(cert => (
                        <Card key={cert.id} className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/30 dark:via-white/5 dark:to-white/5 border-amber-200 dark:border-amber-500/20 shadow-sm dark:shadow-none">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <Award className="h-10 w-10 text-amber-500 dark:text-amber-400" />
                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                                    </Badge>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm leading-snug">{cert.courseTitle}</p>
                                    <p className="text-xs text-slate-500 dark:text-white/50 mt-1">by {cert.expertName}</p>
                                </div>
                                <p className="text-[11px] text-amber-600 dark:text-amber-400/70">
                                    Issued {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                                        year: "numeric", month: "long", day: "numeric"
                                    })}
                                </p>
                                {cert.certificateUrl && (
                                    <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm" variant="outline" className="w-full bg-transparent border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/10">
                                            <Download className="mr-2 h-3.5 w-3.5" /> Download
                                        </Button>
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
