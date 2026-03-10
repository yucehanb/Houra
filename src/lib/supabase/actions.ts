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
    if (error) {
        if (error.message.includes('Email not confirmed')) {
            return { requireOtp: true, email, error: 'Lütfen önce e-posta adresinizi doğrulayın.' }
        }
        return { error: error.message }
    }

    redirect('/dashboard')
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
        },
    })

    if (error) return { error: error.message }

    // Normalde kullanıcıyı DB'ye kaydederken email onaylıysa yapardık ama profil tablosu RLS nedeniyle auth olmak isteyebilir. Service rolüyle eklemek daha iyi olabilir veya ilk girişte oluşturur. 
    // Ancak signUp çalıştıysa ve email confirmation gerekiyorsa, auth user oluşur ama login olmaz.
    // Başlangıç kredilerini user insert trigger ile vermek veya login sonrası tetiklemek daha sağlıklıdır, fakat şimdilik burada ekliyoruz (eğer RLS izin veriyorsa)
    if (data.user) {
        await supabase.from('users').upsert({
            id: data.user.id,
            full_name: fullName,
            credits: 2,
        })
    }

    return { requireOtp: true, email, success: 'Kayıt başarılı! Lütfen e-postanıza gelen 6 haneli kodu girin.' }
}

// ────────────────────────────────────────────
// OTP (6-Haneli Kod) Doğrulama
// ────────────────────────────────────────────
export async function verifyOtpCode(email: string, token: string, type: 'signup' | 'recovery' | 'magiclink' = 'signup') {
    if (!isSupabaseConfigured) return { error: 'Supabase yapılandırılmamış.' }

    const supabase = await getClient()

    // Auth metodundan OTP doğrulama
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: type,
    })

    if (error) return { error: error.message }

    // Eğer başarılıysa artık oturum açıldı demektir
    redirect('/dashboard')
}

// ────────────────────────────────────────────
// Yeniden OTP Gönder
// ────────────────────────────────────────────
export async function resendOtp(email: string) {
    if (!isSupabaseConfigured) return { error: 'Supabase yapılandırılmamış.' }
    const supabase = await getClient()
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email
    })
    if (error) return { error: error.message }
    return { success: 'Yeni kod gönderildi.' }
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

// ────────────────────────────────────────────
// Şifre Sıfırlama Email Gönder
// ────────────────────────────────────────────
export async function sendPasswordResetEmail(formData: FormData) {
    if (!isSupabaseConfigured) return { error: 'Supabase yapılandırılmamış.' }

    const supabase = await getClient()
    const email = formData.get('email') as string

    // Callback URL'ye next=/update-password ekliyoruz ki email linkine tıklandığında auth/callback bizi update-password'a göndersin.
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback?next=/update-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
    })

    if (error) return { error: error.message }
    return { success: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. (Gelen Kutunuzu kontrol edin)' }
}

// ────────────────────────────────────────────
// Şifre Güncelle (Sıfırlama Linkine Tıklandıktan Sonra)
// ────────────────────────────────────────────
export async function updatePassword(formData: FormData) {
    if (!isSupabaseConfigured) return { error: 'Supabase yapılandırılmamış.' }

    const supabase = await getClient()
    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({ password })

    if (error) return { error: error.message }
    
    redirect('/dashboard')
}
