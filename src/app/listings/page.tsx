'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, Clock, MapPin, Star, Plus, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/utils'
import { useListingsStore } from '@/store/listingsStore'
import { CATEGORIES } from '@/types'
import type { Listing } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
    'Eğitim': '📚', 'Tamirat': '🔧', 'Dijital': '💻',
    'Danışmanlık': '💡', 'Sağlık & Spor': '🏋️',
    'Sanat & Yaratıcılık': '🎨', 'Ulaşım': '🚗', 'Diğer': '✨',
}
const CATEGORY_COLORS: Record<string, string> = {
    'Eğitim': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    'Tamirat': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    'Dijital': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    'Danışmanlık': 'bg-green-500/15 text-green-400 border-green-500/20',
    'Sağlık & Spor': 'bg-red-500/15 text-red-400 border-red-500/20',
    'Sanat & Yaratıcılık': 'bg-pink-500/15 text-pink-400 border-pink-500/20',
    'Ulaşım': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    'Diğer': 'bg-slate-500/15 text-slate-400 border-slate-500/20',
}

function ListingCard({ listing }: { listing: Listing }) {
    const colorClass = CATEGORY_COLORS[listing.category] ?? CATEGORY_COLORS['Diğer']
    const icon = CATEGORY_ICONS[listing.category] ?? '✨'
    const seller = listing.user

    return (
        <Link
            href={`/listings/${listing.id}`}
            className="group block bg-white/5 hover:bg-white/8 border border-white/10 hover:border-purple-500/30 rounded-2xl p-5 space-y-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border', colorClass)}>
                        {icon} {listing.category}
                    </span>
                    <span className={cn(
                        'text-xs px-2.5 py-1 rounded-full font-medium',
                        listing.type === 'offer'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber-500/15 text-amber-400'
                    )}>
                        {listing.type === 'offer' ? '✦ Sunuyor' : '⟐ Arıyor'}
                    </span>
                </div>
                <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-1.5 flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-purple-300 font-bold text-sm">{listing.duration_hrs}</span>
                    <span className="text-purple-400/70 text-xs">saat</span>
                </div>
            </div>

            {/* Title */}
            <div>
                <h2 className="text-white font-semibold text-base leading-snug group-hover:text-purple-100 transition-colors line-clamp-2">
                    {listing.title}
                </h2>
                {listing.description && (
                    <p className="text-slate-500 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                        {listing.description}
                    </p>
                )}
            </div>

            {/* Tags */}
            {listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {listing.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md">
                            #{tag}
                        </span>
                    ))}
                    {listing.tags.length > 3 && (
                        <span className="text-xs px-2 py-0.5 text-slate-600">
                            +{listing.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <div className="flex items-center gap-2">
                    {seller?.avatar_url ? (
                        <img src={seller.avatar_url} alt={seller.full_name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {seller?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) ?? '?'}
                        </div>
                    )}
                    <div>
                        <p className="text-slate-300 text-xs font-medium leading-none">{seller?.full_name ?? 'Kullanıcı'}</p>
                        {seller?.city && (
                            <p className="text-slate-600 text-xs flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-2.5 h-2.5" /> {seller.city}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                    {seller?.rating_avg && (
                        <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-slate-400">{seller.rating_avg.toFixed(1)}</span>
                        </span>
                    )}
                    <span>{timeAgo(listing.created_at)}</span>
                </div>
            </div>
        </Link>
    )
}

export default function ListingsPage() {
    const { listings, isLoading, fetchListings, subscribeToListings } = useListingsStore()

    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedType, setSelectedType] = useState<'all' | 'offer' | 'request'>('all')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        fetchListings()
        const unsubscribe = subscribeToListings()
        return () => {
            if (unsubscribe) unsubscribe()
        }
    }, [fetchListings, subscribeToListings])

    const filtered = useMemo(() => {
        return listings.filter(l => {
            if (l.status !== 'active') return false
            if (selectedCategory && l.category !== selectedCategory) return false
            if (selectedType !== 'all' && l.type !== selectedType) return false
            if (search.trim()) {
                const q = search.toLowerCase()
                return (
                    l.title.toLowerCase().includes(q) ||
                    l.description?.toLowerCase().includes(q) ||
                    l.tags.some(t => t.toLowerCase().includes(q)) ||
                    l.category.toLowerCase().includes(q)
                )
            }
            return true
        })
    }, [listings, selectedCategory, selectedType, search])

    const hasActiveFilters = selectedCategory || selectedType !== 'all' || search.trim()

    return (
        <div className="space-y-6 pt-4">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">İlanlar</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {isLoading ? 'Yükleniyor…' : `${filtered.length} ilan bulundu`}
                    </p>
                </div>
                <Link
                    href="/listings/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-purple-500/20"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">İlan Ver</span>
                </Link>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="İlan, kategori veya etiket ara…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setShowFilters(f => !f)}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all',
                        showFilters || hasActiveFilters
                            ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                    )}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Filtrele</span>
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                    {/* Type toggle */}
                    <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2.5">İlan Türü</p>
                        <div className="flex gap-2">
                            {(['all', 'offer', 'request'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSelectedType(t)}
                                    className={cn(
                                        'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                                        selectedType === t
                                            ? t === 'offer'
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                : t === 'request'
                                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                            : 'bg-white/5 text-slate-400 border border-white/10 hover:text-slate-200'
                                    )}
                                >
                                    {t === 'all' ? 'Tümü' : t === 'offer' ? '✦ Sunanlar' : '⟐ Arayanlar'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2.5">Kategori</p>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(c => c === cat ? null : cat)}
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                                        selectedCategory === cat
                                            ? CATEGORY_COLORS[cat]
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                                    )}
                                >
                                    {CATEGORY_ICONS[cat]} {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Clear filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={() => { setSelectedCategory(null); setSelectedType('all'); setSearch('') }}
                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            <X className="w-3 h-3" /> Filtreleri temizle
                        </button>
                    )}
                </div>
            )}

            {/* Active filter chips */}
            {!showFilters && hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                    {selectedCategory && (
                        <span className={cn('flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border', CATEGORY_COLORS[selectedCategory] ?? '')}>
                            {CATEGORY_ICONS[selectedCategory]} {selectedCategory}
                            <button onClick={() => setSelectedCategory(null)}><X className="w-3 h-3" /></button>
                        </span>
                    )}
                    {selectedType !== 'all' && (
                        <span className={cn(
                            'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border',
                            selectedType === 'offer' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                        )}>
                            {selectedType === 'offer' ? '✦ Sunanlar' : '⟐ Arayanlar'}
                            <button onClick={() => setSelectedType('all')}><X className="w-3 h-3" /></button>
                        </span>
                    )}
                </div>
            )}

            {/* Listings Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl">
                        🔍
                    </div>
                    <p className="text-slate-400 font-medium">İlan bulunamadı</p>
                    <p className="text-slate-600 text-sm max-w-xs">
                        {hasActiveFilters
                            ? 'Farklı filtreler veya arama terimleri deneyin.'
                            : 'Henüz ilan yok. İlk ilanı sen ver!'}
                    </p>
                    {hasActiveFilters ? (
                        <button
                            onClick={() => { setSelectedCategory(null); setSelectedType('all'); setSearch('') }}
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            Filtreleri temizle
                        </button>
                    ) : (
                        <Link href="/listings/new" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                            İlan ver →
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(listing => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}
        </div>
    )
}
