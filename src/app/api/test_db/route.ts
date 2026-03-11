import { NextResponse } from 'next/server'

export async function GET() {
    console.log("Testing frontend queries...")
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        
        // Test users select
        const userUrl = `${supabaseUrl}/rest/v1/users?select=*&limit=1`
        const userRes = await fetch(userUrl, {
            headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
        })
        const userText = await userRes.text()

        return NextResponse.json({ 
            success: true, 
            userStatus: userRes.status,
            userData: userText.substring(0, 500)
        })
    } catch (error: any) {
        console.error("Test Error:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
