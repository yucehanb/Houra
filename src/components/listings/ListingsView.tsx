'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, SlidersHorizontal, TrendingUp, Loader2 } from 'lucide-react'
import { ListingCard } from '@/components/listings/ListingCard'
import { CategoryFilter } from '@/components/listings/CategoryFilter'
import { cn } from '@/lib/utils'
import { useListingsStore } from '@/store/listingsStore'

type SortOption = 'newest' | 'rating' | 'credits_asc' | 'credits_desc'

export function ListingsView() {
    const { listings, fetchListings, isLoading } = useListingsStore()
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchListings()
    }, [fetchListings])
    const [category, setCategory] = useState<string | null>(null)
    const [typeFilter, setTypeFilter] = useState<'all' | 'offer' | 'request'>('all')
    const [sort, setSort] = useState<SortOption>('newest')
    const [showFilters, setShowFilters] = useState(false)

    const filtered = useMemo(() => {
        let result = listings.filter(l => l.status === 'active')

        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(l =>
                l.title.toLowerCase().includes(q) ||
                l.description?.toLowerCase().includes(q) ||
                l.tags.some(t => t.toLowerCase().includes(q)) ||
                l.user?.full_name.toLowerCase().includes(q)
            )
        }

        if (category) result = result.filter(l => l.category === category)
        if (typeFilter !== 'all') result = result.filter(l => l.type === typeFilter)

        switch (sort) {
            case 'newest': result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break
            case 'rating': result = [...result].sort((a, b) => (b.user?.rating_avg ?? 0) - (a.user?.rating_avg ?? 0)); break
            case 'credits_asc': result = [...result].sort((a, b) => a.duration_hrs - b.duration_hrs); break
            case 'credits_desc': result = [...result].sort((a, b) => b.duration_hrs - a.duration_hrs); break
        }

        return result
    }, [listings, search, category, typeFilter, sort])

    return (
        <div className="space-y-6">
            {/* ── Ana Sekmeler (İlan Türü) ── */}
            <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl w-full sm:w-fit">
                {(['all', 'offer', 'request'] as const).map(val => (
                    <button key={val} onClick={() => setTypeFilter(val)}
                        className={cn('flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                            typeFilter === val
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}>
                        {val === 'all' ? '🌐 Tümü' : val === 'offer' ? '✦ Hizmet Verenler' : '⟐ Hizmet Arayanlar'}
                    </button>
                ))}
            </div>

            {/* Arama */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Yetenek, hizmet veya kişi ara..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(p => !p)}
                    className={cn(
                        'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-95',
                        showFilters
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    )}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Filtrele</span>
                </button>
            </div>

            {/* Filtre Paneli */}
            {showFilters && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div>
                        <p className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">Sırala</p>
                        <div className="flex flex-wrap gap-2">
                            {([['newest', '🕐 Yeniler'], ['rating', '⭐ En Yüksek Puan'], ['credits_asc', '⬇️ Düşük Kredi'], ['credits_desc', '⬆️ Yüksek Kredi']] as const).map(([val, label]) => (
                                <button key={val} onClick={() => setSort(val)}
                                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                                        sort === val ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                    )}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Kategori */}
            <CategoryFilter selected={category} onChange={setCategory} />

            {/* Sonuç */}
            <div className="flex items-center justify-between">
                <p className="text-slate-400 text-sm">
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                            İlanlar yükleniyor...
                        </span>
                    ) : (
                        <>
                            <span className="text-white font-semibold">{filtered.length}</span> ilan bulundu
                            {category && <span> · <button onClick={() => setCategory(null)} className="text-purple-400 hover:text-purple-300 underline">{category} × temizle</button></span>}
                        </>
                    )}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <TrendingUp className="w-3 h-3" />
                    <span>{listings.filter(l => l.status === 'active').length} aktif ilan</span>
                </div>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="text-5xl mb-4">🔍</div>
                    <p className="text-slate-400 text-lg font-medium mb-1">Sonuç bulunamadı</p>
                    <p className="text-slate-500 text-sm mb-4">Farklı bir arama terimi veya kategori deneyin.</p>
                    <button onClick={() => { setSearch(''); setCategory(null); setTypeFilter('all') }}
                        className="text-purple-400 hover:text-purple-300 text-sm underline">
                        Filtreleri temizle
                    </button>
                </div>
            )}
        </div>
    )
}
