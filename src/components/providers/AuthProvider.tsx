'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const setAuthUser = useAuthStore((s) => s.setUser)
    const supabase = createClient()

    useEffect(() => {
        // İlk yüklemede session kontrolü
        const getSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error || !session?.user) {
                setAuthUser(null)
                return
            }

            // user id ile tablodan veriyi çek (avatar vb.)
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()

            if (userData) {
                setAuthUser(userData as any)
            }
        }

        getSession()

        // Auth değişikliklerini dinle
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || !session?.user) {
                setAuthUser(null)
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                const { data: userData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                if (userData) {
                    setAuthUser(userData as any)
                }
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [setAuthUser, supabase])

    return <>{children}</>
}
