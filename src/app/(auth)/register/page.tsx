'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signUpWithEmail, signInWithGoogle } from '@/lib/supabase/actions'

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        const formData = new FormData(e.currentTarget)
        const password = formData.get('password') as string
        const confirm = formData.get('confirm_password') as string

        if (password !== confirm) {
            setError('Şifreler eşleşmiyor.')
            return
        }
        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.')
            return
        }

        startTransition(async () => {
            const result = await signUpWithEmail(formData)
            if (result?.error) setError(result.error)
            if (result?.success) setSuccess(result.success)
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
            <div className="text-center mb-7">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 mb-4 shadow-lg shadow-purple-500/30">
                    <span className="text-2xl">⏱</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">HOURA'ya Katıl</h1>
                <p className="text-slate-400 text-sm">
                    Ücretsiz kayıt ol,{' '}
                    <span className="text-green-400 font-semibold">2 başlangıç kredisi</span> kazan! 🎁
                </p>
            </div>

            {/* Hata / Başarı Mesajları */}
            {error && (
                <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-5 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm text-center">
                    {success}
                </div>
            )}

            {/* Google ile Kayıt */}
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
                Google ile Kayıt Ol
            </button>

            {/* Ayırıcı */}
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs text-slate-500">
                    <span className="bg-transparent px-3">veya e-posta ile kayıt ol</span>
                </div>
            </div>

            {/* Kayıt Formu */}
            <form onSubmit={handleRegister} className="space-y-4">
                {/* Ad Soyad */}
                <div>
                    <label htmlFor="full_name" className="block text-sm text-slate-400 mb-1.5">Ad Soyad</label>
                    <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Adınız Soyadınız"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                </div>

                {/* E-posta */}
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

                {/* Şifre */}
                <div>
                    <label htmlFor="password" className="block text-sm text-slate-400 mb-1.5">Şifre</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="En az 6 karakter"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                </div>

                {/* Şifre Tekrar */}
                <div>
                    <label htmlFor="confirm_password" className="block text-sm text-slate-400 mb-1.5">Şifre Tekrar</label>
                    <input
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Şifrenizi tekrar girin"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                </div>

                {/* Gizlilik Onayı */}
                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        required
                        className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50 cursor-pointer"
                    />
                    <span className="text-slate-400 text-xs leading-relaxed">
                        <Link href="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">Kullanım Koşulları</Link>
                        {' '}ve{' '}
                        <Link href="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">Gizlilik Politikası</Link>
                        'nı okudum ve kabul ediyorum.
                    </span>
                </label>

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
                            Hesap oluşturuluyor...
                        </span>
                    ) : 'Hesap Oluştur & 2 Kredi Kazan'}
                </button>
            </form>

            {/* Giriş Linki */}
            <p className="text-center text-slate-500 text-sm mt-6">
                Zaten hesabın var mı?{' '}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    Giriş yap
                </Link>
            </p>
        </div>
    )
}
