import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Supabase henüz yapılandırılmadıysa auth kontrolünü atla
const isSupabaseConfigured =
    SUPABASE_URL.startsWith('https://') &&
    !SUPABASE_URL.includes('YOUR_PROJECT') &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.includes('YOUR_ANON')

export async function middleware(request: NextRequest) {
    // ⚡ Supabase yapılandırılmadıysa direkt geçir (geliştirme/demo modu)
    if (!isSupabaseConfigured) {
        return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            getAll() { return request.cookies.getAll() },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                supabaseResponse = NextResponse.next({ request })
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                )
            },
        },
    })

    try {
        const { data: { user } } = await supabase.auth.getUser()

        const protectedPaths = ['/dashboard', '/profile', '/messages', '/listings/new']
        const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))
        if (!user && isProtected) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        const authPaths = ['/login', '/register']
        const isAuthPage = authPaths.some(p => request.nextUrl.pathname.startsWith(p))
        if (user && isAuthPage) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    } catch {
        // Supabase bağlantı hatası → sayfayı normal geçir
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
