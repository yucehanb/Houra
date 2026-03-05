'use client'

import { useState } from 'react'
import { Star, X, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMessagesStore } from '@/store/messagesStore'
import { useAuthStore } from '@/store/authStore'

interface Props {
    conversationId: string
    participantName: string
    listingTitle: string
    creditsAmount: number
    onClose: () => void
    onSuccess: () => void
}

export function ReviewModal({
    conversationId,
    participantName,
    listingTitle,
    creditsAmount,
    onClose,
    onSuccess,
}: Props) {
    const [rating, setRating] = useState(0)
    const [hovered, setHovered] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [statusText, setStatusText] = useState('')

    const { completeTransaction } = useMessagesStore()
    const currentUser = useAuthStore(s => s.user)

    const LABELS = ['', 'Kötü', 'Fena değil', 'İyi', 'Çok iyi', 'Mükemmel']

    async function handleSubmit() {
        if (rating === 0) { setError('Lütfen bir puan ver.'); return }
        if (!currentUser) return

        setIsSubmitting(true)
        setError(null)
        try {
            setStatusText('Store verileri kontrol ediliyor...')
            await completeTransaction(conversationId, rating, comment, currentUser.id, setStatusText)
            setStatusText('Başarılı! Bitiş...')
            setSuccess(true)
            setTimeout(() => {
                onSuccess()
                onClose()
            }, 2000)
        } catch (e: any) {
            setError(e?.message || 'Bir hata oluştu, tekrar dene.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Arka plan overlay */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={!isSubmitting ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
                {/* Dekoratif gradient */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <div>
                        <h2 className="text-white font-bold text-lg">Hizmeti Değerlendir</h2>
                        <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[280px]">{listingTitle}</p>
                    </div>
                    {!isSubmitting && !success && (
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="px-6 pb-6 space-y-5">
                    {success ? (
                        /* Başarı ekranı */
                        <div className="flex flex-col items-center justify-center py-8 space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-400" />
                            </div>
                            <p className="text-white font-bold text-lg">Tamamlandı! 🎉</p>
                            <p className="text-slate-400 text-sm text-center">
                                Değerlendirmen kaydedildi.<br />
                                <span className="text-purple-400 font-semibold">{creditsAmount} kredi</span> {participantName} hesabına aktarıldı.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Kredi bilgisi */}
                            <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 rounded-2xl px-4 py-3">
                                <div>
                                    <p className="text-slate-400 text-xs">{participantName}'e aktarılacak kredi</p>
                                    <p className="text-purple-300 font-bold text-xl">{creditsAmount} saat</p>
                                </div>
                                <div className="text-3xl">⏱️</div>
                            </div>

                            {/* Yıldız seçici */}
                            <div className="space-y-2">
                                <p className="text-slate-300 text-sm font-medium">Puan</p>
                                <div className="flex items-center justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <button
                                            key={i}
                                            onMouseEnter={() => setHovered(i)}
                                            onMouseLeave={() => setHovered(0)}
                                            onClick={() => setRating(i)}
                                            className="transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star
                                                className={cn(
                                                    'w-9 h-9 transition-colors',
                                                    i <= (hovered || rating)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-slate-700'
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {(hovered || rating) > 0 && (
                                    <p className="text-center text-slate-400 text-sm font-medium animate-in fade-in duration-150">
                                        {LABELS[hovered || rating]}
                                    </p>
                                )}
                            </div>

                            {/* Yorum */}
                            <div className="space-y-2">
                                <p className="text-slate-300 text-sm font-medium">Yorum <span className="text-slate-600">(opsiyonel)</span></p>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Deneyimini paylaş..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-600 text-sm resize-none focus:outline-none focus:border-purple-500/50 transition-all"
                                />
                            </div>

                            {/* Hata */}
                            {error && (
                                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                                    {error}
                                </p>
                            )}

                            {/* Butonlar */}
                            <div className="flex gap-2">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition-all"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || rating === 0}
                                    className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting
                                        ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor…</div>
                                                <span className="text-[10px] font-normal opacity-70 mt-1">{statusText}</span>
                                            </div>
                                        )
                                        : <><Send className="w-4 h-4" /> Onayla &amp; Gönder</>
                                    }
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
