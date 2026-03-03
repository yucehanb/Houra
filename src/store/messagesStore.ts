import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Tip tanımları ─────────────────────────────────────────────────────────────
export interface ChatMessage {
    id: string
    senderId: string
    content: string
    isMe: boolean
    created_at: string
}

export interface Conversation {
    id: string
    listingId: string
    listingTitle: string
    listingCredits: number
    participant: { id: string; name: string; avatar: string | null }
    lastMessage: string
    lastMessageTime: string
    unread: number
}

// ── Başlangıç mock verileri ──────────────────────────────────────────────────
const INITIAL_CONVERSATIONS: Conversation[] = [
    { id: 'conv1', listingId: '1', listingTitle: 'İngilizce Konuşma Pratiği', listingCredits: 1, participant: { id: 'u1', name: 'Ayşe Kaya', avatar: null }, lastMessage: 'Tamam, cumartesi öğleden sonra müsaitim.', lastMessageTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(), unread: 2 },
    { id: 'conv2', listingId: '2', listingTitle: 'Bilgisayar Formatı & Kurulum', listingCredits: 2, participant: { id: 'u2', name: 'Mert Demir', avatar: null }, lastMessage: 'Bilgisayarınızı getirebilirsiniz, sorun yok.', lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), unread: 0 },
    { id: 'conv3', listingId: '3', listingTitle: 'Yoga & Meditasyon Dersi', listingCredits: 1, participant: { id: 'u3', name: 'Zeynep Arslan', avatar: null }, lastMessage: 'Yoga dersi için teşekkür ederim!', lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), unread: 0 },
    { id: 'conv4', listingId: '4', listingTitle: 'Logo & Sosyal Medya Tasarımı', listingCredits: 1.5, participant: { id: 'u4', name: 'Emre Şahin', avatar: null }, lastMessage: 'Logo tasarımını haftaya teslim edebilirim.', lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), unread: 1 },
]

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
    conv1: [
        { id: 'm1-1', senderId: 'u1', content: 'Merhaba! İngilizce pratik ilanınızı gördüm. Nasıl çalışıyorsunuz?', isMe: false, created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
        { id: 'm1-2', senderId: 'me', content: 'Merhaba Ayşe Hanım! Genellikle günlük konuşmalar ve dizi diyalogları üzerinden gidiyoruz. Hangi seviyedesiniz?', isMe: true, created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
        { id: 'm1-3', senderId: 'u1', content: 'B1 seviyesindeyim ama konuşmakta zorlanıyorum. Bu hafta sonu müsait misiniz?', isMe: false, created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString() },
        { id: 'm1-4', senderId: 'me', content: 'Cumartesi veya Pazar öğleden sonra uygun. Hangi gün daha iyi?', isMe: true, created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
        { id: 'm1-5', senderId: 'u1', content: 'Tamam, cumartesi öğleden sonra müsaitim.', isMe: false, created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    ],
    conv2: [
        { id: 'm2-1', senderId: 'me', content: 'Merhaba! Bilgisayarımda ciddi yavaşlama var, yardımcı olabilir misiniz?', isMe: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
        { id: 'm2-2', senderId: 'u2', content: 'Tabii ki! Önce uzaktan bakabiliriz, olmadı evinize gelebilirim.', isMe: false, created_at: new Date(Date.now() - 1000 * 60 * 60 * 4.5).toISOString() },
        { id: 'm2-3', senderId: 'u2', content: 'Bilgisayarınızı getirebilirsiniz, sorun yok.', isMe: false, created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    ],
    conv3: [
        { id: 'm3-1', senderId: 'u3', content: 'Yoga dersinden çok memnun kaldım, teşekkürler!', isMe: false, created_at: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString() },
        { id: 'm3-2', senderId: 'me', content: 'Ben de çok keyif aldım! Bir sonraki ders için ne zaman müsaitsiniz?', isMe: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24.5).toISOString() },
        { id: 'm3-3', senderId: 'u3', content: 'Yoga dersi için teşekkür ederim!', isMe: false, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    ],
    conv4: [
        { id: 'm4-1', senderId: 'me', content: 'Merhaba! Logo tasarımı için başvurmak istiyorum.', isMe: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
        { id: 'm4-2', senderId: 'u4', content: 'Merhaba! Hangi sektör için logo düşünüyorsunuz?', isMe: false, created_at: new Date(Date.now() - 1000 * 60 * 60 * 49).toISOString() },
        { id: 'm4-3', senderId: 'u4', content: 'Logo tasarımını haftaya teslim edebilirim.', isMe: false, created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
    ],
}

// ── Store ─────────────────────────────────────────────────────────────────────
interface MessagesState {
    conversations: Conversation[]
    messages: Record<string, ChatMessage[]>
    totalUnread: number
    /** Bir ilan için konuşma oluşturur ya da varsa mevcut conv ID'yi döner */
    addOrGetConversation: (data: Omit<Conversation, 'lastMessage' | 'lastMessageTime' | 'unread'>) => string
    addMessage: (convId: string, msg: ChatMessage) => void
    markAllRead: (convId: string) => void
}

export const useMessagesStore = create<MessagesState>()(
    persist(
        (set, get) => ({
            conversations: INITIAL_CONVERSATIONS,
            messages: INITIAL_MESSAGES,
            totalUnread: INITIAL_CONVERSATIONS.reduce((acc, c) => acc + c.unread, 0),

            addOrGetConversation: (data) => {
                const existing = get().conversations.find(c => c.listingId === data.listingId)
                if (existing) return existing.id

                const newConv: Conversation = {
                    ...data,
                    lastMessage: 'Yeni konuşma başlatıldı.',
                    lastMessageTime: new Date().toISOString(),
                    unread: 0,
                }
                set((s) => ({
                    conversations: [newConv, ...s.conversations],
                    messages: { ...s.messages, [newConv.id]: [] },
                }))
                return newConv.id
            },

            addMessage: (convId, msg) => {
                set((s) => {
                    const existing = s.messages[convId] ?? []
                    const updatedMessages = { ...s.messages, [convId]: [...existing, msg] }
                    const updatedConvs = s.conversations.map(c =>
                        c.id === convId
                            ? { ...c, lastMessage: msg.content, lastMessageTime: msg.created_at }
                            : c
                    )
                    // En son konuşmayı üste taşı
                    const sorted = [...updatedConvs].sort(
                        (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
                    )
                    return { messages: updatedMessages, conversations: sorted }
                })
            },

            markAllRead: (convId) => {
                set((s) => {
                    const updatedConvs = s.conversations.map(c =>
                        c.id === convId ? { ...c, unread: 0 } : c
                    )
                    const total = updatedConvs.reduce((acc, c) => acc + c.unread, 0)
                    return { conversations: updatedConvs, totalUnread: total }
                })
            },
        }),
        {
            name: 'zaman-bankasi-messages',
            // messages objesini de persist et
            partialize: (s) => ({ conversations: s.conversations, messages: s.messages }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.totalUnread = state.conversations.reduce((acc, c) => acc + c.unread, 0)
                }
            },
        }
    )
)
