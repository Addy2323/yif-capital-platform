"use client"

import { useState, useEffect } from "react"
import {
    CreditCard,
    TrendingUp,
    Users,
    Calendar,
    Download,
    Filter,
    Search,
    CheckCircle2,
    AlertCircle,
    Clock,
    ArrowUpRight,
    Edit2,
    Settings2,
    Plus,
    Trash2,
    XCircle,
    CheckCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    getSubscriptionStats,
    getAllUsers,
    exportToCSV,
    type SubscriptionStats,
    updateUser,
} from "@/lib/admin-service"
import { fetchPricingPlans, updatePricingPlanAPI, type PricingPlan as SubscriptionPlan, initialPlans } from "@/lib/pricing-data"
import { formatCurrency } from "@/lib/payment-service"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AdminSubscriptionsPage() {
    const [stats, setStats] = useState<SubscriptionStats | null>(null)
    const [users, setUsers] = useState<any[]>([])
    const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans)
    const [searchQuery, setSearchQuery] = useState("")
    const [planFilter, setPlanFilter] = useState("all")

    // Edit User Subscription State
    const [editingUser, setEditingUser] = useState<any>(null)
    const [userForm, setUserForm] = useState({
        plan: "pro" as "pro" | "institutional",
        status: "active" as "active" | "cancelled" | "expired",
        expiresAt: ""
    })

    // Edit Plans State
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
    const [planForm, setPlanForm] = useState<{
        price: number;
        description: string;
        features: { name: string; included: boolean }[];
    } | null>(null)

    const fetchData = async () => {
        const fetchedPlans = await fetchPricingPlans()
        setPlans(fetchedPlans)

        // Calculate stats manually using fetched plans to ensure correctness
        const allUsers = getAllUsers()
        const subscribedUsers = allUsers.filter(u => u.subscription?.plan && u.subscription.plan !== "free")
        setUsers(subscribedUsers)

        const proUsers = allUsers.filter((u) => u.subscription?.plan === "pro").length
        const institutionalUsers = allUsers.filter((u) => u.subscription?.plan === "institutional").length
        const proPrice = fetchedPlans.find(p => p.id === "pro")?.price || 49000
        const institutionalPrice = fetchedPlans.find(p => p.id === "institutional")?.price || 299000

        setStats({
            totalUsers: allUsers.length,
            freeUsers: allUsers.length - proUsers - institutionalUsers,
            proUsers,
            institutionalUsers,
            monthlyRevenue: proUsers * proPrice + institutionalUsers * institutionalPrice,
            totalRevenue: (proUsers * proPrice + institutionalUsers * institutionalPrice) * 6,
        })
    }

    useEffect(() => {
        fetchData()
    }, [])

    const filteredSubscriptions = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesPlan = planFilter === "all" || user.subscription?.plan === planFilter

        return matchesSearch && matchesPlan
    })

    const handleExport = () => {
        const proPrice = plans.find(p => p.id === "pro")?.price || 49000
        const institutionalPrice = plans.find(p => p.id === "institutional")?.price || 299000

        const data = users.map(u => ({
            name: u.name,
            email: u.email,
            plan: u.subscription?.plan,
            status: u.subscription?.status,
            expiresAt: u.subscription?.expiresAt,
            revenue: u.subscription?.plan === "pro" ? proPrice : institutionalPrice
        }))
        exportToCSV(data, "subscriptions_export")
    }

    const handleUpdateUser = () => {
        if (!editingUser) return
        const success = updateUser(editingUser.email, {
            role: userForm.plan as any,
            subscription: {
                ...editingUser.subscription,
                plan: userForm.plan,
                status: userForm.status,
                expiresAt: userForm.expiresAt ? new Date(userForm.expiresAt).toISOString() : undefined
            }
        })
        if (success) {
            toast.success("Subscription updated successfully")
            setEditingUser(null)
            fetchData()
        } else {
            toast.error("Failed to update subscription")
        }
    }

    const handleUpdatePlan = async () => {
        if (!editingPlan || !planForm) return
        const success = await updatePricingPlanAPI(editingPlan.id, planForm)
        if (success) {
            toast.success("Plan updated successfully")
            setEditingPlan(null)
            setPlanForm(null)
            fetchData()
        } else {
            toast.error("Failed to update plan")
        }
    }

    const handleAddFeature = () => {
        if (!planForm) return
        setPlanForm({
            ...planForm,
            features: [...planForm.features, { name: "", included: true }]
        })
    }

    const handleRemoveFeature = (index: number) => {
        if (!planForm) return
        const newFeatures = [...planForm.features]
        newFeatures.splice(index, 1)
        setPlanForm({ ...planForm, features: newFeatures })
    }

    const handleUpdateFeature = (index: number, updates: any) => {
        if (!planForm) return
        const newFeatures = [...planForm.features]
        newFeatures[index] = { ...newFeatures[index], ...updates }
        setPlanForm({ ...planForm, features: newFeatures })
    }

    if (!stats) return null

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Subscription Management</h1>
                    <p className="text-white/60">Monitor revenue and manage user subscriptions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isPlanModalOpen} onOpenChange={(open) => {
                        setIsPlanModalOpen(open)
                        if (!open) {
                            setEditingPlan(null)
                            setPlanForm(null)
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-gold/50 bg-gold/10 text-gold hover:bg-gold/20">
                                <Settings2 className="mr-2 h-4 w-4" />
                                Manage Plans
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl h-[80vh] overflow-hidden !flex !flex-col !p-0 !gap-0">
                            <div className="p-6 pb-2">
                                <DialogHeader>
                                    <DialogTitle>Manage Subscription Plans</DialogTitle>
                                    <DialogDescription className="text-white/40">
                                        Edit pricing plans, descriptions, and features shown on the website.
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-2">
                                <div className="space-y-4">
                                    {!editingPlan ? (
                                        plans.map(plan => (
                                            <div key={plan.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5">
                                                <div>
                                                    <p className="font-medium capitalize">{plan.name}</p>
                                                    <p className="text-sm text-white/40">{plan.currency} {formatCurrency(plan.price)}/mo</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-gold hover:text-gold hover:bg-gold/10"
                                                    onClick={() => {
                                                        setEditingPlan(plan)
                                                        setPlanForm({
                                                            price: plan.price,
                                                            description: plan.description || "",
                                                            features: plan.features.map(f => (typeof f === 'string' ? { name: f, included: true } : f))
                                                        })
                                                    }}
                                                >
                                                    <Edit2 className="h-4 w-4 mr-1" />
                                                    Edit Plan
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                                            <div className="flex items-center justify-between sticky top-0 bg-slate-900 py-2 z-10">
                                                <h3 className="text-lg font-semibold text-gold">Editing {editingPlan.name} Plan</h3>
                                                <Button variant="ghost" size="sm" onClick={() => {
                                                    setEditingPlan(null)
                                                    setPlanForm(null)
                                                }}>Back to Plans</Button>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="planPrice">Monthly Price ({editingPlan.currency})</Label>
                                                    <Input
                                                        id="planPrice"
                                                        type="number"
                                                        value={planForm?.price}
                                                        onChange={(e) => setPlanForm(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                                                        className="bg-slate-950 border-white/10"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="planDesc">Plan Description</Label>
                                                    <Input
                                                        id="planDesc"
                                                        value={planForm?.description}
                                                        onChange={(e) => setPlanForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                                                        className="bg-slate-950 border-white/10"
                                                        placeholder="Brief internal description"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label>Features List</Label>
                                                    <Button size="sm" variant="outline" className="h-8 border-gold/50 text-gold" onClick={handleAddFeature}>
                                                        <Plus className="h-4 w-4 mr-1" /> Add Feature
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {planForm?.features.map((feature, idx) => (
                                                        <div key={idx} className="flex gap-2 items-center group">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className={`h-8 w-8 ${feature.included ? 'text-green-500' : 'text-red-500 hover:text-red-400'}`}
                                                                onClick={() => handleUpdateFeature(idx, { included: !feature.included })}
                                                            >
                                                                {feature.included ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                                            </Button>
                                                            <Input
                                                                value={feature.name}
                                                                onChange={(e) => handleUpdateFeature(idx, { name: e.target.value })}
                                                                className="flex-1 bg-slate-950 border-white/10 h-8 text-sm"
                                                                placeholder="Feature name..."
                                                            />
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => handleRemoveFeature(idx)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {editingPlan && (
                                <div className="p-6 border-t border-white/10 bg-slate-900">
                                    <div className="flex gap-3">
                                        <Button className="flex-1 bg-gold text-slate-950 hover:bg-gold/90" onClick={handleUpdatePlan}>
                                            Save Changes
                                        </Button>
                                        <Button variant="outline" className="flex-1 border-white/10" onClick={() => {
                                            setEditingPlan(null)
                                            setPlanForm(null)
                                        }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white/60">Monthly Recurring Revenue</p>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-white">TZS {formatCurrency(stats.monthlyRevenue)}</span>
                            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3" /> +12.5% from last month
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white/60">Active Pro Users</p>
                            <Badge className="bg-gold/20 text-gold border-gold/20">PRO</Badge>
                        </div>
                        <div className="mt-2 text-2xl font-bold text-white">{stats.proUsers}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white/60">Institutional Clients</p>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">INSTITUTIONAL</Badge>
                        </div>
                        <div className="mt-2 text-2xl font-bold text-white">{stats.institutionalUsers}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <Input
                        placeholder="Search subscribers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-white/40" />
                    <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                        <option value="all">All Plans</option>
                        <option value="pro">Pro</option>
                        <option value="institutional">Institutional</option>
                    </select>
                </div>
            </div>

            {/* Subscriptions Table */}
            <Card className="bg-white/5 border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-sm font-medium text-white/60">Subscriber</th>
                                <th className="p-4 text-sm font-medium text-white/60">Plan</th>
                                <th className="p-4 text-sm font-medium text-white/60">Status</th>
                                <th className="p-4 text-sm font-medium text-white/60">Expires At</th>
                                <th className="p-4 text-sm font-medium text-white/60">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredSubscriptions.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="text-sm font-medium text-white">{user.name}</p>
                                            <p className="text-xs text-white/40">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge
                                            variant="outline"
                                            className={user.subscription?.plan === "institutional" ? "border-blue-500/50 text-blue-400" : "border-gold/50 text-gold"}
                                        >
                                            {user.subscription?.plan?.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {user.subscription?.status === "active" ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            )}
                                            <span className="text-sm text-white/80 capitalize">{user.subscription?.status}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-white/40">
                                            <Clock className="h-3.5 w-3.5" />
                                            {user.subscription?.expiresAt ? new Date(user.subscription.expiresAt).toLocaleDateString() : "N/A"}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-white/60 hover:text-white hover:bg-white/10"
                                            onClick={() => {
                                                setEditingUser(user)
                                                setUserForm({
                                                    plan: user.subscription?.plan || "pro",
                                                    status: user.subscription?.status || "active",
                                                    expiresAt: user.subscription?.expiresAt ? new Date(user.subscription.expiresAt).toISOString().split('T')[0] : ""
                                                })
                                            }}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredSubscriptions.length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-white/40">No active subscriptions found.</p>
                    </div>
                )}
            </Card>

            {/* Edit User Subscription Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Subscription</DialogTitle>
                        <DialogDescription className="text-white/40">
                            Update subscription details for {editingUser?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="plan">Subscription Plan</Label>
                            <Select
                                value={userForm.plan}
                                onValueChange={(val: any) => setUserForm({ ...userForm, plan: val })}
                            >
                                <SelectTrigger className="bg-slate-950 border-white/10">
                                    <SelectValue placeholder="Select plan" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="pro">Pro</SelectItem>
                                    <SelectItem value="institutional">Institutional</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={userForm.status}
                                onValueChange={(val: any) => setUserForm({ ...userForm, status: val })}
                            >
                                <SelectTrigger className="bg-slate-950 border-white/10">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expiresAt">Expiry Date</Label>
                            <Input
                                id="expiresAt"
                                type="date"
                                value={userForm.expiresAt}
                                onChange={(e) => setUserForm({ ...userForm, expiresAt: e.target.value })}
                                className="bg-slate-950 border-white/10"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" className="border-white/10" onClick={() => setEditingUser(null)}>
                            Cancel
                        </Button>
                        <Button className="bg-gold text-slate-950 hover:bg-gold/90" onClick={handleUpdateUser}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

