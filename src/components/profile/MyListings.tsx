"use client"

import Link from 'next/link'
import { Plus, Eye, Pause, Play, Trash2, Clock } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import { useListingsStore } from '@/store/listingsStore'
import { useAuthStore } from '@/store/authStore'
import type { Listing } from '@/types'
import { useEffect } from 'react'

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-green-500/15 text-green-400 border-green-500/20',
    paused: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    completed: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
}
const STATUS_LABELS: Record<string, string> = { active: 'Aktif', paused: 'Durduruldu', completed: 'Tamamlandı' }

const TYPE_STYLES: Record<string, string> = {
    offer: 'bg-purple-500/15 text-purple-400',
    request: 'bg-sky-500/15 text-sky-400',
}
const TYPE_LABELS: Record<string, string> = { offer: 'Sunuyor', request: 'Arıyor' }

const CATEGORY_ICONS: Record<string, string> = {
    'Eğitim': '📚', 'Tamirat': '🔧', 'Dijital': '💻',
    'Danışmanlık': '💡', 'Sağlık & Spor': '🏋️',
    'Sanat & Yaratıcılık': '🎨', 'Ulaşım': '🚗', 'Diğer': '✨',
}

function ListingRow({ listing, onToggle, onDelete }: { listing: Listing; onToggle: () => void; onDelete: () => void }) {
    const icon = CATEGORY_ICONS[listing.category] ?? '✨'
    return (
        <div className="group relative bg-white/5 hover:bg-white/8 border border-white/10 hover:border-purple-500/20 rounded-2xl p-4 md:p-5 transition-all duration-200">
            <div className="flex items-start gap-3 md:gap-4">
                {/* İkon */}
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-lg flex-shrink-0">
                    {icon}
                </div>

                {/* İçerik */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
                        <Link href={`/listings/${listing.id}`} className="text-white font-semibold text-sm md:text-base hover:text-purple-300 transition-colors line-clamp-1">
                            {listing.title}
                        </Link>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', TYPE_STYLES[listing.type])}>
                                    {TYPE_LABELS[listing.type]}
                                </span>
                                <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', STATUS_STYLES[listing.status])}>
                                    {STATUS_LABELS[listing.status]}
                                </span>
                            </div>
                        </div>
                    </div>

                    {listing.description && (
                        <p className="text-slate-500 text-xs md:text-sm line-clamp-1 mb-2">{listing.description}</p>
                    )}

                    <div className="flex items-center justify-between gap-3 text-xs text-slate-500 border-t border-white/5 pt-3 mt-3">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />{listing.view_count} görüntülenme
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-purple-400" />{listing.duration_hrs} saat kredi
                            </span>
                            <span className="opacity-70">{timeAgo(listing.created_at)}</span>
                        </div>
                        {/* Aksiyonlar (Mobil için görünür, PC için hoverda görünür) */}
                        <div className="flex items-center gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            {listing.status !== 'completed' && (
                                <button onClick={onToggle}
                                    className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                    title={listing.status === 'active' ? 'Durdur' : 'Aktif Et'}>
                                    {listing.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                </button>
                            )}
                            <button onClick={onDelete}
                                className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                                title="Sil">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function MyListings() {
    const { listings, updateListingStatus, removeListing, fetchListings } = useListingsStore()
    const { user } = useAuthStore()

    useEffect(() => {
        fetchListings()
    }, [fetchListings])

    const myListings = listings.filter(l => l.user_id === user?.id)
    const activeCount = myListings.filter(l => l.status === 'active').length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-white text-xl font-bold">İlanlarım</h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {activeCount > 0 ? (
                            <><span className="text-green-400 font-semibold">{activeCount}</span> aktif ilan</>
                        ) : (
                            'Henüz aktif ilan yok'
                        )}
                    </p>
                </div>
                <Link href="/listings/new"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-purple-500/20">
                    <Plus className="w-4 h-4" />
                    Yeni İlan
                </Link>
            </div>

            {myListings.length > 0 ? (
                <div className="space-y-3">
                    {myListings.map(listing => (
                        <ListingRow
                            key={listing.id}
                            listing={listing}
                            onToggle={() => updateListingStatus(listing.id, listing.status === 'active' ? 'paused' : 'active')}
                            onDelete={() => removeListing(listing.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-white font-medium mb-1">Henüz ilan vermediniz</p>
                    <p className="text-slate-400 text-sm mb-6">İlk ilanınızı vererek topluluğa katılın ve kredi kazanmaya başlayın.</p>
                    <Link href="/listings/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all">
                        Hemen İlk İlanını Ver
                    </Link>
                </div>
            )}
        </div>
    )
}
