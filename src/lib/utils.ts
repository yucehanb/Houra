import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Tailwind class birleştirme yardımcısı */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** Kredi bakiyesini "2.5 saat" formatında gösterir */
export function formatCredits(credits: number): string {
    return `${credits.toFixed(1)} saat kredisi`
}

/** Tarihi "3 gün önce" formatında gösterir */
export function timeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return 'az önce'
    if (diffMin < 60) return `${diffMin} dakika önce`
    if (diffHour < 24) return `${diffHour} saat önce`
    if (diffDay < 7) return `${diffDay} gün önce`
    return date.toLocaleDateString('tr-TR')
}

/** Yıldız rating'ini emoji olarak gösterir */
export function ratingToStars(rating: number | null): string {
    if (!rating) return 'Henüz değerlendirme yok'
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
}
