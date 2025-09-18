import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount / 100) // Stripe amounts are in cents
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date)
}

export function generateApiKey(): string {
    const prefix = 'hb_' // hydrus billing
    const randomPart = Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    return `${prefix}${randomPart}`
}

export async function hashApiKey(key: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(key)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

export function isInactive(lastSeenAt: Date | null, daysThreshold: number = 14): boolean {
    if (!lastSeenAt) return true

    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastSeenAt.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > daysThreshold
}