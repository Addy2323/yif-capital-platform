"use client"

import { User } from "@/lib/auth-context"

import {
    type PricingPlan,
    getPricingPlans,
    updatePricingPlan,
    PRICING_KEY
} from "@/lib/pricing-data"

// Storage keys
const USERS_KEY = "yif_users"
const SETTINGS_KEY = "yif_admin_settings"

// Re-export PricingPlan as SubscriptionPlan for backward compatibility in this file if needed, 
// but it's better to just use PricingPlan. Let's use PricingPlan.
export type { PricingPlan as SubscriptionPlan }


export interface AdminSettings {
    siteName: string
    maintenanceMode: boolean
    announcementBanner: string | null
    enableRegistration: boolean
    defaultPlan: "free" | "pro" | "institutional"
}

export interface UserWithPassword {
    password: string
    user: User
}

export interface SubscriptionStats {
    totalUsers: number
    freeUsers: number
    proUsers: number
    institutionalUsers: number
    monthlyRevenue: number
    totalRevenue: number
}

export interface AnalyticsData {
    userGrowth: { date: string; count: number }[]
    revenueByMonth: { month: string; revenue: number }[]
    subscriptionDistribution: { plan: string; count: number; percentage: number }[]
}

const defaultSettings: AdminSettings = {
    siteName: "YIF Capital",
    maintenanceMode: false,
    announcementBanner: null,
    enableRegistration: true,
    defaultPlan: "free",
}

// User Management
export function getAllUsers(): User[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(USERS_KEY)
    if (!stored) return []
    try {
        const users: Record<string, UserWithPassword> = JSON.parse(stored)
        return Object.values(users).map((u) => u.user)
    } catch {
        return []
    }
}

export function getUserByEmail(email: string): User | null {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem(USERS_KEY)
    if (!stored) return null
    try {
        const users: Record<string, UserWithPassword> = JSON.parse(stored)
        return users[email.toLowerCase()]?.user || null
    } catch {
        return null
    }
}

export function updateUser(email: string, updates: Partial<User>): boolean {
    if (typeof window === "undefined") return false
    const stored = localStorage.getItem(USERS_KEY)
    if (!stored) return false
    try {
        const users: Record<string, UserWithPassword> = JSON.parse(stored)
        if (!users[email.toLowerCase()]) return false
        users[email.toLowerCase()].user = { ...users[email.toLowerCase()].user, ...updates }
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
        return true
    } catch {
        return false
    }
}

export function deleteUser(email: string): boolean {
    if (typeof window === "undefined") return false
    const stored = localStorage.getItem(USERS_KEY)
    if (!stored) return false
    try {
        const users: Record<string, UserWithPassword> = JSON.parse(stored)
        if (!users[email.toLowerCase()]) return false
        delete users[email.toLowerCase()]
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
        return true
    } catch {
        return false
    }
}

export function createUser(userData: { name: string; email: string; password: string; role: string }): boolean {
    if (typeof window === "undefined") return false
    try {
        const stored = localStorage.getItem(USERS_KEY)
        const users: Record<string, UserWithPassword> = stored ? JSON.parse(stored) : {}

        // Check if user already exists
        if (users[userData.email.toLowerCase()]) {
            return false
        }

        const newUser: User = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            role: userData.role as "free" | "pro" | "institutional" | "admin",
            createdAt: new Date().toISOString(),
            subscription: userData.role === "pro" || userData.role === "institutional" ? {
                plan: userData.role as "pro" | "institutional",
                status: "active",
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            } : undefined,
        }

        users[userData.email.toLowerCase()] = {
            password: userData.password,
            user: newUser,
        }

        localStorage.setItem(USERS_KEY, JSON.stringify(users))
        return true
    } catch {
        return false
    }
}

// Subscription Plans
export function getSubscriptionPlans(): PricingPlan[] {
    return getPricingPlans()
}

export function updateSubscriptionPlan(id: string, updates: Partial<PricingPlan>): boolean {
    return updatePricingPlan(id, updates)
}


// Subscription Stats
export function getSubscriptionStats(): SubscriptionStats {
    const users = getAllUsers()
    const plans = getSubscriptionPlans()
    const freeUsers = users.filter((u) => u.subscription?.plan === "free" || !u.subscription).length
    const proUsers = users.filter((u) => u.subscription?.plan === "pro").length
    const institutionalUsers = users.filter((u) => u.subscription?.plan === "institutional").length

    const proPrice = plans.find(p => p.id === "pro")?.price || 49000
    const institutionalPrice = plans.find(p => p.id === "institutional")?.price || 299000

    return {
        totalUsers: users.length,
        freeUsers,
        proUsers,
        institutionalUsers,
        monthlyRevenue: proUsers * proPrice + institutionalUsers * institutionalPrice,
        totalRevenue: (proUsers * proPrice + institutionalUsers * institutionalPrice) * 6, // 6 months estimate
    }
}

// Analytics
export function getAnalyticsData(): AnalyticsData {
    const users = getAllUsers()
    const stats = getSubscriptionStats()

    // Generate user growth data (mock)
    const userGrowth = []
    const today = new Date()
    // Constant base count to ensure we always have data even if users.length is 0
    const baseCount = users.length > 0 ? users.length : 124

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        // Simulate a growing trend with some random noise
        const trend = (6 - i) * 2
        const randomNoise = Math.floor(Math.random() * 5)
        userGrowth.push({
            date: date.toISOString().split("T")[0],
            count: baseCount + trend + randomNoise,
        })
    }

    // Revenue by month (mock based on current stats)
    const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"]
    // Ensure we have a baseline MRR for the mock chart even if current stats are low
    const baseRevenue = Math.max(stats.monthlyRevenue, 1180000)

    const revenueByMonth = months.map((month, i) => {
        // Create an upward trend with some fluctuations
        const growthFactor = 0.7 + (i * 0.1)
        const fluctuation = 0.9 + (Math.random() * 0.2)
        return {
            month,
            revenue: Math.floor(baseRevenue * growthFactor * fluctuation),
        }
    })

    // Subscription distribution
    const subscriptionDistribution = [
        { plan: "Free", count: stats.freeUsers, percentage: stats.totalUsers > 0 ? Math.round((stats.freeUsers / stats.totalUsers) * 100) : 0 },
        { plan: "Pro", count: stats.proUsers, percentage: stats.totalUsers > 0 ? Math.round((stats.proUsers / stats.totalUsers) * 100) : 0 },
        { plan: "Institutional", count: stats.institutionalUsers, percentage: stats.totalUsers > 0 ? Math.round((stats.institutionalUsers / stats.totalUsers) * 100) : 0 },
    ]

    return { userGrowth, revenueByMonth, subscriptionDistribution }
}

// Settings
export function getSettings(): AdminSettings {
    if (typeof window === "undefined") return defaultSettings
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) return defaultSettings
    try {
        return { ...defaultSettings, ...JSON.parse(stored) }
    } catch {
        return defaultSettings
    }
}

export function updateSettings(updates: Partial<AdminSettings>): boolean {
    if (typeof window === "undefined") return false
    try {
        const current = getSettings()
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...updates }))
        return true
    } catch {
        return false
    }
}

// Export Functions
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
        headers.join(","),
        ...data.map((row) =>
            headers.map((h) => {
                const val = row[h]
                if (typeof val === "string" && val.includes(",")) {
                    return `"${val}"`
                }
                return String(val ?? "")
            }).join(",")
        ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
}

export function exportUsersToCSV(): void {
    const users = getAllUsers()
    const data = users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        plan: u.subscription?.plan || "free",
        status: u.subscription?.status || "active",
        createdAt: u.createdAt,
    }))
    exportToCSV(data, "users_export")
}
