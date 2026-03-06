-- complete_transaction.sql
-- Bu script, satış işlemi tamamlandıktan sonra satıcının maksimum kredisini 6 ile sınırlar.

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

  -- Alıcının kredisini düş (Ödeme yapıldığı için)
  UPDATE public.users SET credits = credits - p_credits WHERE id = p_buyer_id;

  -- Satıcının kredisini artır, ancak maksimum 6 olacak şekilde sınırla
  UPDATE public.users 
  SET credits = LEAST(6, credits + p_credits) 
  WHERE id = p_seller_id;

  -- Satıcının rating ortalamasını güncelle
  UPDATE public.users SET 
    rating_avg = (SELECT AVG(rating) FROM public.reviews WHERE reviewed_id = p_seller_id),
    rating_count = (SELECT COUNT(*) FROM public.reviews WHERE reviewed_id = p_seller_id)
  WHERE id = p_seller_id;

  -- Konuşmayı tamamlandı olarak işaretle
  UPDATE public.conversations SET status = 'completed' WHERE id = p_conversation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_transaction TO authenticated;
