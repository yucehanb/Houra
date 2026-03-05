-- ==========================================
-- REVIEWS TABLOSU İZİNLERİ
-- ==========================================

-- Profil sayfasında herkesin yorumları görebilmesi için SELECT yetkisi veriyoruz
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Eski kısıtlı kuralı sil
DROP POLICY IF EXISTS "Kendi değerlendirmelerini gör" ON public.reviews;

-- Herkes yorumları okuyabilsin (Profil ziyareti için gerekli)
DROP POLICY IF EXISTS "Herkes değerlendirmeleri görebilir" ON public.reviews;
CREATE POLICY "Herkes değerlendirmeleri görebilir" 
ON public.reviews FOR SELECT 
USING (true);
