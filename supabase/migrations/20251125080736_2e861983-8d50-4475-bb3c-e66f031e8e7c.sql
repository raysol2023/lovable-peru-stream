-- Create EPG data table
CREATE TABLE IF NOT EXISTS public.epg_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  program_title TEXT NOT NULL,
  program_description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  genre TEXT,
  rating TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.epg_data ENABLE ROW LEVEL SECURITY;

-- Create policy allowing public read access
CREATE POLICY "EPG data is viewable by everyone"
ON public.epg_data
FOR SELECT
USING (true);

-- Create index for performance
CREATE INDEX idx_epg_channel_time ON public.epg_data(channel_id, start_time, end_time);

-- Create trigger for updated_at
CREATE TRIGGER update_epg_data_updated_at
BEFORE UPDATE ON public.epg_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();