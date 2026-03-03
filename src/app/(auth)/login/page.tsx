'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signInWithEmail, signInWithGoogle } from '@/lib/supabase/actions'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            const result = await signInWithEmail(formData)
            if (result?.error) setError(result.error)
        })
    }

    async function handleGoogleLogin() {
        setError(null)
        startTransition(async () => {
            const result = await signInWithGoogle()
            if (result?.error) setError(result.error)
        })
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Logo & Başlık */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 mb-4 shadow-lg shadow-purple-500/30">
                    <span className="text-2xl">⏱</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Tekrar hoş geldin!</h1>
                <p className="text-slate-400 text-sm">HOURA dünyasına giriş yap</p>
            </div>

            {/* Hata Mesajı */}
            {error && (
                <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            {/* Google ile Giriş */}
            <button
                onClick={handleGoogleLogin}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white text-sm font-medium hover:bg-white/10 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google ile Giriş Yap
            </button>

            {/* Ayırıcı */}
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs text-slate-500">
                    <span className="bg-transparent px-3">veya e-posta ile devam et</span>
                </div>
            </div>

            {/* E-posta / Şifre Formu */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm text-slate-400 mb-1.5">E-posta</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="ornek@email.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="password" className="block text-sm text-slate-400">Şifre</label>
                        <Link href="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                            Şifremi unuttum
                        </Link>
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-blue-500 active:scale-95 transition-all duration-150 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 mt-2"
                >
                    {isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Giriş yapılıyor...
                        </span>
                    ) : 'Giriş Yap'}
                </button>
            </form>

            {/* Kayıt Ol Linki */}
            <p className="text-center text-slate-500 text-sm mt-6">
                Hesabın yok mu?{' '}
                <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    Kayıt ol
                </Link>
                {' '}ve <span className="text-green-400 font-medium">2 ücretsiz kredi</span> kazan! 🎁
            </p>
        </div>
    )
}
