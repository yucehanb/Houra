import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Info, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/utils'
import { Avatar } from './ConversationList'
import { useMessagesStore } from '@/store/messagesStore'
import { useAuthStore } from '@/store/authStore'

interface Props {
    conversationId: string
    participant: { id: string; name: string; avatar?: string | null }
    listingTitle: string
    listingCredits: number
}

export function ChatView({ conversationId, participant, listingTitle, listingCredits }: Props) {
    const { messages, fetchMessages, sendMessage, subscribeToMessages } = useMessagesStore()
    const currentUser = useAuthStore(s => s.user)

    // Sabit boş dizi referansı
    const liveMessages = messages[conversationId] || []

    const [input, setInput] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const bottomRef = useRef<HTMLDivElement>(null)

    // Mesajları getir ve Realtime dinle
    useEffect(() => {
        if (!conversationId || !currentUser) return

        setIsLoading(true)
        fetchMessages(conversationId).finally(() => setIsLoading(false))

        const unsubscribe = subscribeToMessages(currentUser.id)
        return () => unsubscribe()
    }, [conversationId, currentUser, fetchMessages, subscribeToMessages])

    // Otomatik aşağı kaydır
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [liveMessages])

    const handleSend = async () => {
        const content = input.trim()
        if (!content || !currentUser || isSending) return

        setIsSending(true)
        await sendMessage(conversationId, content, currentUser.id)
        setInput('')
        setIsSending(false)
    }

    return (
        <div className="flex flex-col h-full bg-slate-950/20">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm flex-shrink-0">
                {participant.avatar ? (
                    <img src={participant.avatar} alt={participant.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <Avatar name={participant.name} />
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{participant.name}</p>
                    <p className="text-slate-500 text-xs truncate">{listingTitle}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-purple-300 text-xs font-semibold">{listingCredits} kredi</span>
                </div>
            </div>

            {/* Mesaj Alanı */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                        <p className="text-slate-500 text-xs">Yükleniyor…</p>
                    </div>
                ) : liveMessages.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500 text-sm">Henüz mesaj yok. İlk adımı sen at!</p>
                    </div>
                ) : (
                    liveMessages.map((msg, idx) => {
                        const isMe = msg.sender_id === currentUser?.id
                        const prevMsg = liveMessages[idx - 1]
                        const showTime = !prevMsg || new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 5 * 60 * 1000

                        return (
                            <div key={msg.id}>
                                {showTime && (
                                    <div className="text-center my-3">
                                        <span className="text-slate-600 text-[10px] uppercase tracking-wider">{timeAgo(msg.created_at)}</span>
                                    </div>
                                )}
                                <div className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                                    <div className={cn(
                                        'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-lg',
                                        isMe
                                            ? 'bg-purple-600 text-white rounded-br-sm'
                                            : 'bg-white/10 text-slate-100 border border-white/10 rounded-bl-sm'
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Giriş Alanı */}
            <div className="px-4 py-3 border-t border-white/10 bg-slate-900/80 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                        placeholder="Mesaj yaz…"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isSending}
                        className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-purple-500/20"
                    >
                        {isSending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                    </button>
                </div>
            </div>
        </div>
    )
}
