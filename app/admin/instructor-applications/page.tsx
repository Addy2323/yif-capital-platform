"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Award,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Linkedin,
  Globe,
  FileText,
  MessageSquare,
  Bookmark,
  Calendar,
  User,
  ExternalLink,
  GraduationCap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface UserMin {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  avatar: string | null
}

interface Application {
  id: string
  userId: string
  occupation: string
  company: string | null
  experienceYears: number
  expertise: string
  courseTitle: string
  courseCategory: string
  courseDescription: string
  education: string
  certifications: string | null
  linkedin: string | null
  website: string | null
  cvUrl: string | null
  certificatesUrl: string | null
  motivation: string
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "MORE_INFO"
  adminNote: string | null
  createdAt: string
  user: UserMin
  reviewer?: {
    id: string
    name: string
  } | null
  reviewedAt?: string | null
}

const CATEGORIES = [
  { value: "STOCK_MARKET", label: "Stock Market Investing" },
  { value: "BONDS_FIXED_INCOME", label: "Bond & Fixed Income Investing" },
  { value: "MUTUAL_FUNDS", label: "Mutual Funds Investing" },
  { value: "PERSONAL_FINANCE", label: "Personal Finance" },
  { value: "REAL_ESTATE_ALT", label: "Real Estate & Alternative Investments" },
  { value: "ENTREPRENEURSHIP_BUSINESS", label: "Entrepreneurship & Business Finance" },
  { value: "INSURANCE_RISK", label: "Insurance & Risk Management" },
  { value: "SACCOS_COOPERATIVE", label: "SACCOs & Cooperative Finance" }
]

export default function AdminInstructorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  
  // Dialog State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  // Edit Action form state
  const [actionStatus, setActionStatus] = useState<"PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "MORE_INFO">("PENDING")
  const [actionNote, setActionNote] = useState("")

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/instructor-applications")
      if (res.ok) {
        const data = await res.json()
        setApplications(data)
      } else {
        toast.error("Failed to load applications")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error connecting to server")
    } finally {
      setIsLoading(false)
    }
  }

  const openDetails = (app: Application) => {
    setSelectedApplication(app)
    setActionStatus(app.status)
    setActionNote(app.adminNote || "")
    setIsDetailsOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedApplication) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/instructor-applications/${selectedApplication.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionStatus,
          adminNote: actionNote
        })
      })

      if (res.ok) {
        toast.success(`Application updated to ${actionStatus}`)
        setIsDetailsOpen(false)
        fetchApplications()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to update application")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred")
    } finally {
      setUpdating(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.occupation.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Approved</Badge>
      case "REJECTED":
        return <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30">Rejected</Badge>
      case "UNDER_REVIEW":
        return <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">Under Review</Badge>
      case "MORE_INFO":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">More Info Needed</Badge>
      default:
        return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6 text-white p-4 sm:p-6 bg-[#060E1C] min-h-screen">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructor Applications</h1>
          <p className="text-white/60 mt-1">Review onboarding requests from prospective LMS instructors</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search by name, email, title, or occupation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#0B1528] border-white/10 text-white placeholder-white/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-white/40" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-[#0B1528] border-white/10 text-white">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#0B1528] border-white/10 text-white">
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="MORE_INFO">More Info Needed</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border border-white/10 bg-[#0B1528] overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center space-y-2 text-white/40">
              <Award className="h-12 w-12" />
              <p>No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-white/40">
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Expertise / Occupation</th>
                    <th className="px-6 py-4">Proposed Course</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date Applied</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-base">
                            {app.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{app.user.name}</div>
                            <div className="text-xs text-white/40">{app.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{app.occupation}</div>
                        <div className="text-xs text-white/40">{app.experienceYears} yrs experience</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        <div className="font-medium text-white">{app.courseTitle}</div>
                        <div className="text-xs text-white/40">
                          {CATEGORIES.find(c => c.value === app.courseCategory)?.label || app.courseCategory}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                      <td className="px-6 py-4 text-white/60">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetails(app)}
                          className="hover:bg-white/10 text-white/80 hover:text-white"
                        >
                          <Eye className="h-4 w-4 mr-1.5" /> Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      {selectedApplication && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-[#0B1528] border border-white/10 text-white">
            <DialogHeader className="border-b border-white/10 pb-4">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-blue-400" />
                Review Instructor Application
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Application submitted by {selectedApplication.user.name}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4 md:grid-cols-2">
              {/* Left Column: Applicant Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-2">Personal & Professional</h3>
                  <div className="rounded-lg bg-white/5 p-4 border border-white/5 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-white/40">Full Name</div>
                      <div className="font-medium">{selectedApplication.user.name}</div>
                      <div className="text-white/40">Email</div>
                      <div className="font-medium truncate">{selectedApplication.user.email}</div>
                      <div className="text-white/40">Phone</div>
                      <div className="font-medium">{selectedApplication.user.phoneNumber || "N/A"}</div>
                      <div className="text-white/40">Occupation</div>
                      <div className="font-medium">{selectedApplication.occupation}</div>
                      <div className="text-white/40">Company</div>
                      <div className="font-medium">{selectedApplication.company || "N/A"}</div>
                      <div className="text-white/40">Experience</div>
                      <div className="font-medium">{selectedApplication.experienceYears} Years</div>
                      <div className="text-white/40">Education</div>
                      <div className="font-medium">{selectedApplication.education}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-2">Areas of Expertise</h3>
                  <p className="text-sm rounded-lg bg-white/5 p-4 border border-white/5 text-white/80 leading-relaxed">
                    {selectedApplication.expertise}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-2">Motivation</h3>
                  <p className="text-sm rounded-lg bg-white/5 p-4 border border-white/5 text-white/80 leading-relaxed italic">
                    "{selectedApplication.motivation}"
                  </p>
                </div>
              </div>

              {/* Right Column: Course Idea & Files */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-2">Proposed Course</h3>
                  <div className="rounded-lg bg-white/5 p-4 border border-white/5 space-y-3">
                    <div>
                      <span className="block text-xs text-white/40 uppercase">Course Title</span>
                      <span className="font-semibold text-white">{selectedApplication.courseTitle}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-white/40 uppercase">Category</span>
                      <span className="font-medium text-white">
                        {CATEGORIES.find(c => c.value === selectedApplication.courseCategory)?.label || selectedApplication.courseCategory}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-white/40 uppercase">Description</span>
                      <p className="text-sm text-white/80 leading-relaxed mt-1">{selectedApplication.courseDescription}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-2">Qualifications & Uploads</h3>
                  <div className="rounded-lg bg-white/5 p-4 border border-white/5 space-y-4">
                    {selectedApplication.certifications && (
                      <div>
                        <span className="block text-xs text-white/40 uppercase">Certifications</span>
                        <span className="text-sm text-white/80">{selectedApplication.certifications}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      {selectedApplication.linkedin && (
                        <a href={selectedApplication.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                          <Linkedin className="h-4 w-4" /> LinkedIn <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {selectedApplication.website && (
                        <a href={selectedApplication.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                          <Globe className="h-4 w-4" /> Website <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {selectedApplication.cvUrl ? (
                        <a
                          href={selectedApplication.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded bg-blue-600/10 border border-blue-500/20 py-2.5 text-xs font-semibold text-blue-400 hover:bg-blue-600/20"
                        >
                          <FileText className="h-4 w-4" /> View CV / Resume
                        </a>
                      ) : (
                        <div className="flex items-center justify-center gap-2 rounded bg-white/5 border border-white/5 py-2.5 text-xs text-white/30">
                          CV Not Provided
                        </div>
                      )}

                      {selectedApplication.certificatesUrl ? (
                        <a
                          href={selectedApplication.certificatesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded bg-blue-600/10 border border-blue-500/20 py-2.5 text-xs font-semibold text-blue-400 hover:bg-blue-600/20"
                        >
                          <FileText className="h-4 w-4" /> View Certificates
                        </a>
                      ) : (
                        <div className="flex items-center justify-center gap-2 rounded bg-white/5 border border-white/5 py-2.5 text-xs text-white/30">
                          Certs Not Provided
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action panel (Review & Update status) */}
            <div className="border-t border-white/10 pt-6 mt-4 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">Review Actions</h3>
              <div className="grid gap-4 sm:grid-cols-3 items-end">
                <div className="space-y-2">
                  <Label htmlFor="reviewStatus">Application Status</Label>
                  <Select value={actionStatus} onValueChange={(val: any) => setActionStatus(val)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B1528] border-white/10 text-white">
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="MORE_INFO">More Info Needed</SelectItem>
                      <SelectItem value="APPROVED">Approve Application</SelectItem>
                      <SelectItem value="REJECTED">Reject Application</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="reviewNote">Review Note / Feedback</Label>
                  <Input
                    id="reviewNote"
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="Provide feedback or internal notes (e.g. reasons for rejection or requested details)..."
                    className="bg-white/5 border-white/10 text-white placeholder-white/30"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-white/10 pt-4 mt-6">
              <Button
                variant="ghost"
                onClick={() => setIsDetailsOpen(false)}
                className="text-white/60 hover:text-white hover:bg-white/5"
              >
                Close
              </Button>
              <Button
                disabled={updating}
                onClick={handleUpdateStatus}
                className={cn(
                  "text-white font-semibold",
                  actionStatus === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700" :
                  actionStatus === "REJECTED" ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
