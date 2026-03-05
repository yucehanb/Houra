-- ==========================================
-- 1. TRANSACTIONS TABLOSU
-- ==========================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.listings(id),
  buyer_id uuid REFERENCES public.users(id),
  seller_id uuid REFERENCES public.users(id),
  credits_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','completed','cancelled')),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 2. REVIEWS TABLOSU
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES public.users(id),
  reviewed_id uuid REFERENCES public.users(id),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. CONVERSATIONS TABLOSU ALTER
-- ==========================================
ALTER TABLE public.conversations 
  ADD COLUMN IF NOT EXISTS transaction_id uuid REFERENCES public.transactions(id),
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'
    CHECK (status IN ('pending','completed','cancelled'));

-- ==========================================
-- 4. RLS POLİTİKALARI (Transactions & Reviews)
-- ==========================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kendi işlemlerini gör" ON public.transactions;
CREATE POLICY "Kendi işlemlerini gör" ON public.transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "İşlem oluştur" ON public.transactions;
CREATE POLICY "İşlem oluştur" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Kendi değerlendirmelerini gör" ON public.reviews;
CREATE POLICY "Kendi değerlendirmelerini gör" ON public.reviews
  FOR SELECT USING (auth.uid() = reviewer_id OR auth.uid() = reviewed_id);

-- ==========================================
-- 5. RPC FONKSİYONU: complete_transaction
-- ==========================================
CREATE OR REPLACE FUNCTION public.complete_transaction(
  p_transaction_id uuid,
  p_conversation_id uuid,
  p_buyer_id uuid,
  p_seller_id uuid,
  p_credits numeric,
  p_rating int,
  p_comment text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Transaction'ı tamamla
  UPDATE public.transactions 
  SET status = 'completed', completed_at = now()
  WHERE id = p_transaction_id AND buyer_id = p_buyer_id;

  -- Review kaydet
  INSERT INTO public.reviews (transaction_id, reviewer_id, reviewed_id, rating, comment)
  VALUES (p_transaction_id, p_buyer_id, p_seller_id, p_rating, p_comment);

  -- Alıcının kredisini düş
  UPDATE public.users SET credits = credits - p_credits WHERE id = p_buyer_id;

  -- Satıcının kredisini artır
  UPDATE public.users SET credits = credits + p_credits WHERE id = p_seller_id;

  -- Satıcının rating ortalamasını güncelle
  UPDATE public.users SET 
    rating_avg = (SELECT AVG(rating) FROM public.reviews WHERE reviewed_id = p_seller_id),
    rating_count = (SELECT COUNT(*) FROM public.reviews WHERE reviewed_id = p_seller_id)
  WHERE id = p_seller_id;

  -- Konuşmayı tamamlandı olarak işaretle
  UPDATE public.conversations SET status = 'completed' WHERE id = p_conversation_id;
END;
$$;

-- 6. RPC için izin ver
GRANT EXECUTE ON FUNCTION public.complete_transaction TO authenticated;

-- ==========================================
-- 7. MESSAGES TABLOSU - RLS DELETE/UPDATE İZİNLERİ
-- ==========================================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Kullanıcılar kendi mesajlarını silebilir" ON public.messages;
CREATE POLICY "Kullanıcılar kendi mesajlarını silebilir" 
ON public.messages FOR DELETE 
USING (auth.uid() = sender_id);
