'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, Home, PlusSquare, MessageCircle, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useMessagesStore } from '@/store/messagesStore'
import { signOut } from '@/lib/supabase/actions'
import { useTransition } from 'react'

const NAV_HREFS = [
    { href: '/dashboard', label: 'Keşfet', icon: Home },
    { href: '/listings/new', label: 'İlan Ver', icon: PlusSquare },
    { href: '/messages', label: 'Mesajlar', icon: MessageCircle },
    { href: '/profile', label: 'Profil', icon: User },
]

export function Navbar() {
    const pathname = usePathname()
    const user = useAuthStore((s) => s.user)
    const totalUnread = useMessagesStore((s) => s.totalUnread)
    const [isPending, startTransition] = useTransition()

    function handleSignOut() {
        startTransition(async () => { await signOut() })
    }

    return (
        <>
            {/* ── Üst Bar (masaüstü) ─────────────────── */}
            <header className="hidden md:flex fixed top-0 inset-x-0 z-50 h-16 items-center justify-between px-6
        bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-4 group">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 overflow-hidden">
                        <img src="/logo.png" alt="HOURA Logo" className="w-full h-full object-contain scale-[1.8] group-hover:scale-[2.1] transition-transform duration-500" />
                    </div>
                    <span className="text-white font-bold text-3xl tracking-tighter flex items-center drop-shadow-xl -ml-2">
                        H
                        <span className="text-purple-400">O</span>
                        U
                        <span className="text-blue-400">R</span>
                        A
                    </span>
                </Link>

                {/* Merkez Navigasyon */}
                <nav className="flex items-center gap-1">
                    {NAV_HREFS.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href || pathname.startsWith(href + '/')
                        const badge = href === '/messages' ? totalUnread : 0
                        return (
                            <Link key={href} href={href}
                                className={cn(
                                    'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                                    isActive ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                )}>
                                <span className="relative">
                                    <Icon className="w-4 h-4" />
                                    {badge > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-purple-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                                            {badge > 9 ? '9+' : badge}
                                        </span>
                                    )}
                                </span>
                                {label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Sağ: Kredi + Çıkış */}
                <div className="flex items-center gap-3">
                    {user && (
                        <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-purple-300 text-sm font-semibold">{user.credits.toFixed(1)}</span>
                            <span className="text-purple-500 text-xs">kredi</span>
                        </div>
                    )}
                    <button onClick={handleSignOut} disabled={isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-all">
                        <LogOut className="w-4 h-4" />
                        Çıkış
                    </button>
                </div>
            </header>

            {/* ── Alt Bar (mobil) ────────────────────── */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 h-16 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2">
                {NAV_HREFS.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + '/')
                    const badge = href === '/messages' ? totalUnread : 0
                    return (
                        <Link key={href} href={href} className="flex flex-col items-center gap-0.5 py-1 px-3 group">
                            <div className={cn(
                                'relative w-10 h-6 flex items-center justify-center rounded-full transition-all duration-150',
                                active ? 'bg-purple-600/30' : 'group-hover:bg-white/5'
                            )}>
                                <Icon className={cn('w-5 h-5 transition-colors', active ? 'text-purple-300' : 'text-slate-500 group-hover:text-slate-300')} />
                                {badge > 0 && (
                                    <span className="absolute top-0 right-0.5 min-w-[14px] h-3.5 px-0.5 bg-purple-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                                        {badge > 9 ? '9+' : badge}
                                    </span>
                                )}
                            </div>
                            <span className={cn('text-[10px] font-medium transition-colors', active ? 'text-purple-300' : 'text-slate-500')}>{label}</span>
                        </Link>
                    )
                })}
            </nav>
        </>
    )
}
