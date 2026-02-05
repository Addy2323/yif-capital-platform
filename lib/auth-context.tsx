"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type UserRole = "free" | "pro" | "institutional" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: string
  subscription?: {
    plan: "free" | "pro" | "institutional"
    status: "active" | "cancelled" | "expired"
    expiresAt?: string
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  upgradeSubscription: (plan: "pro" | "institutional") => void
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = async () => {
    try {
      const res = await fetch("/api/auth/session")
      const data = await res.json()
      if (data.user) {
        setUser({
          ...data.user,
          subscription: {
            plan: data.user.role as "free" | "pro" | "institutional",
            status: "active"
          }
        })
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    // Check for existing session from database
    refreshSession().finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" }
      }

      setUser({
        ...data,
        subscription: {
          plan: data.role as "free" | "pro" | "institutional",
          status: "active"
        }
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name })
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" }
      }

      // Auto-login after registration
      return await login(email, password)
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" })
    } catch {
      // Ignore errors
    }
    setUser(null)
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return
    setUser({ ...user, ...updates })
    // TODO: Implement API call to update user in database
  }

  const upgradeSubscription = (plan: "pro" | "institutional") => {
    if (!user) return
    setUser({
      ...user,
      role: plan,
      subscription: {
        plan,
        status: "active",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    })
    // TODO: Implement API call to upgrade subscription
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, upgradeSubscription, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
