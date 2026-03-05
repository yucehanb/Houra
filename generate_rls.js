require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Veritabanı URL'sindeki anon_key ile değil, SERVICE_ROLE_KEY ile test edeceğiz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSPoliciesDirectly() {
    // Generate the exact RLS policies to re-apply, completely opening up 
    // conversations and messages to both buyer and seller precisely over Realtime.
    console.log("SQL to forcefully fix RLS for Live Messaging:");
    console.log(`
-- For Conversations
DROP POLICY IF EXISTS "Kullanıcılar kendi konuşmalarını görebilir" ON public.conversations;
CREATE POLICY "Kullanıcılar kendi konuşmalarını görebilir" 
ON public.conversations FOR SELECT 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Kullanıcılar konuşma başlatabilir" ON public.conversations;
CREATE POLICY "Kullanıcılar konuşma başlatabilir" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Kullanıcılar kendi konuşmalarını güncelleyebilir" ON public.conversations;
CREATE POLICY "Kullanıcılar kendi konuşmalarını güncelleyebilir" 
ON public.conversations FOR UPDATE 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);


-- For Messages
DROP POLICY IF EXISTS "Kullanıcılar kendi mesajlarını görebilir" ON public.messages;
CREATE POLICY "Kullanıcılar kendi mesajlarını görebilir" 
ON public.messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Kullanıcılar mesaj gönderebilir" ON public.messages;
CREATE POLICY "Kullanıcılar mesaj gönderebilir" 
ON public.messages FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);
`);
}
testRLSPoliciesDirectly();
