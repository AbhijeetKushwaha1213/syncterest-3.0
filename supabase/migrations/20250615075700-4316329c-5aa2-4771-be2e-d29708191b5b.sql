
-- Secure conversation participant data so only members can see who is in a conversation.
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to participants of own conversations"
ON public.conversation_participants
FOR SELECT
TO authenticated
USING (
  conversation_id IN (SELECT public.get_my_conversation_ids())
);


-- Alter the messages table to support attachments
ALTER TABLE public.messages
ADD COLUMN attachment_url TEXT,
ADD COLUMN attachment_type TEXT;

-- Make the 'content' column optional, as a message can now be just an attachment.
ALTER TABLE public.messages
ALTER COLUMN content DROP NOT NULL;

-- Add a rule to ensure a message isn't completely empty. It must have text or an attachment.
ALTER TABLE public.messages
ADD CONSTRAINT content_or_attachment_check
CHECK (content IS NOT NULL OR attachment_url IS NOT NULL);


-- Add Security Policies for the 'chat_attachments' storage bucket.
-- These rules ensure that files can only be accessed by members of the conversation.
-- NOTE: These policies assume a file path structure of: {conversation_id}/{user_id}/{file_name}

-- Allow conversation members to view/download files.
CREATE POLICY "Allow conversation members to view files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat_attachments' AND
  (storage.foldername(name))[1]::uuid IN (SELECT public.get_my_conversation_ids())
);

-- Allow conversation members to upload files.
CREATE POLICY "Allow conversation members to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat_attachments' AND
  (storage.foldername(name))[1]::uuid IN (SELECT public.get_my_conversation_ids()) AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to delete their own files.
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat_attachments' AND
  auth.uid() = (storage.foldername(name))[2]::uuid
);
