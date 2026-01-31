"use client"

import { useState, useEffect } from "react"
import {
    Settings,
    Save,
    Shield,
    Globe,
    Bell,
    Lock,
    RefreshCw,
    CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    getSettings,
    updateSettings,
    type AdminSettings
} from "@/lib/admin-service"

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<AdminSettings | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        setSettings(getSettings())
    }, [])

    const handleSave = () => {
        if (!settings) return
        setIsSaving(true)
        setTimeout(() => {
            updateSettings(settings)
            setIsSaving(false)
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
        }, 800)
    }

    if (!settings) return null

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
                <p className="text-white/60">Configure global site settings and platform behavior.</p>
            </div>

            {showSuccess && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <p>Settings saved successfully!</p>
                </div>
            )}

            <div className="grid gap-6">
                {/* General Settings */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-gold" />
                            <CardTitle className="text-white">General Settings</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="siteName" className="text-white/80">Site Name</Label>
                            <Input
                                id="siteName"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="space-y-0.5">
                                <Label className="text-white">Maintenance Mode</Label>
                                <p className="text-sm text-white/40">Disable public access to the platform</p>
                            </div>
                            <Switch
                                checked={settings.maintenanceMode}
                                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* User Registration */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-white">User & Access</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="space-y-0.5">
                                <Label className="text-white">Enable New Registrations</Label>
                                <p className="text-sm text-white/40">Allow new users to sign up</p>
                            </div>
                            <Switch
                                checked={settings.enableRegistration}
                                onCheckedChange={(checked) => setSettings({ ...settings, enableRegistration: checked })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white/80">Default User Plan</Label>
                            <select
                                value={settings.defaultPlan}
                                onChange={(e) => setSettings({ ...settings, defaultPlan: e.target.value as any })}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                            >
                                <option value="free">Free</option>
                                <option value="pro">Pro (Trial)</option>
                                <option value="institutional">Institutional (Trial)</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Announcements */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-purple-500" />
                            <CardTitle className="text-white">Announcements</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="banner" className="text-white/80">Announcement Banner</Label>
                            <Input
                                id="banner"
                                placeholder="Enter message to display to all users..."
                                value={settings.announcementBanner || ""}
                                onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value || null })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                            <p className="text-xs text-white/40">Leave empty to hide the banner</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset Defaults
                    </Button>
                    <Button
                        className="bg-gold text-navy hover:bg-gold/90 min-w-[120px]"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
