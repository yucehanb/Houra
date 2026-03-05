'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, Star, X } from 'lucide-react'
import { ReviewModal } from './ReviewModal'

interface Props {
    conversationId: string
    participantName: string
    listingTitle: string
    creditsAmount: number
    convStatus: 'pending' | 'completed' | 'cancelled'
    isBuyer: boolean
}

export function CompleteServiceCard({
    conversationId,
    participantName,
    listingTitle,
    creditsAmount,
    convStatus,
    isBuyer,
}: Props) {
    const [showModal, setShowModal] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    // Sadece alıcıya ve sadece pending durumda göster
    if (!isBuyer || isDismissed) return null

    if (convStatus === 'completed') {
        return (
            <div className="mx-4 mb-3 flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <div>
                    <p className="text-green-300 text-xs font-semibold">Hizmet tamamlandı</p>
                    <p className="text-slate-500 text-xs">{creditsAmount} kredi {participantName}'e aktarıldı</p>
                </div>
            </div>
        )
    }

    if (convStatus === 'cancelled') return null

    return (
        <>
            <div className="mx-4 mb-3 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 relative group/card">
                <button
                    onClick={() => setIsDismissed(true)}
                    className="absolute top-2 right-2 p-1 text-slate-600 hover:text-slate-400 opacity-0 group-hover/card:opacity-100 transition-all rounded-full hover:bg-white/5"
                    title="Kapat"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold">Hizmeti aldın mı?</p>
                        <p className="text-slate-500 text-xs truncate">
                            Tamamlandığında <span className="text-purple-400 font-medium">{creditsAmount} kredi</span> {participantName}'e aktarılacak
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/15"
                >
                    <Star className="w-3.5 h-3.5" />
                    Tamamlandı &amp; Değerlendir
                </button>
            </div>

            {showModal && (
                <ReviewModal
                    conversationId={conversationId}
                    participantName={participantName}
                    listingTitle={listingTitle}
                    creditsAmount={creditsAmount}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => setShowModal(false)}
                />
            )}
        </>
    )
}
