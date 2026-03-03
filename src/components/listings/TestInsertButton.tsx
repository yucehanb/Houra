// components/listings/TestInsertButton.tsx
"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'

export function TestInsertButton() {
    const user = useAuthStore(s => s.user)
    const [status, setStatus] = useState('Hazır')

    const test = async () => {
        if (!user) return setStatus('Giriş yapılmadı')
        setStatus('Ekleniyor...')
        const supabase = createClient()
        const start = Date.now()

        try {
            const { data, error } = await supabase.from('listings').insert({
                user_id: user.id,
                title: 'Client Side Test',
                category: 'Diğer',
                type: 'offer',
                duration_hrs: 1,
                status: 'active'
            }).select().single()

            const time = Date.now() - start
            if (error) setStatus(`HATA (${time}ms): ` + error.message)
            else setStatus(`BAŞARILI (${time}ms): ` + data.id)
        } catch (err: any) {
            setStatus(`EXCEPTION (${Date.now() - start}ms): ` + err.message)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black p-4 z-50 rounded border border-white">
            <button onClick={test} className="bg-blue-500 text-white p-2 rounded">TEST INSERT</button>
            <div className="text-white text-xs mt-2">{status}</div>
        </div>
    )
}
