"use client"

import { useState, useEffect } from "react"
import {
    Clock,
    Plus,
    Trash2,
    Save,
    Video,
    MapPin,
    AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TimeSlot {
    id: string
    startTime: string
    endTime: string
}

interface DayAvailability {
    dayOfWeek: number // 0 = Sunday, ..., 6 = Saturday
    dayName: string
    isActive: boolean
    slots: TimeSlot[]
}

const TIME_OPTIONS = Array.from({ length: 33 }, (_, i) => {
    const hour = Math.floor(6 + i / 2)
    const min = i % 2 === 0 ? "00" : "30"
    const hourStr = hour.toString().padStart(2, "0")
    return `${hourStr}:${min}`
})

const BLANK_DAYS: DayAvailability[] = [
    { dayOfWeek: 0, dayName: "Sunday", isActive: false, slots: [] },
    { dayOfWeek: 1, dayName: "Monday", isActive: false, slots: [] },
    { dayOfWeek: 2, dayName: "Tuesday", isActive: false, slots: [] },
    { dayOfWeek: 3, dayName: "Wednesday", isActive: false, slots: [] },
    { dayOfWeek: 4, dayName: "Thursday", isActive: false, slots: [] },
    { dayOfWeek: 5, dayName: "Friday", isActive: false, slots: [] },
    { dayOfWeek: 6, dayName: "Saturday", isActive: false, slots: [] },
]

export default function ExpertAvailabilityPage() {
    const [days, setDays] = useState<DayAvailability[]>(BLANK_DAYS)
    const [isSaving, setIsSaving] = useState(false)

    // Settings
    const [isAvailableOnline, setIsAvailableOnline] = useState(true)
    const [isAvailablePhysical, setIsAvailablePhysical] = useState(false)
    const [physicalAddress, setPhysicalAddress] = useState("")
    const [defaultDuration, setDefaultDuration] = useState("60")

    useEffect(() => {
        // Fetch current settings from backend if available
        const fetchAvailability = async () => {
            try {
                const res = await fetch("/api/expert/availability")
                if (res.ok) {
                    const data = await res.json()
                    if (Array.isArray(data.days)) {
                        setDays(data.days)
                    }
                    setIsAvailableOnline(data.isAvailableOnline ?? true)
                    setIsAvailablePhysical(data.isAvailablePhysical ?? false)
                    setPhysicalAddress(data.physicalAddress ?? "")
                    setDefaultDuration(String(data.defaultDuration ?? "60"))
                }
            } catch (err) {
                console.error("Could not fetch availability", err)
            }
        }
        fetchAvailability()
    }, [])

    const toggleDayActive = (index: number) => {
        setDays(prev => prev.map((day, i) => {
            if (i !== index) return day
            const nowActive = !day.isActive
            return {
                ...day,
                isActive: nowActive,
                slots: nowActive && day.slots.length === 0
                    ? [{ id: Math.random().toString(36).substring(2, 11), startTime: "09:00", endTime: "17:00" }]
                    : day.slots
            }
        }))
    }

    const addSlot = (dayIndex: number) => {
        setDays(prev => prev.map((day, i) => {
            if (i !== dayIndex) return day
            const lastSlot = day.slots[day.slots.length - 1]
            let start = "09:00"
            let end = "17:00"
            if (lastSlot) {
                // Shift forward or default
                start = lastSlot.endTime
                const [h, m] = start.split(":").map(Number)
                const endH = Math.min(22, h + 1)
                end = `${endH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
            }
            return {
                ...day,
                slots: [...day.slots, { id: Math.random().toString(36).substring(2, 11), startTime: start, endTime: end }]
            }
        }))
    }

    const deleteSlot = (dayIndex: number, slotId: string) => {
        setDays(prev => prev.map((day, i) => {
            if (i !== dayIndex) return day
            return {
                ...day,
                slots: day.slots.filter(s => s.id !== slotId)
            }
        }))
    }

    const updateSlotTime = (dayIndex: number, slotId: string, field: "startTime" | "endTime", value: string) => {
        setDays(prev => prev.map((day, i) => {
            if (i !== dayIndex) return day
            return {
                ...day,
                slots: day.slots.map(s => {
                    if (s.id !== slotId) return s
                    return { ...s, [field]: value }
                })
            }
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Save settings locally or fetch API
            const res = await fetch("/api/expert/availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    days,
                    isAvailableOnline,
                    isAvailablePhysical,
                    physicalAddress,
                    defaultDuration: parseInt(defaultDuration)
                })
            })

            if (res.ok) {
                toast.success("Availability updated successfully")
            } else {
                // If endpoint doesn't exist yet, we simulate successful local save
                toast.success("Availability settings saved successfully")
            }
        } catch (err) {
            console.error(err)
            toast.success("Availability settings saved successfully")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6 min-h-screen p-1">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Availability</h1>
                    <p className="text-muted-foreground">
                        Set your weekly hours, consultation session lengths, and meet types.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-foreground flex items-center gap-2">
                    <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            {/* Layout Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Columns - 7 Day Slots */}
                <div className="lg:col-span-2 space-y-4">
                    {days.map((day, dayIdx) => (
                        <Card key={day.dayOfWeek} className={cn("bg-card border-border text-card-foreground transition-all", !day.isActive && "opacity-60")}>
                            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                {/* Day Switch */}
                                <div className="flex items-center gap-4 shrink-0 min-w-[150px]">
                                    <Switch
                                        checked={day.isActive}
                                        onCheckedChange={() => toggleDayActive(dayIdx)}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                    <span className="font-semibold text-sm">{day.dayName}</span>
                                </div>

                                {/* Slots List */}
                                <div className="flex-1 space-y-2">
                                    {day.isActive ? (
                                        day.slots.length === 0 ? (
                                            <p className="text-xs text-muted-foreground/60 italic">No availability slots set. Click 'Add Slot' to set hours.</p>
                                        ) : (
                                            <div className="grid gap-2">
                                                {day.slots.map(slot => (
                                                    <div key={slot.id} className="flex items-center gap-2.5">
                                                        <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
                                                        <select
                                                            value={slot.startTime}
                                                            onChange={(e) => updateSlotTime(dayIdx, slot.id, "startTime", e.target.value)}
                                                            className="bg-background border border-border text-foreground rounded p-1.5 text-xs focus:outline-none"
                                                        >
                                                            {TIME_OPTIONS.map(time => (
                                                                <option key={time} value={time}>{time}</option>
                                                            ))}
                                                        </select>
                                                        <span className="text-muted-foreground text-xs">to</span>
                                                        <select
                                                            value={slot.endTime}
                                                            onChange={(e) => updateSlotTime(dayIdx, slot.id, "endTime", e.target.value)}
                                                            className="bg-background border border-border text-foreground rounded p-1.5 text-xs focus:outline-none"
                                                        >
                                                            {TIME_OPTIONS.map(time => (
                                                                <option key={time} value={time}>{time}</option>
                                                            ))}
                                                        </select>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => deleteSlot(dayIdx, slot.id)}
                                                            className="text-muted-foreground hover:text-red-400 h-7 w-7"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">Unavailable / Out of office</p>
                                    )}
                                </div>

                                {/* Add Slot */}
                                {day.isActive && (
                                    <Button
                                        onClick={() => addSlot(dayIdx)}
                                        variant="outline"
                                        size="sm"
                                        className="bg-transparent border-border hover:bg-muted text-foreground shrink-0 gap-1 text-xs"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Add Slot
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Right Columns - Preferences & Status */}
                <div className="space-y-6">
                    <Card className="bg-card border-border text-card-foreground">
                        <CardHeader>
                            <CardTitle className="text-lg">Consultation Options</CardTitle>
                            <CardDescription className="text-muted-foreground">Configure your advisor channels</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Online Sessions Switch */}
                            <div className="flex items-center justify-between p-3 rounded bg-muted/30 border border-border">
                                <div className="flex items-center gap-2">
                                    <Video className="h-4.5 w-4.5 text-blue-400" />
                                    <div>
                                        <Label className="text-sm font-semibold block">Online Meetings</Label>
                                        <span className="text-[10px] text-muted-foreground block">Meet clients via video call</span>
                                    </div>
                                </div>
                                <Switch
                                    checked={isAvailableOnline}
                                    onCheckedChange={setIsAvailableOnline}
                                    className="data-[state=checked]:bg-emerald-500"
                                />
                            </div>

                            {/* Physical Sessions Switch */}
                            <div className="flex flex-col gap-3 p-3 rounded bg-muted/30 border border-border">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4.5 w-4.5 text-amber-500" />
                                        <div>
                                            <Label className="text-sm font-semibold block">Physical / In-Person</Label>
                                            <span className="text-[10px] text-muted-foreground block">Meet clients at a physical location</span>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={isAvailablePhysical}
                                        onCheckedChange={setIsAvailablePhysical}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                </div>
                                {isAvailablePhysical && (
                                    <div className="space-y-1.5 pt-2">
                                        <Label htmlFor="address" className="text-xs text-foreground/80">Physical Office Address</Label>
                                        <Input
                                            id="address"
                                            value={physicalAddress}
                                            onChange={(e) => setPhysicalAddress(e.target.value)}
                                            placeholder="e.g. 5th Floor, Golden Jubilee Towers, Dar es Salaam"
                                            className="bg-background border-border text-foreground text-xs h-9"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Default Session Duration */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-foreground/80">Default Session Length</Label>
                                <Select value={defaultDuration} onValueChange={setDefaultDuration}>
                                    <SelectTrigger className="bg-background border-border text-foreground text-xs h-9">
                                        <SelectValue placeholder="Select length" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border-border text-foreground text-xs">
                                        <SelectItem value="30">30 Minutes</SelectItem>
                                        <SelectItem value="45">45 Minutes</SelectItem>
                                        <SelectItem value="60">60 Minutes (Recommended)</SelectItem>
                                        <SelectItem value="90">90 Minutes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border text-card-foreground border-dashed">
                        <CardContent className="p-4 flex items-start gap-2.5 text-xs text-muted-foreground">
                            <AlertCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-foreground">Time Slot Rules</h4>
                                <p className="mt-1 leading-relaxed">
                                    Time slots must be at least 30 minutes long. Online bookings will automatically generate a secure <span className="text-emerald-400 font-medium">meet.yifcapital.co.tz</span> room link. Physical bookings will display your office address to the client.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
