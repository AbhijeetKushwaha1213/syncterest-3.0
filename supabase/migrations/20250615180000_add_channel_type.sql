
CREATE TYPE public.channel_type AS ENUM ('text', 'voice');

ALTER TABLE public.channels
ADD COLUMN type public.channel_type NOT NULL DEFAULT 'text';
