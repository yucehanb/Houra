'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signInWithEmail, verifyOtpCode, resendOtp } from '@/lib/supabase/actions'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    // OTP State
    const [requireOtp, setRequireOtp] = useState(false)
    const [registeredEmail, setRegisteredEmail] = useState('')
    const [otpCode, setOtpCode] = useState('')

    async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string

        startTransition(async () => {
            const result = await signInWithEmail(formData)
            if (result?.error) {
                if (result.requireOtp) {
                    setRequireOtp(true)
                    setRegisteredEmail(email)
                }
                setError(result.error)
            }
        })
    }

    async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (!otpCode || otpCode.length !== 6) {
            setError('Lütfen 6 haneli kodu eksiksiz girin.')
            return
        }

        startTransition(async () => {
            // Note: If type='signup' doesn't work for existing users logging in, we might need type='magiclink', but usually login doesn't need OTP unless email is unconfirmed. If it's unconfirmed, it's still 'signup' type or we just resend the confirmation.
            const result = await verifyOtpCode(registeredEmail, otpCode, 'signup')
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    async function handleResendOtp() {
        setError(null)
        setSuccess('Yeni kod gönderiliyor...')
        startTransition(async () => {
            const result = await resendOtp(registeredEmail)
            if (result?.error) setError(result.error)
            if (result?.success) setSuccess(result.success)
        })
    }

    if (requireOtp) {
        return (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-7">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 mb-4 shadow-lg shadow-purple-500/30">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">E-posta Onayı Gerekli</h1>
                    <p className="text-slate-400 text-sm">
                        Giriş yapabilmek için lütfen e-postanızı doğrulayın. <span className="text-white font-medium">{registeredEmail}</span> adresine 6 haneli kodu gönderdik.
                    </p>
                </div>

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

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                        <label htmlFor="otp" className="block text-sm text-slate-400 mb-2 text-center">6 Haneli Kod</label>
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            maxLength={6}
                            value={otpCode}
                            onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="••••••"
                            className="w-full text-center tracking-[0.5em] text-2xl px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending || otpCode.length !== 6}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm hover:from-purple-500 hover:to-blue-500 active:scale-95 transition-all duration-150 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {isPending ? 'Doğrulanıyor...' : 'Doğrula ve Giriş Yap'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleResendOtp}
                        disabled={isPending}
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                    >
                        Kodu tekrar gönder
                    </button>
                    <div className="mt-4">
                        <button
                            onClick={() => { setRequireOtp(false); setError(null); setSuccess(null); }}
                            className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
                        >
                            ← Geri Dön
                        </button>
                    </div>
                </div>
            </div>
        )
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

            {/* E-posta / Şifre Formu */}
            <form onSubmit={handleEmailLogin} className="space-y-4 mt-2">
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
