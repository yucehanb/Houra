'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/utils'
import type { Conversation } from '@/store/messagesStore'

// Avatar bileşeni — diğer dosyalar da import edebilir
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    const hue = (name.charCodeAt(0) + name.charCodeAt(name.length - 1)) * 15 % 360
    const dims = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
    return (
        <div className={cn('rounded-full flex items-center justify-center font-bold text-white flex-shrink-0', dims)}
            style={{ background: `linear-gradient(135deg, hsl(${hue},65%,50%), hsl(${(hue + 60) % 360},65%,40%))` }}>
            {initials}
        </div>
    )
}

interface Props {
    conversations: Conversation[]
    activeId?: string
}

export function ConversationList({ conversations, activeId }: Props) {
    const pathname = usePathname()

    if (conversations.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div>
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-slate-500 text-sm">Henüz konuşma yok</p>
                    <p className="text-slate-600 text-xs mt-1">Bir ilan üzerinden mesaj gönder</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {conversations.map((conv) => {
                const isActive = activeId === conv.id || pathname === `/messages/${conv.id}`
                return (
                    <Link key={conv.id} href={`/messages/${conv.id}`}
                        className={cn('flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-white/5',
                            isActive && 'bg-purple-600/10 hover:bg-purple-600/15 border-l-2 border-purple-500'
                        )}>
                        <div className="relative flex-shrink-0">
                            {conv.participant.avatar ? (
                                <img src={conv.participant.avatar} alt={conv.participant.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <Avatar name={conv.participant.name} />
                            )}
                            {conv.unread_count > 0 && (
                                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] px-0.5 bg-purple-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                                    {conv.unread_count}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                <p className={cn('text-sm font-semibold truncate', isActive ? 'text-purple-200' : 'text-white')}>
                                    {conv.participant.name}
                                </p>
                                <span className="text-slate-600 text-xs flex-shrink-0">
                                    {conv.last_message_at ? timeAgo(conv.last_message_at) : ''}
                                </span>
                            </div>
                            <p className="text-slate-500 text-xs truncate mb-0.5">{conv.listing_title}</p>
                            <p className={cn('text-xs truncate', conv.unread_count > 0 ? 'text-slate-300 font-medium' : 'text-slate-500')}>
                                {conv.last_message || 'Henüz mesaj yok'}
                            </p>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
