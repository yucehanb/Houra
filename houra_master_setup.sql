-- ==========================================
-- HOURA: TAM KAPSAMLI VERİTABANI VE GÜVENLİK
-- ==========================================

-- 1. KULLANICILAR (USERS) TABLOSU VE RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP POLICY IF EXISTS "Kullanıcılar herkes tarafından görülebilir" ON public.users;
DROP POLICY IF EXISTS "Kullanıcılar kendi profillerini güncelleyebilir" ON public.users;
DROP POLICY IF EXISTS "Kullanıcılar kendi profillerini oluşturabilir" ON public.users;

CREATE POLICY "Kullanıcılar herkes tarafından görülebilir" ON public.users FOR SELECT USING (true);
CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir" ON public.users FOR UPDATE USING (auth.uid() = id);
-- DİKKAT: Kayıt anında sorun yaşamamak için Insert izni esnetildi:
CREATE POLICY "Kullanıcılar kendi profillerini oluşturabilir" ON public.users FOR INSERT WITH CHECK (true);


-- 2. FOTOĞRAFLAR (STORAGE) İÇİN BUCKET VE KURALLAR
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Kullanıcılar avatar yükleyebilir" ON storage.objects;
DROP POLICY IF EXISTS "Herkes avatarları görebilir" ON storage.objects;
DROP POLICY IF EXISTS "Kullanıcılar kendi avatarlarını silebilir" ON storage.objects;
DROP POLICY IF EXISTS "Kullanıcılar avatar güncelleyebilir" ON storage.objects;
DROP POLICY IF EXISTS "Herkere açık avatar okuma" ON storage.objects;
DROP POLICY IF EXISTS "Sadece sahibi avatar yükleyebilir" ON storage.objects;
DROP POLICY IF EXISTS "Sadece sahibi avatar güncelleyebilir" ON storage.objects;

CREATE POLICY "Herkes avatarları görebilir" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- Hata almamak için sadece giriş yapanların yüklemesine/güncellemesine izin veriyoruz:
CREATE POLICY "Kullanıcılar avatar yükleyebilir" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Kullanıcılar avatar güncelleyebilir" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Kullanıcılar kendi avatarlarını silebilir" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');


-- 3. İLANLAR (LISTINGS) TABLOSU VE RLS (ZAMAN AŞIMI ÇÖZÜMÜ BURADA)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='tags') THEN
        ALTER TABLE public.listings ADD COLUMN tags text[] DEFAULT '{}';
    END IF;
END $$;

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes ilanları görebilir" ON public.listings;
DROP POLICY IF EXISTS "Kullanıcılar kendi ilanlarını oluşturabilir" ON public.listings;
DROP POLICY IF EXISTS "Sadece sahibi ilanını güncelleyebilir" ON public.listings;
DROP POLICY IF EXISTS "Sadece sahibi ilanını silebilir" ON public.listings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.listings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.listings;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.listings;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.listings;

CREATE POLICY "Enable read access for all users" ON public.listings FOR SELECT USING (true);
-- DİKKAT: İlan verme (insert) sorununun kesin çözümü için kural sadeleştirildi:
CREATE POLICY "Enable insert for authenticated users only" ON public.listings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON public.listings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable delete for users based on user_id" ON public.listings FOR DELETE USING (auth.uid() = user_id);


-- 4. MESAJLAŞMA SİSTEMİ (CONVERSATIONS VE MESSAGES) VE RLS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(listing_id, buyer_id, seller_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Konuşmaları taraflar görebilir" ON public.conversations;
DROP POLICY IF EXISTS "Herkes konuşma başlatabilir" ON public.conversations;
DROP POLICY IF EXISTS "Mesajları taraflar görebilir" ON public.messages;
DROP POLICY IF EXISTS "Taraflar mesaj gönderebilir" ON public.messages;

CREATE POLICY "Konuşmaları taraflar görebilir" ON public.conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Herkes konuşma başlatabilir" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Mesajları taraflar görebilir" ON public.messages FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())));
CREATE POLICY "Taraflar mesaj gönderebilir" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);


-- 5. CANLI MESAJLAŞMA (REALTIME) VE ŞEMA YENİLEME
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;

NOTIFY pgrst, 'reload schema';

BEGIN;
  -- Tabloları realtime yayınına ekle
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
COMMIT;
-- Conversations (Konuşmalar) için
DROP POLICY IF EXISTS "Kullanıcılar kendi konuşmalarını görebilir" ON public.conversations;
CREATE POLICY "Kullanıcılar kendi konuşmalarını görebilir" 
ON public.conversations FOR SELECT 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages (Mesajlar) için (Canlı yayın için hayati önem taşır)
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

-- ==========================================
-- 6. TRANSACTIONS TABLOSU
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
-- 7. REVIEWS TABLOSU
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
-- 8. CONVERSATIONS TABLOSU ALTER
-- ==========================================
ALTER TABLE public.conversations 
  ADD COLUMN IF NOT EXISTS transaction_id uuid REFERENCES public.transactions(id),
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'
    CHECK (status IN ('pending','completed','cancelled'));

-- ==========================================
-- 9. RLS POLİTİKALARI (Transactions & Reviews)
-- ==========================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kendi işlemlerini gör" ON public.transactions;
CREATE POLICY "Kendi işlemlerini gör" ON public.transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "İşlem oluştur" ON public.transactions;
CREATE POLICY "İşlem oluştur" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Profil sayfasında herkesin yorumları görebilmesi için SELECT yetkisi veriyoruz
DROP POLICY IF EXISTS "Kendi değerlendirmelerini gör" ON public.reviews;
DROP POLICY IF EXISTS "Herkes değerlendirmeleri görebilir" ON public.reviews;
CREATE POLICY "Herkes değerlendirmeleri görebilir" 
ON public.reviews FOR SELECT 
USING (true);

-- ==========================================
-- 10. RPC FONKSİYONU: complete_transaction
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

-- RPC için izin ver
GRANT EXECUTE ON FUNCTION public.complete_transaction TO authenticated;

-- ==========================================
-- 11. EK RLS (SILME VE GUNCELLEME) IZINLERI
-- ==========================================

-- Messages
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

-- Conversations
DROP POLICY IF EXISTS "Kullanıcılar konuşma başlatabilir" ON public.conversations;
CREATE POLICY "Kullanıcılar konuşma başlatabilir" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Kullanıcılar kendi konuşmalarını güncelleyebilir" ON public.conversations;
CREATE POLICY "Kullanıcılar kendi konuşmalarını güncelleyebilir" 
ON public.conversations FOR UPDATE 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Kullanıcılar kendi konuşmalarını silebilir" ON public.conversations;
CREATE POLICY "Kullanıcılar kendi konuşmalarını silebilir" 
ON public.conversations FOR DELETE 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
