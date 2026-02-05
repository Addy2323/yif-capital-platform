"use client"

// Payment Service for Tanzania - Mobile Money & Cards
import { User } from "./auth-context"

export type PaymentMethod = "mpesa" | "tigopesa" | "airtelmoney" | "halopesa" | "card"

export interface PaymentProvider {
    id: PaymentMethod
    name: string
    displayName: string
    icon: string
    color: string
    instructions: string
}

export interface Transaction {
    id: string
    userId: string
    amount: number
    currency: string
    method: string
    status: "pending" | "success" | "failed"
    plan: string
    sessionId?: string
    phone?: string
    cardLast4?: string
    receiptNumber: string
    createdAt: string
    completedAt?: string
}

export const MOBILE_MONEY_PROVIDERS: PaymentProvider[] = [
    {
        id: "mpesa",
        name: "M-Pesa",
        displayName: "M-Pesa (Vodacom)",
        icon: "/logo payment/mpesa.png",
        color: "#E60000",
        instructions: "You will receive a push notification on your phone. Enter your M-Pesa PIN to confirm payment.",
    },
    {
        id: "tigopesa",
        name: "Tigo Pesa",
        displayName: "Tigo Pesa",
        icon: "/logo payment/tigo-pesa.png",
        color: "#00377B",
        instructions: "You will receive a USSD prompt. Enter your Tigo Pesa PIN to confirm payment.",
    },
    {
        id: "airtelmoney",
        name: "Airtel Money",
        displayName: "Airtel Money",
        icon: "/logo payment/airtel-money.png",
        color: "#FF0000",
        instructions: "You will receive a USSD prompt. Enter your Airtel Money PIN to confirm payment.",
    },
    {
        id: "halopesa",
        name: "Halopesa",
        displayName: "Halopesa",
        icon: "/logo payment/halopesa.png",
        color: "#FF6B00",
        instructions: "You will receive a USSD prompt. Enter your Halopesa PIN to confirm payment.",
    },
]

export const CARD_PROVIDER: PaymentProvider = {
    id: "card",
    name: "Card",
    displayName: "Credit/Debit Card",
    icon: "/logo payment/crdb.png",
    color: "#1A1F36",
    instructions: "Enter your card details securely. We accept Visa and Mastercard.",
}

export function getTransactions(): Transaction[] {
    // This is now a placeholder as we moved to server-side database storage
    // It returns an empty array to satisfy type requirements during build
    if (typeof window === "undefined") return []
    try {
        const stored = localStorage.getItem("yif_transactions")
        return stored ? JSON.parse(stored) : []
    } catch (e) {
        return []
    }
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-TZ", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export async function processMobileMoneyPayment(
    phone: string,
    amount: number,
    method: PaymentMethod,
    plan: "pro" | "institutional"
): Promise<any> {
    const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            phone,
            amount,
            plan,
            method
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to initiate payment. Please check your phone number.");
    }

    return data;
}

export async function processCardPayment(
    cardNumber: string,
    amount: number,
    plan: "pro" | "institutional"
): Promise<any> {
    // For card payment, we'll implement a simple successful transaction simulation via API
    // in a real app, this would use Stripe or another provider.
    const response = await fetch("/api/payments/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            cardNumber: cardNumber.slice(-4), // Only send last 4 for security
            amount,
            plan
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || data.error || "Card payment failed.");
    }

    return data;
}
