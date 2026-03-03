import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Listing } from '@/types'

// ── Başlangıç verileri (Boş liste ile başlar, Supabase'den yüklenir) ───────────
const INITIAL_LISTINGS: Listing[] = []

import { createClient } from '@/lib/supabase/client'

// ── Benim ilanlarımın user_id'si (mock - Supabase ile gerçek ID kullanılır) ────
// Bunlar artık NewListingForm içinde AuthStore'dan gelecek.

interface ListingsState {
    listings: Listing[]
    isLoading: boolean
    setListings: (listings: Listing[]) => void
    fetchListings: () => Promise<void>
    addListing: (listing: Listing) => void
    updateListingStatus: (id: string, status: Listing['status']) => void
    removeListing: (id: string) => void
}

const supabase = createClient()

export const useListingsStore = create<ListingsState>()(
    persist(
        (set, get) => ({
            listings: INITIAL_LISTINGS,
            isLoading: false,
            setListings: (listings) => set({ listings }),
            fetchListings: async () => {
                set({ isLoading: true })
                try {
                    const { data, error } = await supabase
                        .from('listings')
                        .select('*, user:users(id, full_name, avatar_url, rating_avg, city)')
                        .order('created_at', { ascending: false })

                    if (error) throw error
                    if (data) set({ listings: data as Listing[] })
                } catch (err) {
                    console.error('İlanlar yüklenirken hata oluştu:', err)
                } finally {
                    set({ isLoading: false })
                }
            },
            addListing: (listing) =>
                set((s) => ({ listings: [listing, ...s.listings] })),
            updateListingStatus: (id, status) =>
                set((s) => ({
                    listings: s.listings.map(l => l.id === id ? { ...l, status } : l),
                })),
            removeListing: (id) =>
                set((s) => ({ listings: s.listings.filter(l => l.id !== id) })),
        }),
        { name: 'houra-listings' } // Rebranded store name
    )
)
