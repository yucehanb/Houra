'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signUpWithEmail, verifyOtpCode, resendOtp } from '@/lib/supabase/actions'

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    // OTP State
    const [requireOtp, setRequireOtp] = useState(false)
    const [registeredEmail, setRegisteredEmail] = useState('')
    const [otpCode, setOtpCode] = useState('')

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        const formData = new FormData(e.currentTarget)
        const password = formData.get('password') as string
        const confirm = formData.get('confirm_password') as string
        const email = formData.get('email') as string

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
            if (result?.error) {
                setError(result.error)
            } else if (result?.requireOtp) {
                setRequireOtp(true)
                setRegisteredEmail(email)
                if (result.success) setSuccess(result.success)
            } else if (result?.success) {
                setSuccess(result.success)
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
            const result = await verifyOtpCode(registeredEmail, otpCode, 'signup')
            if (result?.error) {
                setError(result.error)
            }
            // Başarılı olursa actions.ts içinde redirect('/dashboard') çalışır.
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
                        <span className="text-2xl">✉️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">E-postanızı Doğrulayın</h1>
                    <p className="text-slate-400 text-sm">
                        <span className="text-white font-medium">{registeredEmail}</span> adresine 6 haneli bir doğrulama kodu gönderdik.
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
                            onClick={() => setRequireOtp(false)}
                            className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
                        >
                            ← Geri Dön ve E-postayı Değiştir
                        </button>
                    </div>
                </div>
            </div>
        )
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
                            Kayıt olunuyor...
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
