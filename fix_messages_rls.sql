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
