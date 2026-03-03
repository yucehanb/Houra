'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { useMessagesStore } from '@/store/messagesStore'
import { useAuthStore } from '@/store/authStore'
import { ConversationList } from '@/components/messages/ConversationList'
import { ChatView } from '@/components/messages/ChatView'

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { conversations, fetchConversations } = useMessagesStore()
    const user = useAuthStore(s => s.user)

    useEffect(() => {
        if (user?.id && conversations.length === 0) {
            fetchConversations(user.id)
        }
    }, [user?.id, conversations.length, fetchConversations])

    const conv = conversations.find(c => c.id === id)

    // Not found only if we are not loading and still don't have it
    if (!conv && conversations.length > 0) notFound()
    if (!conv) return null // Loading...

    return (
        <div className="flex h-full overflow-hidden">
            {/* Sol: Konuşma listesi (masaüstü) */}
            <div className="hidden md:flex w-80 lg:w-96 border-r border-white/10 flex-col bg-slate-900 flex-shrink-0">
                <div className="px-4 py-4 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-base">Mesajlar</h1>
                        </div>
                    </div>
                </div>
                <ConversationList conversations={conversations} activeId={id} />
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col min-w-0">
                <ChatView
                    conversationId={id}
                    participant={conv.participant}
                    listingTitle={conv.listing_title || ''}
                    listingCredits={conv.listing_credits || 0}
                />
            </div>
        </div>
    )
}
