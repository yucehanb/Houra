import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, Users, TrendingUp, ArrowRight, Zap, BookOpen, Wrench, Laptop } from 'lucide-react'
import { ListingsView } from '@/components/listings/ListingsView'

export const metadata: Metadata = {
    title: 'Keşfet | HOURA',
    description: 'Yetenekleri keşfet, hizmet al ve ver.',
}

const STATS = [
    { icon: Users, label: 'Aktif Kullanıcı', value: '1.240', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { icon: Clock, label: 'Paylaşılan Saat', value: '8.500+', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { icon: TrendingUp, label: 'Bu Ay İlan', value: '340', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
]

const QUICK_CATEGORIES = [
    { icon: BookOpen, label: 'Eğitim', href: '/dashboard?cat=Eğitim', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { icon: Laptop, label: 'Dijital', href: '/dashboard?cat=Dijital', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { icon: Wrench, label: 'Tamirat', href: '/dashboard?cat=Tamirat', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { icon: Zap, label: 'Danışmanlık', href: '/dashboard?cat=Danışmanlık', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
]

export default function DashboardPage() {
    return (
        <div className="space-y-8 pt-2">
            {/* ── Hero Bölümü ─────────────────── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/60 via-slate-900 to-blue-900/60 border border-white/10 p-8 md:p-10">
                {/* Dekoratif arka plan blurları */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 px-3 py-1 rounded-full text-purple-300 text-xs font-medium mb-4">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        340 ilan aktif
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                        HOURA: Zamanın en değerli para birimi. <br />
                        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Yeteneklerini paylaş, ihtiyaçlarını karşıla.
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base mb-6">
                        Para harcama. Yetenek ve zamanını takas et.
                    </p>

                    {/* İstatistikler */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        {STATS.map(({ icon: Icon, label, value, color, bg }) => (
                            <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${bg}`}>
                                <Icon className={`w-4 h-4 ${color}`} />
                                <span className="text-white font-bold text-sm">{value}</span>
                                <span className="text-slate-400 text-xs">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <Link
                        href="/listings/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-purple-500/30 group"
                    >
                        İlan Ver
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* ── Hızlı Kategori Butonları ─── */}
            <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Popüler Kategoriler</p>
                <div className="flex flex-wrap gap-2">
                    {QUICK_CATEGORIES.map(({ icon: Icon, label, href, color }) => (
                        <Link
                            key={label}
                            href={href}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:scale-105 active:scale-95 ${color}`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── İlan Listesi ────────────────── */}
            <ListingsView />
        </div >
    )
}
