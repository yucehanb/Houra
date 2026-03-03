import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'

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
    getOrCreateConversation: (listingId: string, buyerId: string, sellerId: string) => Promise<string>
    markAsRead: (conversationId: string, userId: string) => Promise<void>
    subscribeToMessages: (userId: string) => () => void
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
    conversations: [],
    messages: {},
    totalUnread: 0,
    isLoading: false,

    fetchConversations: async (userId) => {
        set({ isLoading: true })
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

            if (error) throw error

            const formattedConvs: Conversation[] = data.map(c => {
                const isBuyer = c.buyer_id === userId
                const participant = isBuyer ? c.seller : c.buyer
                return {
                    id: c.id,
                    listing_id: c.listing_id,
                    listing_title: c.listing?.title || 'İlan Silinmiş',
                    listing_credits: c.listing?.duration_hrs || 0,
                    participant: {
                        id: participant.id,
                        name: participant.full_name,
                        avatar: participant.avatar_url
                    },
                    last_message: c.last_message || '',
                    last_message_at: c.last_message_at,
                    unread_count: 0 // Simplification for now
                }
            })

            set({ conversations: formattedConvs })
        } catch (error) {
            console.error('Error fetching conversations:', error)
        } finally {
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

            // Local update (Realtime will also pick this up if subscribed)
            set(state => ({
                messages: {
                    ...state.messages,
                    [conversationId]: [...(state.messages[conversationId] || []), data]
                },
                conversations: state.conversations.map(c =>
                    c.id === conversationId
                        ? { ...c, last_message: content, last_message_at: data.created_at }
                        : c
                ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
            }))
        } catch (error) {
            console.error('Error sending message:', error)
        }
    },

    getOrCreateConversation: async (listingId, buyerId, sellerId) => {
        // Try to find existing
        const { data: existing, error: findError } = await supabase
            .from('conversations')
            .select('id')
            .eq('listing_id', listingId)
            .eq('buyer_id', buyerId)
            .eq('seller_id', sellerId)
            .maybeSingle()

        if (existing) return existing.id

        // Create new
        const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({
                listing_id: listingId,
                buyer_id: buyerId,
                seller_id: sellerId
            })
            .select('id')
            .single()

        if (createError) throw createError
        return newConv.id
    },

    markAsRead: async (conversationId, userId) => {
        // Implementation for unread logic
    },

    subscribeToMessages: (userId) => {
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

                        return {
                            messages: {
                                ...state.messages,
                                [newMsg.conversation_id]: [...convMsgs, newMsg]
                            }
                        }
                    })

                    // Refresh conversations to get latest last_message
                    get().fetchConversations(userId)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }
}))
