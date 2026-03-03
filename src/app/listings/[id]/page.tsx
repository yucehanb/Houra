'use client'

import { use, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, MapPin, Star, Tag, Eye, MessageCircle, Heart, Share2, ShieldCheck, Calendar, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/utils'
import { useListingsStore } from '@/store/listingsStore'
import { useMessagesStore } from '@/store/messagesStore'
import { useAuthStore } from '@/store/authStore'

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

const MOCK_REVIEWS = [
    { id: 'r1', reviewer: 'Fatma Demir', rating: 5, comment: 'Gerçekten çok yardımcı oldu, kesinlikle tavsiye ederim!', date: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 'r2', reviewer: 'Can Öztürk', rating: 4, comment: 'Sabırlı ve açıklayıcıydı, memnun kaldım.', date: new Date(Date.now() - 86400000 * 10).toISOString() },
]

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={cn('w-3.5 h-3.5', i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600')} />
            ))}
        </div>
    )
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    const listings = useListingsStore((s) => s.listings)
    const { getOrCreateConversation } = useMessagesStore()
    const currentUser = useAuthStore(s => s.user)

    const listing = listings.find(l => l.id === id)
    const [saved, setSaved] = useState(false)
    const [isStartingChat, setIsStartingChat] = useState(false)

    if (!listing) notFound()

    const colorClass = CATEGORY_COLORS[listing.category] ?? CATEGORY_COLORS['Diğer']
    const icon = CATEGORY_ICONS[listing.category] ?? '✨'
    const seller = listing.user
    const related = listings.filter(l => l.id !== id && l.category === listing.category && l.status === 'active').slice(0, 3)

    const handleSendMessage = async () => {
        if (!currentUser) {
            router.push('/login')
            return
        }
        if (currentUser.id === seller?.id) {
            alert('Kendi ilanınıza mesaj gönderemezsiniz.')
            return
        }

        setIsStartingChat(true)
        try {
            const convId = await getOrCreateConversation(listing.id, currentUser.id, seller?.id || 'unknown')
            router.push(`/messages/${convId}`)
        } catch (error) {
            console.error('Error starting conversation:', error)
            alert('Mesajlaşma başlatılamadı.')
        } finally {
            setIsStartingChat(false)
        }
    }

    return (
        <div className="space-y-6 pt-2">
            <div className="flex items-center gap-2 text-sm">
                <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">Keşfet</Link>
                <span className="text-slate-700">/</span>
                <span className="text-slate-400 truncate max-w-[200px]">{listing.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Sol İçerik ─────────────────── */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border', colorClass)}>
                                        {icon} {listing.category}
                                    </span>
                                    <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium',
                                        listing.type === 'offer' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                                    )}>
                                        {listing.type === 'offer' ? '✦ Sunuyor' : '⟐ Arıyor'}
                                    </span>
                                </div>
                                <h1 className="text-white text-2xl font-bold leading-tight">{listing.title}</h1>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => setSaved(s => !s)}
                                    className={cn('w-9 h-9 rounded-xl border flex items-center justify-center transition-all',
                                        saved ? 'bg-red-500/15 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                                    )}>
                                    <Heart className={cn('w-4 h-4', saved && 'fill-current')} />
                                </button>
                                <button className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-all">
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{listing.view_count} görüntülenme</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{timeAgo(listing.created_at)}</span>
                            {seller?.city && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{seller.city}</span>}
                        </div>

                        <div className="pt-2 border-t border-white/5">
                            <h2 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-3">Açıklama</h2>
                            <p className="text-slate-300 leading-relaxed">{listing.description}</p>
                        </div>

                        {listing.tags.length > 0 && (
                            <div>
                                <h2 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-3">Etiketler</h2>
                                <div className="flex flex-wrap gap-2">
                                    {listing.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm rounded-lg">
                                            <Tag className="w-3 h-3" />#{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Değerlendirmeler */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-white font-bold flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400" />Değerlendirmeler
                            <span className="text-slate-500 font-normal text-sm">({MOCK_REVIEWS.length})</span>
                        </h2>
                        <div className="space-y-3">
                            {MOCK_REVIEWS.map(r => (
                                <div key={r.id} className="bg-white/5 rounded-xl p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                                {r.reviewer.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-slate-300 text-sm font-medium">{r.reviewer}</span>
                                            <span className="text-slate-600 text-xs">{timeAgo(r.date)}</span>
                                        </div>
                                        <StarDisplay rating={r.rating} />
                                    </div>
                                    <p className="text-slate-400 text-sm">{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Sağ Sidebar ────────────────── */}
                <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 sticky top-20">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Clock className="w-5 h-5 text-purple-400" />
                                <span className="text-purple-300 text-3xl font-bold">{listing.duration_hrs}</span>
                                <span className="text-purple-400 text-lg">saat</span>
                            </div>
                            <p className="text-slate-500 text-xs">kredi karşılığında</p>
                        </div>

                        {isStartingChat ? (
                            <div className="w-full py-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 text-sm font-semibold flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sohbet başlatılıyor…
                            </div>
                        ) : (
                            <button onClick={handleSendMessage}
                                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                {listing.type === 'offer' ? 'Mesaj Gönder & Talep Et' : 'Yardım Teklif Et'}
                            </button>
                        )}

                        <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />Güvenli kredi transferi
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />Tamamlanana kadar ödeme bekletilir
                            </div>
                        </div>
                    </div>

                    {seller && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                            <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider">İlan Sahibi</h3>
                            <div className="flex items-center gap-3">
                                {seller.avatar_url ? (
                                    <img src={seller.avatar_url} alt={seller.full_name} className="w-12 h-12 rounded-xl object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                        {seller.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                )}
                                <div>
                                    <p className="text-white font-semibold">{seller.full_name}</p>
                                    {seller.city && <p className="text-slate-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{seller.city}</p>}
                                </div>
                            </div>
                            {seller.rating_avg && (
                                <div className="flex items-center gap-2">
                                    <StarDisplay rating={seller.rating_avg} />
                                    <span className="text-white text-sm font-semibold">{seller.rating_avg.toFixed(1)}</span>
                                    <span className="text-slate-500 text-xs">/5.0</span>
                                </div>
                            )}
                        </div>
                    )}

                    {related.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                            <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider">Benzer İlanlar</h3>
                            <div className="space-y-2">
                                {related.map(r => (
                                    <Link key={r.id} href={`/listings/${r.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-sm flex-shrink-0">
                                            {CATEGORY_ICONS[r.category]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-300 text-xs font-medium truncate group-hover:text-white transition-colors">{r.title}</p>
                                            <p className="text-slate-600 text-xs flex items-center gap-1">
                                                <Clock className="w-2.5 h-2.5 text-purple-400" />{r.duration_hrs} saat
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
