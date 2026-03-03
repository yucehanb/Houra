import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Info, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/utils'
import { Avatar } from './ConversationList'
import { useMessagesStore } from '@/store/messagesStore'
import type { ChatMessage } from '@/store/messagesStore'

// Sabit boş dizi — her render'da yeni referans OLuşturmaz
const EMPTY_MSGS: ChatMessage[] = []

interface Props {
    conversationId: string
    participant: { id: string; name: string }
    listingTitle: string
    listingCredits: number
    initialMessages: ChatMessage[]
}

export function ChatView({ conversationId, participant, listingTitle, listingCredits, initialMessages }: Props) {
    const addMessage = useMessagesStore((s) => s.addMessage)
    // Stable selector: konuşma bulunamazsa sabit EMPTY_MSGS kullan (yeni referans yok)
    const liveMessages = useMessagesStore(
        useCallback((s) => s.messages[conversationId] ?? EMPTY_MSGS, [conversationId])
    )

    const [input, setInput] = useState('')
    const [isSending, setIsSending] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    // İlk açılışta başlangıç mesajlarını store'a ekle (sadece bir kez)
    useEffect(() => {
        if (initialMessages.length > 0) {
            const state = useMessagesStore.getState()
            if (!state.messages[conversationId] || state.messages[conversationId].length === 0) {
                initialMessages.forEach(msg => state.addMessage(conversationId, msg))
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [liveMessages])

    const sendMessage = () => {
        const content = input.trim()
        if (!content || isSending) return
        setIsSending(true)

        const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            senderId: 'me',
            content,
            isMe: true,
            created_at: new Date().toISOString(),
        }
        // Store'a ekle — tüm bileşenler (ConversationList, Navbar badge) anında güncellenir
        addMessage(conversationId, newMsg)
        setInput('')
        setIsSending(false)
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm flex-shrink-0">
                <Avatar name={participant.name} />
                <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{participant.name}</p>
                    <p className="text-slate-500 text-xs truncate">{listingTitle}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-purple-300 text-xs font-semibold">{listingCredits} saat</span>
                </div>
            </div>

            {/* Info banner */}
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/5 border-b border-blue-500/10 flex-shrink-0">
                <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <p className="text-blue-300/70 text-xs">Bu konuşma <span className="font-medium text-blue-300">"{listingTitle}"</span> ilanı hakkında.</p>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {liveMessages.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500 text-sm">Henüz mesaj yok. İlk mesajı gönder!</p>
                    </div>
                )}
                {liveMessages.map((msg, idx) => {
                    const prevMsg = liveMessages[idx - 1]
                    const showTime = !prevMsg || new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 5 * 60 * 1000
                    return (
                        <div key={msg.id}>
                            {showTime && (
                                <div className="text-center my-3">
                                    <span className="text-slate-600 text-xs">{timeAgo(msg.created_at)}</span>
                                </div>
                            )}
                            <div className={cn('flex', msg.isMe ? 'justify-end' : 'justify-start')}>
                                <div className={cn(
                                    'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                                    msg.isMe
                                        ? 'bg-purple-600 text-white rounded-br-sm'
                                        : 'bg-white/8 text-slate-200 border border-white/10 rounded-bl-sm'
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/10 bg-slate-900/80 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                        placeholder="Mesaj yaz…"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isSending}
                        className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
        </div>
    )
}
