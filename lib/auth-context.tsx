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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "yif_auth"
const USERS_KEY = "yif_users"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const getUsers = (): Record<string, { password: string; user: User }> => {
    const stored = localStorage.getItem(USERS_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return {}
      }
    }
    return {}
  }

  const saveUsers = (users: Record<string, { password: string; user: User }>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Hardcoded Admin Credentials i will update nikiwa na impliment backend
    if (email.toLowerCase() === "admin@yif.com" && password === "admin123") {
      const adminUser: User = {
        id: "admin-id",
        email: "admin@yif.com",
        name: "System Admin",
        role: "admin",
        createdAt: new Date().toISOString(),
        subscription: {
          plan: "institutional",
          status: "active",
        },
      }
      setUser(adminUser)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser))
      return { success: true }
    }

    const users = getUsers()
    const userRecord = users[email.toLowerCase()]

    if (!userRecord) {
      return { success: false, error: "Invalid email or password" }
    }

    if (userRecord.password !== password) {
      return { success: false, error: "Invalid email or password" }
    }

    setUser(userRecord.user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userRecord.user))
    return { success: true }
  }

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    const users = getUsers()

    if (users[email.toLowerCase()]) {
      return { success: false, error: "Email already registered" }
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      name,
      role: "free",
      createdAt: new Date().toISOString(),
      subscription: {
        plan: "free",
        status: "active",
      },
    }

    users[email.toLowerCase()] = { password, user: newUser }
    saveUsers(users)

    setUser(newUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))

    // Also update in users storage
    const users = getUsers()
    if (users[user.email]) {
      users[user.email].user = updatedUser
      saveUsers(users)
    }
  }

  const upgradeSubscription = (plan: "pro" | "institutional") => {
    if (!user) return

    const updatedUser: User = {
      ...user,
      role: plan,
      subscription: {
        plan,
        status: "active",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    }
    setUser(updatedUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))

    // Also update in users storage
    const users = getUsers()
    if (users[user.email]) {
      users[user.email].user = updatedUser
      saveUsers(users)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, upgradeSubscription }}>
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
