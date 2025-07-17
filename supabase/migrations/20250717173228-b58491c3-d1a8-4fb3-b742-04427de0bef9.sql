-- Add latitude and longitude columns to events table for location coordinates
ALTER TABLE public.events 
ADD COLUMN latitude double precision,
ADD COLUMN longitude double precision;