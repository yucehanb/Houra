'use server'

import { redirect } from 'next/navigation'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const isSupabaseConfigured =
    SUPABASE_URL.startsWith('https://') &&
    !SUPABASE_URL.includes('YOUR_PROJECT') &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.includes('YOUR_ANON')

async function getClient() {
    const { createClient } = await import('@/lib/supabase/server')
    return createClient()
}

// ────────────────────────────────────────────
// E-posta / Şifre ile Giriş
// ────────────────────────────────────────────
export async function signInWithEmail(formData: FormData) {
    if (!isSupabaseConfigured) {
        return { error: '⚠️ Supabase henüz yapılandırılmadı. .env.local dosyasına gerçek API anahtarlarını ekleyin.' }
    }

    const supabase = await getClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    redirect('/dashboard')
}

// ────────────────────────────────────────────
// Google OAuth ile Giriş
// ────────────────────────────────────────────
export async function signInWithGoogle() {
    if (!isSupabaseConfigured) {
        return { error: '⚠️ Supabase henüz yapılandırılmadı. .env.local dosyasına gerçek API anahtarlarını ekleyin.' }
    }

    const supabase = await getClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/auth/callback`,
        },
    })

    if (error) return { error: error.message }
    if (data.url) redirect(data.url)
}

// ────────────────────────────────────────────
// Kayıt Ol
// ────────────────────────────────────────────
export async function signUpWithEmail(formData: FormData) {
    if (!isSupabaseConfigured) {
        return { error: '⚠️ Supabase henüz yapılandırılmadı. .env.local dosyasına gerçek API anahtarlarını ekleyin.' }
    }

    const supabase = await getClient()
    const fullName = formData.get('full_name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/auth/callback`,
        },
    })

    if (error) return { error: error.message }

    if (data.user) {
        await supabase.from('users').upsert({
            id: data.user.id,
            full_name: fullName,
            credits: 2,
        })
    }

    return { success: 'Kayıt başarılı! E-postanızı doğrulayın.' }
}

// ────────────────────────────────────────────
// Çıkış Yap
// ────────────────────────────────────────────
export async function signOut() {
    if (!isSupabaseConfigured) {
        redirect('/login')
    }
    const supabase = await getClient()
    await supabase.auth.signOut()
    redirect('/login')
}
