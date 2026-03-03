// ==============================================
// HOURA — TypeScript Tip Tanımları
// Supabase tablolarıyla birebir eşleşir
// ==============================================

export type ListingType = 'offer' | 'request'
export type ListingStatus = 'active' | 'paused' | 'completed' | 'deleted'
export type TransactionStatus = 'pending' | 'accepted' | 'completed' | 'cancelled' | 'disputed'

export interface User {
    id: string
    full_name: string
    avatar_url: string | null
    bio: string | null
    skills: string[]
    needs: string[]
    credits: number
    rating_avg: number | null
    rating_count: number
    city: string | null
    created_at: string
    updated_at: string
}

export interface Listing {
    id: string
    user_id: string
    title: string
    description: string | null
    category: string
    type: ListingType
    duration_hrs: number
    tags: string[]
    status: ListingStatus
    view_count: number
    created_at: string
    updated_at: string
    // Join
    user?: Pick<User, 'id' | 'full_name' | 'avatar_url' | 'rating_avg' | 'city'>
}

export interface Transaction {
    id: string
    listing_id: string
    buyer_id: string
    seller_id: string
    credits_amount: number
    status: TransactionStatus
    accepted_at: string | null
    completed_at: string | null
    cancelled_at: string | null
    notes: string | null
    created_at: string
    updated_at: string
    // Joins
    listing?: Pick<Listing, 'id' | 'title' | 'category'>
    buyer?: Pick<User, 'id' | 'full_name' | 'avatar_url'>
    seller?: Pick<User, 'id' | 'full_name' | 'avatar_url'>
}

export interface Message {
    id: string
    transaction_id: string
    sender_id: string
    content: string
    is_read: boolean
    created_at: string
    // Join
    sender?: Pick<User, 'id' | 'full_name' | 'avatar_url'>
}

export interface Review {
    id: string
    transaction_id: string
    reviewer_id: string
    reviewed_id: string
    rating: 1 | 2 | 3 | 4 | 5
    comment: string | null
    created_at: string
    // Joins
    reviewer?: Pick<User, 'id' | 'full_name' | 'avatar_url'>
}

export const CATEGORIES = [
    'Eğitim',
    'Tamirat',
    'Dijital',
    'Danışmanlık',
    'Sağlık & Spor',
    'Sanat & Yaratıcılık',
    'Ulaşım',
    'Diğer',
] as const

export type Category = typeof CATEGORIES[number]
