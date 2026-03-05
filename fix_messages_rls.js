require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixRLS() {
    const sql = `
-- Allow users to update messages in their conversations (e.g. mark as read)
DROP POLICY IF EXISTS "Kullanıcılar mesajları güncelleyebilir" ON public.messages;
CREATE POLICY "Kullanıcılar mesajları güncelleyebilir" 
ON public.messages FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- Allow users to delete their OWN messages
DROP POLICY IF EXISTS "Kullanıcılar kendi mesajlarını silebilir" ON public.messages;
CREATE POLICY "Kullanıcılar kendi mesajlarını silebilir" 
ON public.messages FOR DELETE 
USING (auth.uid() = sender_id);
  `;

    // We need to execute arbitrary SQL. Since we don't have a direct SQL execution endpoint unless we use RPC
    // Wait, does the project have an RPC for raw SQL?
    // Let's create an RPC if not, or just explain how. Wait, we can use the `run_command` to execute via `psql`? We don't have psql.
    // We can write a migration using Supabase CLI if it's installed.
    console.log("SQL TO EXECUTE:");
    console.log(sql);
}

fixRLS();
