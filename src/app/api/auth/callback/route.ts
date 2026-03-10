import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Google OAuth callback handler.
 * Supabase auth code'unu oturuma çevirir, ardından dashboard'a yönlendirir.
 */
export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/dashboard'
    const origin = requestUrl.origin

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Google ile ilk kez giriş yapılıyorsa profil oluştur
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', data.user.id)
                .single()

            if (!existingUser) {
                await supabase.from('users').insert({
                    id: data.user.id,
                    full_name: data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'Kullanıcı',
                    avatar_url: data.user.user_metadata?.avatar_url ?? null,
                    credits: 2,                       // 🎁 2 başlangıç kredisi
                })
            }
        }
    }

    return NextResponse.redirect(`${origin}${next}`)
}
