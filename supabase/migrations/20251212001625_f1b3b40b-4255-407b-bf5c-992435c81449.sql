-- Create storage bucket for issue photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('issue-photos', 'issue-photos', true);

-- Add photo_url column to issues table
ALTER TABLE public.issues ADD COLUMN photo_url TEXT;

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'issue-photos' AND auth.role() = 'authenticated');

-- Allow public read access to photos
CREATE POLICY "Public can view issue photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'issue-photos');