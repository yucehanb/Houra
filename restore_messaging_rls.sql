-- ==========================================
-- EKSİK KALAN OKUMA (SELECT) VE YAZMA (INSERT) İZİNLERİ
-- ==========================================

-- 1. CONVERSATIONS TABLOSU İZİNLERİ
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

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


-- 2. MESSAGES TABLOSU İZİNLERİ
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

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
