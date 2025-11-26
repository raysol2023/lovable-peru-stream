-- Create storage bucket for channel logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('channel-logos', 'channel-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Channel logos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload channel logos" ON storage.objects;

-- Create RLS policy to allow public read access to logos
CREATE POLICY "Channel logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'channel-logos');

-- Create RLS policy to allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload channel logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'channel-logos' AND auth.role() = 'authenticated');