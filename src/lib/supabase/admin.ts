import { createClient } from '@supabase/supabase-js'

// Bu client sadece server-side (Server Components, Route Handlers, Server Actions) 
// içinde kullanılmalıdır. RLS kurallarını atlar.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
