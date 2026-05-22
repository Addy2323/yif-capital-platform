"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings, Bell, Mail, Globe } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function LmsSettingsPage() {
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [courseReminders, setCourseReminders] = useState(true)
    const [bookingReminders, setBookingReminders] = useState(true)
    const [marketingEmails, setMarketingEmails] = useState(false)

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    Settings <Settings className="h-7 w-7 text-slate-400 dark:text-white/40" />
                </h1>
                <p className="text-slate-500 dark:text-white/50 mt-1">Manage your learning portal preferences</p>
            </div>

            <Card className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <CardHeader>
                    <CardTitle className="text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <Bell className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-white/50">
                        Choose what notifications you receive
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[
                        { id: "email", label: "Email Notifications", desc: "Receive notifications via email", value: emailNotifications, onChange: setEmailNotifications, icon: Mail },
                        { id: "course", label: "Course Reminders", desc: "Reminders to continue your courses", value: courseReminders, onChange: setCourseReminders, icon: Globe },
                        { id: "booking", label: "Booking Reminders", desc: "Reminders for upcoming consultations", value: bookingReminders, onChange: setBookingReminders, icon: Bell },
                        { id: "marketing", label: "Marketing Emails", desc: "New courses, promotions, and updates", value: marketingEmails, onChange: setMarketingEmails, icon: Mail },
                    ].map(({ id, label, desc, value, onChange, icon: Icon }) => (
                        <div key={id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <Icon className="h-4 w-4 text-slate-400 dark:text-white/40" />
                                <div>
                                    <Label className="text-sm font-medium text-slate-900 dark:text-white block">{label}</Label>
                                    <span className="text-xs text-slate-400 dark:text-white/40">{desc}</span>
                                </div>
                            </div>
                            <Switch
                                checked={value}
                                onCheckedChange={onChange}
                                className="data-[state=checked]:bg-blue-600"
                            />
                        </div>
                    ))}
                    <Button
                        onClick={() => toast.success("Settings saved")}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Save Preferences
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
