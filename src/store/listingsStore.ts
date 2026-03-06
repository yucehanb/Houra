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
    activeSubscription: any
    setListings: (listings: Listing[]) => void
    fetchListings: () => Promise<void>
    subscribeToListings: () => () => void
    addListing: (listing: Listing) => void
    createListing: (listingData: any) => Promise<Listing>
    updateListingStatus: (id: string, status: Listing['status']) => void
    removeListing: (id: string) => Promise<void>
}

export const useListingsStore = create<ListingsState>()(
    persist(
        (set, get) => ({
            listings: INITIAL_LISTINGS,
            isLoading: false,
            activeSubscription: null,
            setListings: (listings) => set({ listings }),
            fetchListings: async () => {
                set({ isLoading: true })
                try {
                    const supabase = createClient()
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
            subscribeToListings: () => {
                if (get().activeSubscription) return () => { };

                const supabase = createClient()
                const channel = supabase
                    .channel('realtime_listings')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'listings' },
                        () => {
                            // Yeni ilan eklendiğinde veya değiştiğinde listeyi güncelliyoruz
                            get().fetchListings();
                        }
                    )
                    .subscribe()

                set({ activeSubscription: channel })

                return () => {
                    const sb = createClient()
                    sb.removeChannel(channel)
                    set({ activeSubscription: null })
                }
            },
            addListing: (listing) =>
                set((s) => ({ listings: [listing, ...s.listings] })),
            createListing: async (listingData) => {
                set({ isLoading: true })
                try {
                    console.log('[DEBUG] createListing called. Environment variables check:');
                    console.log('[DEBUG] NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
                    console.log('[DEBUG] NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

                    const supabase = createClient()
                    console.log('[DEBUG] Supabase client created successfully.');

                    // Vercel üzerinde @supabase/ssr istemcisinin POST isteklerinde asılı kalma (hanging) 
                    // sorununu aşmak için Supabase REST API'sine doğrudan temiz bir fetch isteği atıyoruz.
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

                    if (!supabaseUrl || !supabaseAnonKey) {
                        throw new Error("Supabase yapılandırması eksik.");
                    }

                    // Kullanıcının mevcut oturum token'ını al (RLS için gerekli)
                    const { data: { session } } = await supabase.auth.getSession();
                    const token = session?.access_token || supabaseAnonKey;

                    const response = await fetch(`${supabaseUrl}/rest/v1/listings`, {
                        method: 'POST',
                        headers: {
                            'apikey': supabaseAnonKey,
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation' // Eklenen veriyi geri döndür
                        },
                        body: JSON.stringify(listingData)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'İlan kaydedilirken API hatası oluştu.');
                    }

                    const resultData = await response.json();
                    const data = resultData[0]; // representation array döner

                    if (data) {
                        const tempListing = {
                            ...data,
                            user: { id: listingData.user_id, full_name: 'Yükleniyor...', avatar_url: null, rating_avg: 0, city: null }
                        }
                        set((s) => ({ listings: [tempListing as Listing, ...s.listings] }))
                        return tempListing as Listing
                    }
                    throw new Error('İlan oluşturulamadı (boş veri döndü)')
                } catch (err) {
                    console.error('İlan oluşturulurken hata:', err)
                    throw err
                } finally {
                    set({ isLoading: false })
                }
            },
            updateListingStatus: (id, status) =>
                set((s) => ({
                    listings: s.listings.map(l => l.id === id ? { ...l, status } : l),
                })),
            removeListing: async (id) => {
                try {
                    const supabase = createClient()
                    const { error } = await supabase.from('listings').delete().eq('id', id)
                    if (error) throw error
                    set((s) => ({ listings: s.listings.filter(l => l.id !== id) }))
                } catch (err) {
                    console.error('İlan silinirken hata oluştu:', err)
                    throw err
                }
            },
        }),
        { name: 'houra-listings' } // Rebranded store name
    )
)
