-- ==========================================
-- CONVERSATIONS TABLOSU - SİLME İZNİ
-- ==========================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kullanıcılar kendi konuşmalarını silebilir" ON public.conversations;
CREATE POLICY "Kullanıcılar kendi konuşmalarını silebilir" 
ON public.conversations FOR DELETE 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
