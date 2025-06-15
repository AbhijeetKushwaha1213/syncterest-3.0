
-- Create a bucket for channel chat attachments with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('channel_attachments', 'channel_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to the 'channel_attachments' bucket
CREATE POLICY "Allow authenticated insert on channel_attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'channel_attachments');

-- Allow anyone to view files in the 'channel_attachments' bucket
CREATE POLICY "Allow public select on channel_attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'channel_attachments');

-- Add attachment columns to channel_messages table
ALTER TABLE public.channel_messages
ADD COLUMN attachment_url TEXT,
ADD COLUMN attachment_type TEXT;
