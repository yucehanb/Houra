'use client'

import { useEffect } from 'react'
import { useMessagesStore } from '@/store/messagesStore'
import { useAuthStore } from '@/store/authStore'
import { ConversationList } from '@/components/messages/ConversationList'
import { MessageCircle, Loader2 } from 'lucide-react'

export default function MessagesPage() {
    const { conversations, totalUnread, fetchConversations, isLoading } = useMessagesStore()
    const user = useAuthStore(s => s.user)

    useEffect(() => {
        if (user?.id) {
            fetchConversations(user.id)
        }
    }, [user?.id, fetchConversations])

    return (
        <div className="flex h-full overflow-hidden">
            {/* Sol: Konuşma Listesi */}
            <div className="w-full md:w-80 lg:w-96 border-r border-white/10 flex flex-col bg-slate-900 flex-shrink-0">
                <div className="px-4 py-4 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-base">Mesajlar</h1>
                            <p className="text-slate-500 text-xs">
                                {isLoading ? (
                                    <span className="flex items-center gap-1">
                                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> Yükleniyor
                                    </span>
                                ) : (
                                    <>
                                        {totalUnread > 0 ? <span className="text-purple-400 font-semibold">{totalUnread}</span> : '0'} okunmamış
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
                <ConversationList conversations={conversations} />
            </div>

            {/* Sağ: Boş durum */}
            <div className="hidden md:flex flex-1 items-center justify-center bg-slate-950/30">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-semibold">Bir konuşma seç</p>
                    <p className="text-slate-600 text-sm mt-1">Soldan bir konuşmaya tıkla</p>
                </div>
            </div>
        </div>
    )
}
