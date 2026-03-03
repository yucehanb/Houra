import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
    user: User | null
    setUser: (user: User | null) => void
    updateCredits: (newBalance: number) => void
}

/**
 * Kullanıcı oturumu ve profil bilgilerini tutan global store.
 * persist middleware ile localStorage'a kaydedilir.
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            updateCredits: (newBalance) =>
                set((state) => ({
                    user: state.user ? { ...state.user, credits: newBalance } : null,
                })),
        }),
        { name: 'zaman-bankasi-auth' }
    )
)
