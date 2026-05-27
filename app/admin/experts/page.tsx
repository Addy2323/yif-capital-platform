"use client"

import { useState, useEffect } from "react"
import {
    Search,
    Filter,
    Award,
    Clock,
    DollarSign,
    MapPin,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Eye,
    Trash2,
    Edit,
    Plus,
    UserPlus,
    BookOpen,
    Star,
    Globe,
    User
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
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface UserMin {
    id: string
    name: string
    email: string
    role: string
    phoneNumber?: string
}

interface ExpertProfile {
    id: string
    userId: string
    bio: string | null
    headline: string | null
    experienceYears: number
    cvUrl: string | null
    certificationsUrl: string | null
    nationalIdUrl: string | null
    nationalIdVerified: boolean
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"
    approvalNote: string | null
    rating: number
    totalReviews: number
    totalStudents: number
    totalEarnings: number
    netEarnings: number
    hourlyRate: number
    location: string | null
    isAvailableOnline: boolean
    isAvailablePhysical: boolean
    specializations: string[]
    user: {
        id: string
        name: string
        email: string
        phoneNumber: string | null
        avatar: string | null
        createdAt: string
    }
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

export default function AdminExpertsPage() {
    const [experts, setExperts] = useState<ExpertProfile[]>([])
    const [users, setUsers] = useState<UserMin[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    
    // Dialog states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    
    const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null)
    
    // Form fields for promotion/creation
    const [searchUserQuery, setSearchUserQuery] = useState("")
    const [selectedUserId, setSelectedUserId] = useState("")
    const [headline, setHeadline] = useState("")
    const [bio, setBio] = useState("")
    const [experienceYears, setExperienceYears] = useState(1)
    const [hourlyRate, setHourlyRate] = useState(50000)
    const [location, setLocation] = useState("Dar es Salaam")
    const [isAvailableOnline, setIsAvailableOnline] = useState(true)
    const [isAvailablePhysical, setIsAvailablePhysical] = useState(false)
    const [selectedSpecs, setSelectedSpecs] = useState<string[]>([])
    const [rating, setRating] = useState<number>(0)
    
    // Verification action fields
    const [approvalStatusAction, setApprovalStatusAction] = useState<"APPROVED" | "REJECTED" | "SUSPENDED">("APPROVED")
    const [approvalNote, setApprovalNote] = useState("")
    const [nationalIdVerified, setNationalIdVerified] = useState(false)

    useEffect(() => {
        fetchExperts()
        fetchUsers()
    }, [])

    const fetchExperts = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/experts")
            if (res.ok) {
                const data = await res.json()
                setExperts(data)
            } else {
                toast.error("Failed to load experts")
            }
        } catch (err) {
            console.error(err)
            toast.error("Error connecting to server")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users")
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleAddExpert = async () => {
        if (!selectedUserId) {
            toast.error("Please select a user to promote")
            return
        }
        if (selectedSpecs.length === 0) {
            toast.error("Please select at least one specialization")
            return
        }

        try {
            const res = await fetch("/api/admin/experts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedUserId,
                    headline,
                    bio,
                    experienceYears,
                    hourlyRate,
                    location,
                    isAvailableOnline,
                    isAvailablePhysical,
                    specializations: selectedSpecs
                })
            })

            if (res.ok) {
                toast.success("Expert promoted and verified successfully")
                setIsAddDialogOpen(false)
                resetForm()
                fetchExperts()
                fetchUsers()
            } else {
                const err = await res.json()
                toast.error(err.error || "Failed to promote expert")
            }
        } catch (err) {
            console.error(err)
            toast.error("An error occurred")
        }
    }

    const handleUpdateStatus = async () => {
        if (!selectedExpert) return

        try {
            const res = await fetch(`/api/admin/experts/${selectedExpert.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    approvalStatus: approvalStatusAction,
                    approvalNote,
                    nationalIdVerified
                })
            })

            if (res.ok) {
                toast.success(`Expert status updated to ${approvalStatusAction}`)
                setIsVerifyDialogOpen(false)
                setSelectedExpert(null)
                setApprovalNote("")
                fetchExperts()
            } else {
                toast.error("Failed to update expert status")
            }
        } catch (err) {
            console.error(err)
            toast.error("An error occurred")
        }
    }

    const handleEditExpert = async () => {
        if (!selectedExpert) return
        if (selectedSpecs.length === 0) {
            toast.error("Please select at least one specialization")
            return
        }

        try {
            const res = await fetch(`/api/admin/experts/${selectedExpert.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    headline,
                    bio,
                    experienceYears,
                    hourlyRate,
                    location,
                    isAvailableOnline,
                    isAvailablePhysical,
                    specializations: selectedSpecs,
                    rating
                })
            })

            if (res.ok) {
                toast.success("Expert profile updated successfully")
                setIsEditDialogOpen(false)
                setSelectedExpert(null)
                resetForm()
                fetchExperts()
            } else {
                toast.error("Failed to update expert profile")
            }
        } catch (err) {
            console.error(err)
            toast.error("An error occurred")
        }
    }

    const handleDeleteExpert = async () => {
        if (!selectedExpert) return

        try {
            const res = await fetch(`/api/admin/experts/${selectedExpert.id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast.success("Expert profile deleted and role reverted successfully")
                setIsDeleteDialogOpen(false)
                setSelectedExpert(null)
                fetchExperts()
                fetchUsers()
            } else {
                toast.error("Failed to delete expert")
            }
        } catch (err) {
            console.error(err)
            toast.error("An error occurred")
        }
    }

    const resetForm = () => {
        setSelectedUserId("")
        setSearchUserQuery("")
        setHeadline("")
        setBio("")
        setExperienceYears(1)
        setHourlyRate(50000)
        setLocation("Dar es Salaam")
        setIsAvailableOnline(true)
        setIsAvailablePhysical(false)
        setSelectedSpecs([])
        setRating(0)
    }

    const openAddDialog = () => {
        resetForm()
        setIsAddDialogOpen(true)
    }

    const openVerifyDialog = (expert: ExpertProfile) => {
        setSelectedExpert(expert)
        setApprovalStatusAction(expert.approvalStatus === "PENDING" ? "APPROVED" : expert.approvalStatus)
        setApprovalNote(expert.approvalNote || "")
        setNationalIdVerified(expert.nationalIdVerified)
        setIsVerifyDialogOpen(true)
    }

    const openEditDialog = (expert: ExpertProfile) => {
        setSelectedExpert(expert)
        setHeadline(expert.headline || "")
        setBio(expert.bio || "")
        setExperienceYears(expert.experienceYears)
        setHourlyRate(expert.hourlyRate)
        setLocation(expert.location || "Dar es Salaam")
        setIsAvailableOnline(expert.isAvailableOnline)
        setIsAvailablePhysical(expert.isAvailablePhysical)
        setSelectedSpecs(expert.specializations)
        setRating(expert.rating)
        setIsEditDialogOpen(true)
    }

    const openDeleteDialog = (expert: ExpertProfile) => {
        setSelectedExpert(expert)
        setIsDeleteDialogOpen(true)
    }

    const toggleSpec = (spec: string) => {
        setSelectedSpecs(prev =>
            prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
        )
    }

    // Filtered experts
    const filteredExperts = experts.filter(expert => {
        const matchesSearch = 
            expert.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expert.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (expert.headline && expert.headline.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStatus = 
            statusFilter === "all" || 
            expert.approvalStatus === statusFilter.toUpperCase()

        return matchesSearch && matchesStatus
    })

    // Users who can be promoted (not currently expert or admin)
    const eligibleUsers = users.filter(u => {
        const isNotExpertOrAdmin = u.role !== "expert" && u.role !== "admin"
        const matchesQuery = 
            u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
        return isNotExpertOrAdmin && matchesQuery
    })

    // Stats
    const totalCount = experts.length
    const pendingCount = experts.filter(e => e.approvalStatus === "PENDING").length
    const approvedCount = experts.filter(e => e.approvalStatus === "APPROVED").length
    const suspendedCount = experts.filter(e => e.approvalStatus === "SUSPENDED").length

    return (
        <div className="space-y-6 text-white bg-slate-900 min-h-screen p-1">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Investment Experts</h1>
                    <p className="text-white/60">
                        Verify, approve, and manage investment consultants and instructors.
                    </p>
                </div>
                <Button onClick={openAddDialog} className="bg-gold text-navy hover:bg-gold/90 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Promote User to Expert
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-slate-800/50 border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-white/60">Total Experts</CardTitle>
                        <Award className="h-4 w-4 text-gold" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-white/60">Pending Approval</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">{pendingCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-white/60">Verified Experts</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">{approvedCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-white/60">Suspended</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{suspendedCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <Input
                        placeholder="Search by name, email, or headline..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-white/40" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Grid of Expert Cards */}
            {isLoading ? (
                <div className="p-8 text-center text-white/60">Loading expert profiles...</div>
            ) : filteredExperts.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-white/10 rounded-lg">
                    <Award className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No Experts Found</h3>
                    <p className="text-white/40 mt-1">Try resetting your filters or promote a new user.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredExperts.map(expert => (
                        <Card key={expert.id} className="bg-slate-800/40 border-white/10 text-white overflow-hidden flex flex-col justify-between">
                            <div>
                                {/* Card Header with Status and Avatar */}
                                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                                            {expert.user.avatar ? (
                                                <img src={expert.user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                expert.user.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-sm">{expert.user.name}</h3>
                                            <p className="text-xs text-white/40 truncate max-w-[150px]">{expert.user.email}</p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            expert.approvalStatus === "APPROVED" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" :
                                            expert.approvalStatus === "PENDING" ? "border-amber-500/50 bg-amber-500/10 text-amber-400" :
                                            expert.approvalStatus === "SUSPENDED" ? "border-orange-500/50 bg-orange-500/10 text-orange-400" :
                                            "border-red-500/50 bg-red-500/10 text-red-400"
                                        )}
                                    >
                                        {expert.approvalStatus}
                                    </Badge>
                                </div>

                                {/* Body */}
                                <div className="p-5 space-y-4">
                                    {/* Headline / Bio */}
                                    <div>
                                        <p className="text-xs font-semibold text-gold tracking-wider uppercase mb-1">
                                            {expert.headline || "Expert Consultant"}
                                        </p>
                                        <p className="text-sm text-white/70 line-clamp-3 italic">
                                            "{expert.bio || "No biography provided yet."}"
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3 text-xs border-y border-white/5 py-3 bg-white/5 rounded-md px-3">
                                        <div>
                                            <span className="text-white/40 block">Gross Earnings</span>
                                            <span className="font-semibold text-white tabular-nums">
                                                {expert.totalEarnings.toLocaleString()} TZS
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-white/40 block">Net (80%)</span>
                                            <span className="font-semibold text-emerald-400 tabular-nums">
                                                {(expert.netEarnings || Math.round(expert.totalEarnings * 0.8)).toLocaleString()} TZS
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-white/40 block">Hourly Rate</span>
                                            <span className="font-semibold text-white/70 tabular-nums">
                                                {expert.hourlyRate.toLocaleString()} TZS
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-white/40 block">Experience</span>
                                            <span className="font-semibold">{expert.experienceYears} Years</span>
                                        </div>
                                        <div>
                                            <span className="text-white/40 block">Rating</span>
                                            <span className="font-semibold text-amber-400 flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                                                {expert.rating || "N/A"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-white/40 block">Location</span>
                                            <span className="font-semibold truncate block flex items-center gap-1">
                                                <MapPin className="h-3 w-3 text-white/40 shrink-0" />
                                                {expert.location || "Dar es Salaam"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Specializations */}
                                    <div>
                                        <span className="text-xs text-white/40 block mb-1.5">Specializations</span>
                                        <div className="flex flex-wrap gap-1">
                                            {expert.specializations.map(s => {
                                                const cat = CATEGORIES.find(c => c.value === s)
                                                return (
                                                    <Badge key={s} variant="outline" className="text-[10px] bg-slate-900 border-white/10 text-white/80">
                                                        {cat?.label || s}
                                                    </Badge>
                                                )
                                            })}
                                            {expert.specializations.length === 0 && (
                                                <span className="text-xs text-white/30 italic">None selected</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Availability Toggles Show */}
                                    <div className="flex gap-4 text-xs text-white/50">
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className={cn("h-3.5 w-3.5", expert.isAvailableOnline ? "text-emerald-400" : "text-white/20")} /> Online
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className={cn("h-3.5 w-3.5", expert.isAvailablePhysical ? "text-emerald-400" : "text-white/20")} /> In-Person
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className={cn("h-3.5 w-3.5", expert.nationalIdVerified ? "text-emerald-400" : "text-white/20")} /> ID Verified
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="p-4 border-t border-white/5 bg-slate-800/30 flex gap-2 justify-between">
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => openVerifyDialog(expert)}
                                        size="sm"
                                        variant="outline"
                                        className="border-white/10 bg-transparent hover:bg-gold/10 text-white text-xs h-8 px-2.5"
                                    >
                                        <Eye className="h-3.5 w-3.5 mr-1 text-gold" /> Verify / Status
                                    </Button>
                                    <Button
                                        onClick={() => openEditDialog(expert)}
                                        size="sm"
                                        variant="outline"
                                        className="border-white/10 bg-transparent hover:bg-white/5 text-white text-xs h-8 px-2.5"
                                    >
                                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                                    </Button>
                                </div>
                                <Button
                                    onClick={() => openDeleteDialog(expert)}
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500/20 bg-transparent text-red-400 hover:bg-red-500/10 text-xs h-8 px-2.5"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Dialog 1: Promote User to Expert */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl overflow-y-auto max-h-[85vh]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Plus className="text-gold h-5 w-5" /> Promote User to Expert
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                            Promote an existing customer and create their expert profile.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        {/* Searchable User Selector */}
                        <div className="space-y-1.5">
                            <Label className="text-white/80">Select User</Label>
                            <Input
                                placeholder="Search users by name or email..."
                                value={searchUserQuery}
                                onChange={(e) => setSearchUserQuery(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                            {searchUserQuery && (
                                <div className="border border-white/10 bg-slate-800 rounded-md max-h-40 overflow-y-auto p-1 divide-y divide-white/5">
                                    {eligibleUsers.length === 0 ? (
                                        <div className="p-2 text-center text-xs text-white/40">No eligible users found</div>
                                    ) : (
                                        eligibleUsers.map(u => (
                                            <button
                                                key={u.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedUserId(u.id)
                                                    setSearchUserQuery("")
                                                    toast.success(`Selected user: ${u.name}`)
                                                }}
                                                className="w-full text-left p-2 hover:bg-white/5 text-xs rounded transition-colors flex items-center justify-between"
                                            >
                                                <span>{u.name} ({u.email})</span>
                                                <Badge variant="outline" className="text-[10px] uppercase border-white/10 text-white/50">{u.role}</Badge>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                            {selectedUserId && (
                                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-xs flex items-center justify-between">
                                    <span>Selected User ID: {users.find(u => u.id === selectedUserId)?.name || selectedUserId}</span>
                                    <button onClick={() => setSelectedUserId("")} className="text-[10px] underline hover:text-white">Change</button>
                                </div>
                            )}
                        </div>

                        {/* Specializations Grid checkboxes */}
                        <div className="space-y-1.5">
                            <Label className="text-white/80">Specializations (Select multiple)</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white/5 p-3 rounded border border-white/10">
                                {CATEGORIES.map(cat => (
                                    <label key={cat.value} className="flex items-center gap-2 text-xs cursor-pointer hover:text-white/80">
                                        <input
                                            type="checkbox"
                                            checked={selectedSpecs.includes(cat.value)}
                                            onChange={() => toggleSpec(cat.value)}
                                            className="accent-gold rounded h-3.5 w-3.5 cursor-pointer"
                                        />
                                        <span>{cat.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Bio, Headline */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="headline" className="text-white/80">Headline / Title</Label>
                                <Input
                                    id="headline"
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    placeholder="e.g. Senior Stock Broker"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="exp" className="text-white/80">Years of Experience</Label>
                                <Input
                                    id="exp"
                                    type="number"
                                    value={experienceYears}
                                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                                    min="0"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="rate" className="text-white/80">Hourly Consultation Rate (TZS)</Label>
                                <Input
                                    id="rate"
                                    type="number"
                                    value={hourlyRate}
                                    onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                                    min="0"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="loc" className="text-white/80">Location / City</Label>
                                <Input
                                    id="loc"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Dar es Salaam, Tanzania"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="bio" className="text-white/80">Biography (Bio)</Label>
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                className="w-full rounded-md bg-white/5 border border-white/10 p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold"
                                placeholder="Describe the expert's qualifications and services..."
                            />
                        </div>

                        {/* Availability online/physical switches */}
                        <div className="flex gap-6 bg-white/5 p-3 rounded border border-white/10">
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isAvailableOnline}
                                    onChange={(e) => setIsAvailableOnline(e.target.checked)}
                                    className="accent-gold h-4 w-4"
                                />
                                <span>Available for Online Consultations</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isAvailablePhysical}
                                    onChange={(e) => setIsAvailablePhysical(e.target.checked)}
                                    className="accent-gold h-4 w-4"
                                />
                                <span>Available for In-Person Consultations</span>
                            </label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-white/10 bg-transparent text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleAddExpert} className="bg-gold text-navy hover:bg-gold/90 font-semibold">
                            Confirm Promotion
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog 2: Verify Expert / Status Action */}
            <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Eye className="text-gold h-5 w-5" /> Verify Expert Profile
                        </DialogTitle>
                        <DialogDescription className="text-white/60 text-xs">
                            Verify uploaded credentials and update approval status for {selectedExpert?.user.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        {/* Verification details */}
                        <div className="space-y-2 text-xs bg-white/5 p-3 rounded border border-white/10">
                            <h4 className="font-semibold text-gold">Uploaded Documents</h4>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center py-1 border-b border-white/5">
                                    <span>Curriculum Vitae (CV)</span>
                                    {selectedExpert?.cvUrl ? (
                                        <a href={selectedExpert.cvUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">View CV</a>
                                    ) : (
                                        <span className="text-white/30 italic">Not Uploaded</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-white/5">
                                    <span>Certifications</span>
                                    {selectedExpert?.certificationsUrl ? (
                                        <a href={selectedExpert.certificationsUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">View Certifications</a>
                                    ) : (
                                        <span className="text-white/30 italic">Not Uploaded</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span>National ID / Passport</span>
                                    {selectedExpert?.nationalIdUrl ? (
                                        <a href={selectedExpert.nationalIdUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">View Document</a>
                                    ) : (
                                        <span className="text-white/30 italic">Not Uploaded</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ID Verification Switch */}
                        <label className="flex items-center gap-2 text-xs cursor-pointer bg-white/5 p-2 rounded border border-white/10">
                            <input
                                type="checkbox"
                                checked={nationalIdVerified}
                                onChange={(e) => setNationalIdVerified(e.target.checked)}
                                className="accent-gold h-4 w-4"
                            />
                            <span className="font-semibold">Mark National ID as Verified</span>
                        </label>

                        {/* Status Select */}
                        <div className="space-y-1.5">
                            <Label className="text-white/80 text-xs">Set Verification Status</Label>
                            <select
                                value={approvalStatusAction}
                                onChange={(e) => setApprovalStatusAction(e.target.value as any)}
                                className="w-full bg-slate-800 border border-white/10 text-white rounded p-2 text-sm focus:outline-none"
                            >
                                <option value="APPROVED">APPROVED (Active & Listed)</option>
                                <option value="PENDING">PENDING (Awaiting Review)</option>
                                <option value="REJECTED">REJECTED (Deny & Demote to Customer)</option>
                                <option value="SUSPENDED">SUSPENDED (Temporarily Deactivate)</option>
                            </select>
                        </div>

                        {/* Approval Note */}
                        <div className="space-y-1.5">
                            <Label htmlFor="note" className="text-white/80 text-xs">Approval/Rejection Note</Label>
                            <textarea
                                id="note"
                                value={approvalNote}
                                onChange={(e) => setApprovalNote(e.target.value)}
                                placeholder="Provide context, feedback, or missing credentials requirements..."
                                rows={3}
                                className="w-full rounded-md bg-white/5 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)} className="border-white/10 bg-transparent text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateStatus} className="bg-gold text-navy hover:bg-gold/90 font-semibold">
                            Save Verification
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog 3: Edit Expert Profile details */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl overflow-y-auto max-h-[85vh]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Edit className="text-gold h-5 w-5" /> Edit Expert Profile
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                            Modify consultation rates, categories, and bio details for {selectedExpert?.user.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        {/* Specializations Grid checkboxes */}
                        <div className="space-y-1.5">
                            <Label className="text-white/80">Specializations</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white/5 p-3 rounded border border-white/10">
                                {CATEGORIES.map(cat => (
                                    <label key={cat.value} className="flex items-center gap-2 text-xs cursor-pointer hover:text-white/80">
                                        <input
                                            type="checkbox"
                                            checked={selectedSpecs.includes(cat.value)}
                                            onChange={() => toggleSpec(cat.value)}
                                            className="accent-gold rounded h-3.5 w-3.5 cursor-pointer"
                                        />
                                        <span>{cat.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Bio, Headline */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-headline" className="text-white/80">Headline / Title</Label>
                                <Input
                                    id="edit-headline"
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-exp" className="text-white/80">Years of Experience</Label>
                                <Input
                                    id="edit-exp"
                                    type="number"
                                    value={experienceYears}
                                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                                    min="0"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-rate" className="text-white/80">Hourly Rate (TZS)</Label>
                                <Input
                                    id="edit-rate"
                                    type="number"
                                    value={hourlyRate}
                                    onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                                    min="0"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-loc" className="text-white/80">Location / City</Label>
                                <Input
                                    id="edit-loc"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-rating" className="text-white/80">Rating (0.0 - 5.0)</Label>
                                <Input
                                    id="edit-rating"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    value={rating}
                                    onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-bio" className="text-white/80">Biography (Bio)</Label>
                            <textarea
                                id="edit-bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                className="w-full rounded-md bg-white/5 border border-white/10 p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold"
                            />
                        </div>

                        {/* Availability switches */}
                        <div className="flex gap-6 bg-white/5 p-3 rounded border border-white/10">
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isAvailableOnline}
                                    onChange={(e) => setIsAvailableOnline(e.target.checked)}
                                    className="accent-gold h-4 w-4"
                                />
                                <span>Available for Online Consultations</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isAvailablePhysical}
                                    onChange={(e) => setIsAvailablePhysical(e.target.checked)}
                                    className="accent-gold h-4 w-4"
                                />
                                <span>Available for In-Person Consultations</span>
                            </label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-white/10 bg-transparent text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleEditExpert} className="bg-gold text-navy hover:bg-gold/90 font-semibold">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog 4: Delete Confirmation */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-400">
                            <Trash2 className="h-5 w-5" /> Delete Expert Profile
                        </DialogTitle>
                        <DialogDescription className="text-white/60 text-xs">
                            Are you sure you want to delete {selectedExpert?.user.name} from the Expert list?
                            Their user role will be reverted to 'FREE'. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-white/10 bg-transparent text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteExpert} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                            Delete & Revert Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
