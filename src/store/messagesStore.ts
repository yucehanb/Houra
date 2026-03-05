import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'
import { useAuthStore } from '@/store/authStore'

const supabase = createClient()

// ── Tip tanımları ─────────────────────────────────────────────────────────────
export interface ChatMessage {
    id: string
    conversation_id: string
    sender_id: string
    content: string
    created_at: string
    is_read?: boolean
}

export interface Conversation {
    id: string
    listing_id: string
    listing_title?: string
    listing_credits?: number
    participant: { id: string; name: string; avatar: string | null }
    last_message: string
    last_message_at: string
    unread_count: number
    // Transaction
    transaction_id: string | null
    conv_status: 'pending' | 'completed' | 'cancelled'
    buyer_id: string
    seller_id: string
}

// ── Store ─────────────────────────────────────────────────────────────────────
interface MessagesState {
    conversations: Conversation[]
    messages: Record<string, ChatMessage[]>
    totalUnread: number
    isLoading: boolean

    // Actions
    fetchConversations: (userId: string) => Promise<void>
    fetchMessages: (conversationId: string) => Promise<void>
    sendMessage: (conversationId: string, content: string, senderId: string) => Promise<void>
    getOrCreateConversation: (listingId: string, buyerId: string, sellerId: string, creditsAmount: number) => Promise<string>
    markAsRead: (conversationId: string, userId: string) => Promise<void>
    completeTransaction: (conversationId: string, rating: number, comment: string, currentUserId: string, onProgress?: (msg: string) => void) => Promise<void>

    activeSubscription: any
    subscribeToMessages: (userId: string) => () => void
    deleteMessage: (messageId: string, conversationId: string) => Promise<void>
    deleteConversation: (conversationId: string) => Promise<void>
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
    conversations: [],
    messages: {},
    totalUnread: 0,
    isLoading: false,

    fetchConversations: async (userId) => {
        set({ isLoading: true })
        console.log('[fetchConversations] Başlıyor, userId:', userId)
        try {
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    listing:listings(title, duration_hrs),
                    buyer:users!conversations_buyer_id_fkey(id, full_name, avatar_url),
                    seller:users!conversations_seller_id_fkey(id, full_name, avatar_url)
                `)
                .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
                .order('last_message_at', { ascending: false })

            if (error) {
                console.error('[fetchConversations] Supabase çekme hatası:', error)
                throw error
            }

            console.log('[fetchConversations] Veri geldi, liste uzunluğu:', data?.length)

            // Her konuşma için okunmamış mesaj sayısını çek
            const unreadCounts = await Promise.all(
                data.map(async (c) => {
                    const { count, error: countErr } = await supabase
                        .from('messages')
                        .select('id', { count: 'exact', head: true })
                        .eq('conversation_id', c.id)
                        .eq('is_read', false)
                        .neq('sender_id', userId)

                    if (countErr) {
                        console.error(`[fetchConversations] Unread count hatası (conv ${c.id}):`, countErr)
                    }
                    return { id: c.id, count: count ?? 0 }
                })
            )
            const unreadMap = Object.fromEntries(unreadCounts.map(u => [u.id, u.count]))

            const formattedConvs: Conversation[] = data.map(c => {
                const isBuyer = c.buyer_id === userId
                const participant = isBuyer ? c.seller : c.buyer
                return {
                    id: c.id,
                    listing_id: c.listing_id,
                    listing_title: c.listing?.title || 'İlan Silinmiş',
                    listing_credits: c.listing?.duration_hrs || 0,
                    participant: {
                        id: participant?.id || 'silinmis-kullanici',
                        name: participant?.full_name || 'Silinmiş Kullanıcı',
                        avatar: participant?.avatar_url || null
                    },
                    last_message: c.last_message || '',
                    last_message_at: c.last_message_at,
                    unread_count: unreadMap[c.id] ?? 0,
                    transaction_id: c.transaction_id ?? null,
                    conv_status: (c.status ?? 'pending') as 'pending' | 'completed' | 'cancelled',
                    buyer_id: c.buyer_id,
                    seller_id: c.seller_id,
                }
            })

            const totalUnread = formattedConvs.reduce((sum, c) => sum + c.unread_count, 0)
            console.log('[fetchConversations] Başarılı. formattedConvs:', formattedConvs.length)
            set({ conversations: formattedConvs, totalUnread })
        } catch (error: any) {
            console.error('[fetchConversations] Genel Hata:', error, error?.message)
        } finally {
            console.log('[fetchConversations] isLoading false yapılıyor')
            set({ isLoading: false })
        }
    },

    fetchMessages: async (conversationId) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })

            if (error) throw error

            set(state => ({
                messages: { ...state.messages, [conversationId]: data }
            }))
        } catch (error) {
            console.error('Error fetching messages:', error)
        }
    },

    sendMessage: async (conversationId, content, senderId) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: senderId,
                    content
                })
                .select()
                .single()

            if (error) throw error

            // Update conversation last message local and remote
            await supabase
                .from('conversations')
                .update({
                    last_message: content,
                    last_message_at: new Date().toISOString()
                })
                .eq('id', conversationId)

            // Local update (Realtime may have already added this message)
            set(state => {
                const existing = state.messages[conversationId] || []
                if (existing.some(m => m.id === data.id)) return state

                return {
                    messages: {
                        ...state.messages,
                        [conversationId]: [...existing, data]
                    },
                    conversations: state.conversations.map(c =>
                        c.id === conversationId
                            ? { ...c, last_message: content, last_message_at: data.created_at }
                            : c
                    ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
                }
            })
        } catch (error) {
            console.error('Error sending message:', error)
        }
    },

    getOrCreateConversation: async (listingId, buyerId, sellerId, creditsAmount) => {
        // Mevcut konuşmayı bul
        const { data: existing } = await supabase
            .from('conversations')
            .select('id, transaction_id')
            .eq('listing_id', listingId)
            .eq('buyer_id', buyerId)
            .eq('seller_id', sellerId)
            .maybeSingle()

        if (existing) return existing.id

        // Yeni konuşma oluştur
        const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({ listing_id: listingId, buyer_id: buyerId, seller_id: sellerId })
            .select('id')
            .single()

        if (createError) throw createError

        // Transaction oluştur
        const { data: txn, error: txnError } = await supabase
            .from('transactions')
            .insert({
                conversation_id: newConv.id,
                listing_id: listingId,
                buyer_id: buyerId,
                seller_id: sellerId,
                credits_amount: creditsAmount,
                status: 'pending'
            })
            .select('id')
            .single()

        if (txnError) throw txnError

        // Konuşmaya transaction_id bağla
        await supabase
            .from('conversations')
            .update({ transaction_id: txn.id })
            .eq('id', newConv.id)

        return newConv.id
    },

    completeTransaction: async (conversationId, rating, comment, currentUserId, onProgress) => {
        onProgress?.('Store verileri alınıyor...')
        let conv = get().conversations.find(c => c.id === conversationId)

        // ── 1) Store'da transaction_id var mı? ─────────────────────────
        let transactionId = conv?.transaction_id ?? null

        // ── 2) Yoksa transactions tablosunu doğrudan sorgula ───────────
        if (!transactionId) {
            onProgress?.('Pending transaction aranıyor (DB)...')
            const { data: txnRow } = await supabase
                .from('transactions')
                .select('id, buyer_id, seller_id, credits_amount')
                .eq('conversation_id', conversationId)
                .eq('status', 'pending')
                .single()

            if (txnRow) {
                transactionId = txnRow.id
                onProgress?.('Transaction DB\'de bulundu...')

                // Store'daki conv nesnesini de güncelle
                if (conv) {
                    conv = {
                        ...conv,
                        transaction_id: txnRow.id,
                        buyer_id: txnRow.buyer_id,
                        seller_id: txnRow.seller_id,
                        listing_credits: txnRow.credits_amount,
                    }
                    set(state => ({
                        conversations: state.conversations.map(c =>
                            c.id === conversationId ? { ...c, ...conv } : c
                        )
                    }))
                }
            }
        }

        // ── 3) Hâlâ yoksa: bu eski bir konuşma, DB'den conversation bilgilerini
        //       çekip yeni bir transaction oluştur ──────────────────────────────
        if (!transactionId) {
            onProgress?.('Hiç transaction yok. Yeni bir tane oluşturuluyor...')
            const { data: convRow, error: convErr } = await supabase
                .from('conversations')
                .select('id, buyer_id, seller_id, listing_id, listing:listings(duration_hrs)')
                .eq('id', conversationId)
                .single()

            if (convErr) onProgress?.('Konuşma bilgilerini çekerken hata: ' + convErr.message)
            if (!convRow) throw new Error('Konuşma bulunamadı.')

            const credits = (convRow.listing as any)?.duration_hrs ?? conv?.listing_credits ?? 0

            onProgress?.(`Yeni transaction INSERT atılıyor (${credits} kredi)...`)
            const { data: newTxn, error: txnErr } = await supabase
                .from('transactions')
                .insert({
                    conversation_id: conversationId,
                    listing_id: convRow.listing_id,
                    buyer_id: convRow.buyer_id,
                    seller_id: convRow.seller_id,
                    credits_amount: credits,
                    status: 'pending'
                })
                .select('id')
                .single()

            if (txnErr) throw txnErr
            transactionId = newTxn.id
            onProgress?.('Yeni transaction oluşturuldu: ' + transactionId)


            if (conv) {
                conv = {
                    ...conv,
                    transaction_id: newTxn.id,
                    buyer_id: convRow.buyer_id,
                    seller_id: convRow.seller_id,
                    listing_credits: credits,
                }
            } else {
                // conv hâlâ null (store'da yok); minimal nesne oluştur
                conv = {
                    id: conversationId,
                    listing_id: convRow.listing_id,
                    listing_title: '',
                    listing_credits: credits,
                    participant: { id: convRow.seller_id, name: '', avatar: null },
                    last_message: '',
                    last_message_at: new Date().toISOString(),
                    unread_count: 0,
                    transaction_id: newTxn.id,
                    conv_status: 'pending',
                    buyer_id: convRow.buyer_id,
                    seller_id: convRow.seller_id,
                }
            }
        }

        if (!transactionId || !conv) throw new Error('İşlem başlatılamadı. Lütfen sayfayı yenile.')

        onProgress?.('Supabase RPC (complete_transaction) çağrılıyor...')
        const { error } = await supabase.rpc('complete_transaction', {
            p_transaction_id: transactionId,
            p_conversation_id: conversationId,
            p_buyer_id: conv.buyer_id,
            p_seller_id: conv.seller_id,
            p_credits: conv.listing_credits ?? 0,
            p_rating: rating,
            p_comment: comment
        })

        if (error) {
            onProgress?.('RPC hatası: ' + error.message)
            throw error
        }

        onProgress?.('RPC başarılı, store güncelleniyor...')
        // Store'u güncelle
        set(state => ({
            conversations: state.conversations.map(c =>
                c.id === conversationId ? { ...c, conv_status: 'completed' } : c
            )
        }))

        onProgress?.('Kullanıcı bakiyesi yenileniyor...')
        // Güncel kullanıcı kredisini Supabase'den çek
        const { data: userData } = await supabase
            .from('users')
            .select('credits')
            .eq('id', currentUserId)
            .single()

        if (userData) {
            useAuthStore.getState().updateCredits(userData.credits)
        }
    },

    markAsRead: async (conversationId, userId) => {
        // Optimistic update
        set(state => {
            const updatedConvs = state.conversations.map(c =>
                c.id === conversationId ? { ...c, unread_count: 0 } : c
            )
            const totalUnread = updatedConvs.reduce((sum, c) => sum + c.unread_count, 0)
            return { conversations: updatedConvs, totalUnread }
        })

        try {
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('conversation_id', conversationId)
                .eq('is_read', false)
                .neq('sender_id', userId)
        } catch (error) {
            console.error('Error marking as read:', error)
            // Rollback optimistic update could be done here, but ignoring for simplicity
        }
    },

    activeSubscription: null as ReturnType<typeof supabase.channel> | null,

    subscribeToMessages: (userId) => {
        // Zaten aktif bir bağlantı varsa tekrar oluşturma
        if (get().activeSubscription) {
            return () => { }; // Empty cleanup
        }

        const channel = supabase
            .channel('realtime_messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                },
                async (payload: RealtimePostgresInsertPayload<ChatMessage>) => {
                    const newMsg = payload.new

                    // Add to message list if in cache
                    set(state => {
                        const convMsgs = state.messages[newMsg.conversation_id] || []
                        if (convMsgs.some(m => m.id === newMsg.id)) return state

                        // Başkası mesaj gönderdiyse ve URL o konuşma değilse badge'i artır
                        const isFromOther = newMsg.sender_id !== userId
                        let isCurrentlyViewing = false
                        if (typeof window !== 'undefined') {
                            isCurrentlyViewing = window.location.pathname.includes(newMsg.conversation_id)
                        }

                        const shouldIncrementUnread = isFromOther && !isCurrentlyViewing

                        const updatedConvs = state.conversations.map(c => {
                            if (c.id === newMsg.conversation_id) {
                                return {
                                    ...c,
                                    unread_count: shouldIncrementUnread ? c.unread_count + 1 : (isCurrentlyViewing ? 0 : c.unread_count)
                                }
                            }
                            return c
                        })

                        const totalUnread = updatedConvs.reduce((sum, c) => sum + c.unread_count, 0)

                        return {
                            messages: {
                                ...state.messages,
                                [newMsg.conversation_id]: [...convMsgs, newMsg]
                            },
                            conversations: updatedConvs,
                            totalUnread
                        }
                    })

                    // Refresh conversations to get latest last_message safely
                    // if (!isCurrentlyViewing) { // always refresh to get latest message preview
                    //     get().fetchConversations(userId)
                    // }
                    get().fetchConversations(userId)

                    // Eğer kullanıcı şu an o sohbetteyse, yeni gelen mesajı anında okundu işaretle
                    if (typeof window !== 'undefined' && window.location.pathname.includes(newMsg.conversation_id) && newMsg.sender_id !== userId) {
                        get().markAsRead(newMsg.conversation_id, userId)
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'messages'
                },
                (payload) => {
                    const deletedId = (payload.old as any).id
                    set(state => {
                        const newMessages = { ...state.messages }
                        for (const convId in newMessages) {
                            newMessages[convId] = newMessages[convId].filter(m => m.id !== deletedId)
                        }
                        return { messages: newMessages }
                    })
                }
            )
            .subscribe()

        set({ activeSubscription: channel })

        return () => {
            supabase.removeChannel(channel)
            set({ activeSubscription: null })
        }
    },

    deleteMessage: async (messageId, conversationId) => {
        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId)

            if (error) throw error

            set(state => {
                const updatedMsgs = (state.messages[conversationId] || []).filter(m => m.id !== messageId)
                return {
                    messages: {
                        ...state.messages,
                        [conversationId]: updatedMsgs
                    }
                }
            })

            const userId = useAuthStore.getState().user?.id
            if (userId) {
                get().fetchConversations(userId)
            }
        } catch (error) {
            console.error('Error deleting message:', error)
        }
    },

    deleteConversation: async (conversationId) => {
        try {
            const { error } = await supabase
                .from('conversations')
                .delete()
                .eq('id', conversationId)

            if (error) throw error

            set(state => {
                const newMessages = { ...state.messages }
                delete newMessages[conversationId]
                return {
                    conversations: state.conversations.filter(c => c.id !== conversationId),
                    messages: newMessages
                }
            })
        } catch (error) {
            console.error('Error deleting conversation:', error)
            throw error
        }
    }
}))
