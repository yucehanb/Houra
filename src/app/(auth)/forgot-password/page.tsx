'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { sendPasswordResetEmail } from '@/lib/supabase/actions'

export default function ForgotPasswordPage() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = await sendPasswordResetEmail(formData)
            if (result?.error) setError(result.error)
            if (result?.success) setSuccess(result.success)
        })
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Logo & Başlık */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 mb-4 shadow-lg shadow-purple-500/30">
                    <span className="text-2xl">🔑</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Şifremi Unuttum</h1>
                <p className="text-slate-400 text-sm">Hesabınıza bağlı e-posta adresini girin</p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm text-slate-400 mb-1.5">E-posta</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="ornek@email.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending || !!success}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-blue-500 active:scale-95 transition-all duration-150 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                    {isPending ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                    ← Giriş ekranına dön
                </Link>
            </div>
        </div>
    )
}
