import { useState, useRef, useEffect } from 'react'
import { Send, Clock, Loader2, Video, ExternalLink, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/utils'
import { Avatar } from './ConversationList'
import { CompleteServiceCard } from './CompleteServiceCard'
import { useMessagesStore } from '@/store/messagesStore'
import { useAuthStore } from '@/store/authStore'

interface Props {
    conversationId: string
    participant: { id: string; name: string; avatar?: string | null }
    listingTitle: string
    listingCredits: number
    convStatus: 'pending' | 'completed' | 'cancelled'
    buyerId: string
    sellerId: string
}

export function ChatView({ conversationId, participant, listingTitle, listingCredits, convStatus, buyerId, sellerId }: Props) {
    const { messages, fetchMessages, sendMessage, subscribeToMessages, markAsRead, deleteMessage } = useMessagesStore()
    const currentUser = useAuthStore(s => s.user)
    const isBuyer = currentUser?.id === buyerId

    // Sabit boş dizi referansı ve ID'ye göre tekilleştirme (Duplicate key hatası engellemek için)
    const rawMessages = messages[conversationId] || []
    const liveMessages = Array.from(new Map(rawMessages.map(m => [m.id, m])).values())

    const [input, setInput] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isCreatingRoom, setIsCreatingRoom] = useState(false)
    const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set())
    const bottomRef = useRef<HTMLDivElement>(null)

    // Mesajları getir ve Realtime dinle
    useEffect(() => {
        if (!conversationId || !currentUser) return

        setIsLoading(true)
        fetchMessages(conversationId).then(() => {
            // Konuşmayı açınca okunmamışları temizle
            markAsRead(conversationId, currentUser.id)
        }).finally(() => setIsLoading(false))

        const unsubscribe = subscribeToMessages(currentUser.id)
        return () => unsubscribe()
    }, [conversationId, currentUser, fetchMessages, subscribeToMessages, markAsRead])

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

    const handleCreateVideoCall = async () => {
        if (isCreatingRoom || !currentUser) return
        setIsCreatingRoom(true)
        try {
            const res = await fetch('/api/video/create-room', { method: 'POST' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            // Özel tag ile odaya davet linki gönder
            const callMessage = `[VIDEO_CALL_LINK]${data.name}`
            await sendMessage(conversationId, callMessage, currentUser.id)
        } catch (error: any) {
            console.error('Video room creation failed:', error)
            alert('Görüntülü görüşme başlatılamadı: ' + error.message)
        } finally {
            setIsCreatingRoom(false)
        }
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
                <div className="flex items-center gap-2">
                    {!isBuyer && (
                        <button
                            onClick={handleCreateVideoCall}
                            disabled={isCreatingRoom}
                            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                            title="Görüntülü Görüşme Başlat"
                        >
                            {isCreatingRoom ? <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" /> : <Video className="w-4 h-4 text-emerald-400" />}
                            <span className="text-emerald-300 text-xs font-semibold hidden sm:inline">Görüşme Başlat</span>
                        </button>
                    )}
                    <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-purple-300 text-xs font-semibold">{listingCredits} kredi</span>
                    </div>
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

                        const isVideoCall = msg.content.startsWith('[VIDEO_CALL_LINK]')
                        const roomName = isVideoCall ? msg.content.replace('[VIDEO_CALL_LINK]', '') : ''

                        return (
                            <div key={msg.id}>
                                {showTime && (
                                    <div className="text-center my-3">
                                        <span className="text-slate-600 text-[10px] uppercase tracking-wider">{timeAgo(msg.created_at)}</span>
                                    </div>
                                )}
                                <div className={cn('flex group relative items-center gap-2', isMe ? 'justify-end' : 'justify-start')}>
                                    {isVideoCall ? (
                                        !dismissedCards.has(msg.id) && (
                                            <div className="w-full max-w-[280px] bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-4 space-y-3 shadow-lg relative">
                                                <button
                                                    onClick={() => setDismissedCards(prev => new Set(prev).add(msg.id))}
                                                    className="absolute top-2 right-2 text-emerald-500/50 hover:text-emerald-400 p-1 rounded-full hover:bg-emerald-500/10 transition-colors"
                                                    title="Gizle"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0" >
                                                        <Video className="w-5 h-5 text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-emerald-300 text-sm font-semibold">Görüntülü Görüşme</p>
                                                        <p className="text-emerald-500/70 text-[11px] leading-tight mt-0.5">Davete katılmak için tıklayın</p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={`/video/${roomName}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                                                >
                                                    Odaya Katıl <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        )
                                    ) : (
                                        <>
                                            {isMe && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Bu mesajı silmek istiyor musun?')) {
                                                            deleteMessage(msg.id, conversationId)
                                                        }
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all flex items-center flex-shrink-0"
                                                    title="Mesajı Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <div className={cn(
                                                'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-lg relative',
                                                isMe
                                                    ? 'bg-purple-600 text-white rounded-br-sm'
                                                    : 'bg-white/10 text-slate-100 border border-white/10 rounded-bl-sm'
                                            )}>
                                                {msg.content}
                                            </div>
                                            {!isMe && (
                                                <div className="w-8 flex-shrink-0" /> /* Spacer if needed for alignment, or remove */
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Tamamlama Kartı (sadece alıcıya) */}
            <CompleteServiceCard
                conversationId={conversationId}
                participantName={participant.name}
                listingTitle={listingTitle}
                creditsAmount={listingCredits}
                convStatus={convStatus}
                isBuyer={isBuyer}
            />

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
