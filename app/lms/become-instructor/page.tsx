"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  GraduationCap,
  Award,
  DollarSign,
  Users,
  TrendingUp,
  Briefcase,
  FileText,
  Upload,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Linkedin,
  Globe
} from "lucide-react"

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

interface Application {
  id: string
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
}

export default function BecomeInstructorPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [application, setApplication] = useState<Application | null>(null)
  const [showForm, setShowForm] = useState(false)

  // File Upload states
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvUploading, setCvUploading] = useState(false)
  const [cvUrl, setCvUrl] = useState("")

  const [certFile, setCertFile] = useState<File | null>(null)
  const [certUploading, setCertUploading] = useState(false)
  const [certUrl, setCertUrl] = useState("")

  // Form states
  const [formData, setFormData] = useState({
    occupation: "",
    company: "",
    experienceYears: "1",
    expertise: "",
    courseTitle: "",
    courseCategory: "",
    courseDescription: "",
    education: "",
    certifications: "",
    linkedin: "",
    website: "",
    motivation: "",
    agreement: false
  })

  useEffect(() => {
    fetchApplication()
  }, [])

  const fetchApplication = async () => {
    try {
      const res = await fetch("/api/lms/become-instructor")
      if (res.ok) {
        const data = await res.json()
        setApplication(data.application)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load application status")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, courseCategory: value }))
  }

  const handleFileUpload = async (file: File, folder: string): Promise<string> => {
    const form = new FormData()
    form.append("file", file)
    form.append("folder", folder)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Upload failed")
    }

    const data = await res.json()
    return data.url
  }

  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCvFile(file)
    setCvUploading(true)
    try {
      const url = await handleFileUpload(file, "cvs")
      setCvUrl(url)
      toast.success("CV uploaded successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to upload CV")
      setCvFile(null)
    } finally {
      setCvUploading(false)
    }
  }

  const handleCertChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCertFile(file)
    setCertUploading(true)
    try {
      const url = await handleFileUpload(file, "certificates")
      setCertUrl(url)
      toast.success("Certificate uploaded successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to upload Certificate")
      setCertFile(null)
    } finally {
      setCertUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreement) {
      toast.error("Please agree to the terms to submit your application")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/lms/become-instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          experienceYears: Number(formData.experienceYears),
          cvUrl,
          certificatesUrl: certUrl
        })
      })

      if (res.ok) {
        toast.success("Application submitted successfully!")
        fetchApplication()
        setShowForm(false)
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to submit application")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred during submission")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  // Render Submitted Application Status Page
  if (application && !showForm) {
    const statusConfig = {
      PENDING: {
        icon: Clock,
        color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
        label: "Pending Review",
        desc: "Thank you for applying. Our team will evaluate your application within 3–7 business days. You will receive a notification once reviewed."
      },
      UNDER_REVIEW: {
        icon: Loader2,
        color: "text-blue-500 bg-blue-500/10 border-blue-500/30 animate-pulse",
        label: "Under Review",
        desc: "Your application is currently being evaluated by our academic review board."
      },
      MORE_INFO: {
        icon: AlertCircle,
        color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
        label: "Needs More Information",
        desc: "The review team requires additional details before making a decision. Please read the note below."
      },
      APPROVED: {
        icon: CheckCircle,
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
        label: "Approved",
        desc: "Congratulations! Your application has been approved. You are now promoted to an Instructor."
      },
      REJECTED: {
        icon: XCircle,
        color: "text-rose-500 bg-rose-500/10 border-rose-500/30",
        label: "Rejected",
        desc: "Unfortunately, your application was not approved at this time. You can review the admin notes and apply again if needed."
      }
    }[application.status]

    const StatusIcon = statusConfig.icon

    return (
      <div className="mx-auto max-w-2xl py-4 sm:py-8">
        <Card className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1528] text-slate-900 dark:text-white shadow-sm dark:shadow-none">
          <CardHeader className="text-center p-4 sm:p-6">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border ${statusConfig.color}`}>
              <StatusIcon className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">{statusConfig.label}</CardTitle>
            <CardDescription className="text-slate-500 dark:text-white/60 mt-2">
              Application ID: {application.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-6">
            <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-4 border border-gray-200 dark:border-white/10">
              <p className="text-sm leading-relaxed text-slate-700 dark:text-white/80">{statusConfig.desc}</p>
            </div>

            {application.adminNote && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800 dark:text-white/90">Review Notes</Label>
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                  <p className="text-sm italic text-amber-600 dark:text-amber-300">"{application.adminNote}"</p>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-white/10 pt-6 space-y-4">
              <h3 className="font-semibold text-slate-800 dark:text-white/90">Your Submitted Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-white/70">
                <div>
                  <span className="block text-xs text-slate-400 dark:text-white/40 uppercase">Role / Occupation</span>
                  <span className="font-medium text-slate-950 dark:text-white">{application.occupation}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 dark:text-white/40 uppercase">Proposed Course Title</span>
                  <span className="font-medium text-slate-950 dark:text-white">{application.courseTitle}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 dark:text-white/40 uppercase">Category</span>
                  <span className="font-medium text-slate-950 dark:text-white">
                    {CATEGORIES.find(c => c.value === application.courseCategory)?.label || application.courseCategory}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 dark:text-white/40 uppercase">Experience</span>
                  <span className="font-medium text-slate-950 dark:text-white">{application.experienceYears} Years</span>
                </div>
              </div>
            </div>

            {(application.status === "REJECTED" || application.status === "MORE_INFO") && (
              <div className="pt-6 text-center">
                <Button
                  onClick={() => {
                    setFormData({
                      occupation: application.occupation,
                      company: application.company || "",
                      experienceYears: String(application.experienceYears),
                      expertise: application.expertise,
                      courseTitle: application.courseTitle,
                      courseCategory: application.courseCategory,
                      courseDescription: application.courseDescription,
                      education: application.education,
                      certifications: application.certifications || "",
                      linkedin: application.linkedin || "",
                      website: application.website || "",
                      motivation: application.motivation,
                      agreement: false
                    })
                    setCvUrl(application.cvUrl || "")
                    setCertUrl(application.certificatesUrl || "")
                    setShowForm(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg"
                >
                  {application.status === "MORE_INFO" ? "Update Details" : "Re-apply Now"}
                </Button>
              </div>
            )}

            {application.status === "APPROVED" && (
              <div className="pt-6 text-center">
                <Button
                  onClick={() => window.location.href = "/expert"}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium w-full py-2.5 rounded-lg"
                >
                  Go to Instructor Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render Landing Page
  if (!showForm) {
    return (
      <div className="mx-auto max-w-5xl py-4 sm:py-8 space-y-8 sm:space-y-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0B1528] border border-blue-500/20 px-4 py-10 text-center sm:px-12 sm:py-20">
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl"></div>

          <div className="relative mx-auto max-w-3xl space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Become a YIF LMS Instructor
            </h1>
            <p className="mx-auto max-w-xl text-sm sm:text-lg text-white/70 leading-relaxed">
              Share your expertise with thousands of learners across Tanzania and beyond. Join our community of professional instructors and earn income by creating high-quality investment, business, finance, and technology courses.
            </p>
            <div className="pt-2">
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">Why teach with YIF LMS?</h2>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: DollarSign,
                title: "Earn money from your courses",
                desc: "Get compensated for your knowledge. Earn competitive revenue shares from student course enrollments."
              },
              {
                icon: Award,
                title: "Build your professional brand",
                desc: "Establish yourself as a industry authority. Gain exposure to top-tier financial communities."
              },
              {
                icon: Users,
                title: "Reach thousands of learners",
                desc: "Inspire eager learners and investment pioneers across East Africa with high-impact finance education."
              },
              {
                icon: TrendingUp,
                title: "Track enrollment and earnings",
                desc: "Get access to a dedicated analytical dashboard providing real-time data on student growth."
              },
              {
                icon: Briefcase,
                title: "Receive instructor support",
                desc: "Get support with syllabus design, videography standards, course promotion, and quality assurance."
              },
              {
                icon: FileText,
                title: "LMS Authoring Toolkit",
                desc: "Create lessons, rich text summaries, upload slides/workbooks, quizzes, and structured curriculum easily."
              }
            ].map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1528] p-5 sm:p-6 space-y-3 shadow-sm dark:shadow-none hover:border-blue-500/50 dark:hover:border-blue-500/30 transition-all">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{benefit.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-white/60 leading-relaxed">{benefit.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Render Application Form
  return (
    <div className="mx-auto max-w-4xl py-4 sm:py-8">
      <Card className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1528] text-slate-900 dark:text-white shadow-sm dark:shadow-none">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl font-bold">Apply as an Instructor</CardTitle>
              <CardDescription className="text-slate-500 dark:text-white/60 text-xs sm:text-sm">
                Provide accurate details about your professional background and proposed course.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowForm(false)}
              className="text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 shrink-0"
            >
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-white/10 pb-2">Personal Information</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                  <Input
                    id="fullName"
                    value={user?.name || ""}
                    disabled
                    className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-500 dark:text-white/60 cursor-not-allowed text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-500 dark:text-white/60 cursor-not-allowed text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                  <Input
                    id="phone"
                    value={user?.phoneNumber || ""}
                    disabled
                    className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-500 dark:text-white/60 cursor-not-allowed text-sm"
                    placeholder="No phone number"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-white/10 pb-2">Professional Details</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="occupation" className="text-sm">Current Occupation *</Label>
                  <Input
                    id="occupation"
                    required
                    value={formData.occupation}
                    onChange={handleInputChange}
                    placeholder="e.g. Portfolio Manager"
                    className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g. YIF Capital"
                    className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceYears" className="text-sm">Years of Experience *</Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    min="0"
                    required
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise" className="text-sm">Areas of Expertise *</Label>
                <Textarea
                  id="expertise"
                  required
                  value={formData.expertise}
                  onChange={handleInputChange}
                  placeholder="e.g. Valuation modeling, bond yields, personal retirement planning, real estate investment trusts (REITs)"
                  className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 min-h-[80px] text-sm"
                />
              </div>
            </div>

            {/* Course Information */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-white/10 pb-2">Teaching Idea</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="courseTitle" className="text-sm">First Course Title Idea *</Label>
                  <Input
                    id="courseTitle"
                    required
                    value={formData.courseTitle}
                    onChange={handleInputChange}
                    placeholder="e.g. Introduction to DSE Stock Trading"
                    className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseCategory" className="text-sm">Primary Course Category *</Label>
                  <Select onValueChange={handleSelectChange} value={formData.courseCategory}>
                    <SelectTrigger className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white text-sm">
                      <SelectValue placeholder="Select course category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#0B1528] border-gray-200 dark:border-white/10 text-slate-900 dark:text-white">
                      {CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value} className="hover:bg-slate-100 dark:hover:bg-white/5">
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseDescription" className="text-sm">Course Overview & Objectives *</Label>
                <Textarea
                  id="courseDescription"
                  required
                  value={formData.courseDescription}
                  onChange={handleInputChange}
                  placeholder="Outline what students will learn, target audience, and the structure of this course."
                  className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 min-h-[100px] text-sm"
                />
              </div>
            </div>

            {/* Qualifications & File Uploads */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-white/10 pb-2">Qualifications & Supporting Docs</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="education" className="text-sm">Highest Level of Education *</Label>
                  <Input
                    id="education"
                    required
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="e.g. Master's in Finance"
                    className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications" className="text-sm">Professional Certifications</Label>
                  <Input
                    id="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                    placeholder="e.g. CFA, CPA (T), FMVA"
                    className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-1 text-sm">
                    <Linkedin className="h-4 w-4 text-blue-500" /> LinkedIn Profile Link
                  </Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/username"
                    className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-1 text-sm">
                    <Globe className="h-4 w-4 text-blue-500" /> Portfolio or Website Link
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://mywebsite.com"
                    className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 text-sm"
                  />
                </div>
              </div>

              {/* Uploads */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 border border-dashed border-gray-200 dark:border-white/10 rounded-lg p-4 bg-gray-50 dark:bg-white/5">
                  <Label htmlFor="cv" className="block text-sm font-semibold mb-2">Upload CV/Resume (PDF) *</Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white"
                      disabled={cvUploading}
                      onClick={() => document.getElementById("cvInput")?.click()}
                    >
                      {cvUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Choose File
                    </Button>
                    <input
                      id="cvInput"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleCvChange}
                    />
                    <span className="text-xs text-slate-500 dark:text-white/50 truncate max-w-[150px]">
                      {cvFile ? cvFile.name : cvUrl ? "CV Uploaded" : "No file chosen"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border border-dashed border-gray-200 dark:border-white/10 rounded-lg p-4 bg-gray-50 dark:bg-white/5">
                  <Label htmlFor="certs" className="block text-sm font-semibold mb-2">Certificates / Transcripts (PDF)</Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white"
                      disabled={certUploading}
                      onClick={() => document.getElementById("certInput")?.click()}
                    >
                      {certUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Choose File
                    </Button>
                    <input
                      id="certInput"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleCertChange}
                    />
                    <span className="text-xs text-slate-500 dark:text-white/50 truncate max-w-[150px]">
                      {certFile ? certFile.name : certUrl ? "Certificates Uploaded" : "No file chosen"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivation */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-white/10 pb-2">Motivation</h3>
              <div className="space-y-2">
                <Label htmlFor="motivation" className="text-sm">Why do you want to become a YIF LMS instructor? *</Label>
                <Textarea
                  id="motivation"
                  required
                  value={formData.motivation}
                  onChange={handleInputChange}
                  placeholder="Share your passion, target goals, and why you are a good fit to teach our financial community."
                  className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 min-h-[100px] text-sm"
                />
              </div>
            </div>

            {/* Agreement & Submit */}
            <div className="space-y-4 border-t border-gray-200 dark:border-white/10 pt-6">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreement"
                  checked={formData.agreement}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreement: checked === true }))}
                  className="border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white mt-1"
                />
                <Label htmlFor="agreement" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-white/70 leading-normal cursor-pointer">
                  I confirm that all information provided is accurate and correct.
                </Label>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting || cvUploading || certUploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto px-8 py-5 rounded-lg text-sm sm:text-base font-semibold shadow-lg shadow-blue-600/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
