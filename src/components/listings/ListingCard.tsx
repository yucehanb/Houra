import Link from 'next/link'
import Image from 'next/image'
import { Clock, MapPin, Star, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Listing } from '@/types'

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

const CATEGORY_ICONS: Record<string, string> = {
    'Eğitim': '📚', 'Tamirat': '🔧', 'Dijital': '💻',
    'Danışmanlık': '💡', 'Sağlık & Spor': '🏋️',
    'Sanat & Yaratıcılık': '🎨', 'Ulaşım': '🚗', 'Diğer': '✨',
}

interface Props {
    listing: Listing
    className?: string
}

export function ListingCard({ listing, className }: Props) {
    const colorClass = CATEGORY_COLORS[listing.category] ?? CATEGORY_COLORS['Diğer']
    const icon = CATEGORY_ICONS[listing.category] ?? '✨'
    const user = listing.user

    return (
        <Link
            href={`/listings/${listing.id}`}
            className={cn(
                'group block bg-white/5 hover:bg-white/8 border border-white/10 hover:border-purple-500/40',
                'rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/10',
                'hover:-translate-y-0.5 active:translate-y-0',
                className
            )}
        >
            {/* Üst satır: Kategori badge + Tür */}
            <div className="flex items-center justify-between mb-3">
                <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border', colorClass)}>
                    <span>{icon}</span>
                    {listing.category}
                </span>
                <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    listing.type === 'offer'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-amber-500/15 text-amber-400'
                )}>
                    {listing.type === 'offer' ? '✦ Sunuyor' : '⟐ Arıyor'}
                </span>
            </div>

            {/* Başlık */}
            <h3 className="text-white font-semibold text-base mb-2 leading-snug group-hover:text-purple-200 transition-colors line-clamp-2">
                {listing.title}
            </h3>

            {/* Açıklama */}
            {listing.description && (
                <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-2">
                    {listing.description}
                </p>
            )}

            {/* Etiketler */}
            {listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {listing.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                        </span>
                    ))}
                    {listing.tags.length > 3 && (
                        <span className="text-xs text-slate-600">+{listing.tags.length - 3}</span>
                    )}
                </div>
            )}

            {/* Alt satır: Kullanıcı + Kredi */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                {/* Kullanıcı */}
                <div className="flex items-center gap-2 min-w-0">
                    {user?.avatar_url ? (
                        <Image
                            src={user.avatar_url}
                            alt={user.full_name}
                            width={28}
                            height={28}
                            className="rounded-full ring-1 ring-white/10"
                        />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                                {user?.full_name?.charAt(0).toUpperCase() ?? '?'}
                            </span>
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{user?.full_name ?? 'Kullanıcı'}</p>
                        {user?.city && (
                            <p className="text-slate-500 text-xs flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                {user.city}
                            </p>
                        )}
                    </div>
                </div>

                {/* Kredi + Rating */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {user?.rating_avg && (
                        <span className="flex items-center gap-0.5 text-xs text-yellow-400">
                            <Star className="w-3 h-3 fill-yellow-400" />
                            {user.rating_avg.toFixed(1)}
                        </span>
                    )}
                    <div className="flex items-center gap-1 bg-purple-500/15 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-300 text-xs font-semibold">{listing.duration_hrs}s</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
