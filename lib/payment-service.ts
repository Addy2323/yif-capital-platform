"use client"

// Payment Service for Tanzania - Mobile Money & Cards
// Simulated payment processing for development

export type PaymentMethod = "mpesa" | "tigopesa" | "airtelmoney" | "halopesa" | "card"

export interface PaymentProvider {
    id: PaymentMethod
    name: string
    displayName: string
    icon: string
    color: string
    instructions: string
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

export interface Transaction {
    id: string
    userId: string
    amount: number
    currency: string
    method: PaymentMethod
    status: "pending" | "processing" | "success" | "failed"
    plan: "pro" | "institutional"
    createdAt: string
    completedAt?: string
    phone?: string
    cardLast4?: string
    receiptNumber?: string
}

const TRANSACTIONS_KEY = "yif_transactions"

export function getTransactions(): Transaction[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(TRANSACTIONS_KEY)
    if (stored) {
        try {
            return JSON.parse(stored)
        } catch {
            return []
        }
    }
    return []
}

export function saveTransaction(transaction: Transaction): void {
    const transactions = getTransactions()
    transactions.unshift(transaction)
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
}

export function updateTransaction(id: string, updates: Partial<Transaction>): void {
    const transactions = getTransactions()
    const index = transactions.findIndex((t) => t.id === id)
    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updates }
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
    }
}

export function generateReceiptNumber(): string {
    const prefix = "YIF"
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
}

export async function processMobileMoneyPayment(
    userId: string,
    phone: string,
    amount: number,
    method: PaymentMethod,
    plan: "pro" | "institutional"
): Promise<Transaction> {
    // Create pending transaction
    const transaction: Transaction = {
        id: crypto.randomUUID(),
        userId,
        amount,
        currency: "TZS",
        method,
        status: "pending",
        plan,
        createdAt: new Date().toISOString(),
        phone,
    }
    saveTransaction(transaction)

    // Simulate processing
    updateTransaction(transaction.id, { status: "processing" })

    // Simulate network delay (2-4 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000))

    // Simulate 95% success rate
    const success = Math.random() > 0.05

    if (success) {
        const receiptNumber = generateReceiptNumber()
        updateTransaction(transaction.id, {
            status: "success",
            completedAt: new Date().toISOString(),
            receiptNumber,
        })
        return { ...transaction, status: "success", receiptNumber, completedAt: new Date().toISOString() }
    } else {
        updateTransaction(transaction.id, { status: "failed" })
        throw new Error("Payment failed. Please try again or use a different payment method.")
    }
}

export async function processCardPayment(
    userId: string,
    cardNumber: string,
    amount: number,
    plan: "pro" | "institutional"
): Promise<Transaction> {
    const cardLast4 = cardNumber.slice(-4)

    // Create pending transaction
    const transaction: Transaction = {
        id: crypto.randomUUID(),
        userId,
        amount,
        currency: "TZS",
        method: "card",
        status: "pending",
        plan,
        createdAt: new Date().toISOString(),
        cardLast4,
    }
    saveTransaction(transaction)

    // Simulate processing
    updateTransaction(transaction.id, { status: "processing" })

    // Simulate network delay (1-3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Simulate 95% success rate
    const success = Math.random() > 0.05

    if (success) {
        const receiptNumber = generateReceiptNumber()
        updateTransaction(transaction.id, {
            status: "success",
            completedAt: new Date().toISOString(),
            receiptNumber,
        })
        return { ...transaction, status: "success", receiptNumber, completedAt: new Date().toISOString() }
    } else {
        updateTransaction(transaction.id, { status: "failed" })
        throw new Error("Card payment declined. Please check your card details or try a different card.")
    }
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-TZ", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export function formatPhone(phone: string): string {
    // Format Tanzanian phone numbers
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.startsWith("255")) {
        return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
    }
    if (cleaned.startsWith("0")) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
    }
    return phone
}
