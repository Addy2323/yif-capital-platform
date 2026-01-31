"use client"

import { useState, useEffect } from "react"
import {
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    Save,
    ArrowLeft,
    Info
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import {
    PricingPlan,
    PricingFeature,
    getPricingPlans,
    savePricingPlans
} from "@/lib/pricing-data"

export default function AdminPricingPage() {
    const [plans, setPlans] = useState<PricingPlan[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<PricingPlan | null>(null)

    useEffect(() => {
        setPlans(getPricingPlans())
    }, [])

    const handleSave = () => {
        if (!editForm) return

        let newPlans: PricingPlan[]
        if (editingId === "new") {
            newPlans = [...plans, { ...editForm, id: Date.now().toString() }]
        } else {
            newPlans = plans.map(p => p.id === editingId ? editForm : p)
        }

        setPlans(newPlans)
        savePricingPlans(newPlans)
        setEditingId(null)
        setEditForm(null)
    }

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this plan?")) {
            const newPlans = plans.filter(p => p.id !== id)
            setPlans(newPlans)
            savePricingPlans(newPlans)
        }
    }

    const startEdit = (plan: PricingPlan) => {
        setEditingId(plan.id)
        setEditForm({ ...plan })
    }

    const startNew = () => {
        setEditingId("new")
        setEditForm({
            id: "new",
            name: "",
            price: "",
            description: "",
            features: [],
            cta: "Get Started",
            href: "/register",
            popular: false
        })
    }

    const addFeature = () => {
        if (!editForm) return
        setEditForm({
            ...editForm,
            features: [...editForm.features, { name: "", included: true }]
        })
    }

    const updateFeature = (index: number, field: keyof PricingFeature, value: any) => {
        if (!editForm) return
        const newFeatures = [...editForm.features]
        newFeatures[index] = { ...newFeatures[index], [field]: value }
        setEditForm({ ...editForm, features: newFeatures })
    }

    const removeFeature = (index: number) => {
        if (!editForm) return
        setEditForm({
            ...editForm,
            features: editForm.features.filter((_, i) => i !== index)
        })
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="text-white/60 hover:text-white">
                        <Link href="/admin/content">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Manage Pricing</h1>
                        <p className="text-white/60">Configure subscription plans and features</p>
                    </div>
                </div>
                <Button onClick={startNew} className="bg-gold text-navy hover:bg-gold/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Plan
                </Button>
            </div>

            <div className="grid gap-6">
                {plans.map((plan) => (
                    <Card key={plan.id} className="bg-white/5 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-white flex items-center gap-2">
                                    {plan.name}
                                    {plan.popular && (
                                        <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Popular
                                        </span>
                                    )}
                                </CardTitle>
                                <CardDescription className="text-white/60">{plan.description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => startEdit(plan)} className="text-white/60 hover:text-white hover:bg-white/10">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-2xl font-bold text-white">TZS {plan.price}</span>
                                {plan.period && <span className="text-sm text-white/40">{plan.period}</span>}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {plan.features.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-white/60">
                                        {f.included ? <Check className="h-3 w-3 text-gold" /> : <X className="h-3 w-3 text-white/20" />}
                                        {f.name}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit/New Dialog Overlay */}
            {editingId && editForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-2xl bg-navy border-white/10 max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle className="text-white">{editingId === "new" ? "Add New Plan" : "Edit Plan"}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-white">Plan Name</Label>
                                    <Input
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Price (TZS)</Label>
                                    <Input
                                        value={editForm.price}
                                        onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Period (e.g. /month)</Label>
                                    <Input
                                        value={editForm.period || ""}
                                        onChange={e => setEditForm({ ...editForm, period: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-8">
                                    <Switch
                                        checked={editForm.popular}
                                        onCheckedChange={v => setEditForm({ ...editForm, popular: v })}
                                    />
                                    <Label className="text-white">Mark as Popular</Label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white">Description</Label>
                                <Textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-white">Features</Label>
                                    <Button variant="outline" size="sm" onClick={addFeature} className="border-white/10 text-white hover:bg-white/5">
                                        <Plus className="mr-2 h-3 w-3" /> Add Feature
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {editForm.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Switch
                                                checked={f.included}
                                                onCheckedChange={v => updateFeature(i, "included", v)}
                                            />
                                            <Input
                                                value={f.name}
                                                onChange={e => updateFeature(i, "name", e.target.value)}
                                                className="flex-1 bg-white/5 border-white/10 text-white"
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-300">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="ghost" onClick={() => setEditingId(null)} className="text-white/60">Cancel</Button>
                                <Button onClick={handleSave} className="bg-gold text-navy hover:bg-gold/90">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Plan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
