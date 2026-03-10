'use client'

import { useState, useTransition } from 'react'
import { updatePassword } from '@/lib/supabase/actions'

export default function UpdatePasswordPage() {
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)

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
            const result = await updatePassword(formData)
            if (result?.error) setError(result.error)
            // success handles redirect in action
        })
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-4 shadow-lg shadow-green-500/30">
                    <span className="text-2xl">🔐</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Yeni Şifre Belirle</h1>
                <p className="text-slate-400 text-sm">Hesabınız için yeni bir şifre oluşturun</p>
            </div>

            {error && (
                <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="password" className="block text-sm text-slate-400 mb-1.5">Yeni Şifre</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        placeholder="En az 6 karakter"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                    />
                </div>

                <div>
                    <label htmlFor="confirm_password" className="block text-sm text-slate-400 mb-1.5">Şifre Tekrar</label>
                    <input
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        required
                        placeholder="Şifrenizi tekrar girin"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-sm hover:from-green-500 hover:to-emerald-500 active:scale-95 transition-all duration-150 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                    {isPending ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
                </button>
            </form>
        </div>
    )
}
