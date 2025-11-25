-- Create user_roles table for admin/staff management
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create active_streams table for concurrency tracking
CREATE TABLE public.active_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_heartbeat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_id)
);

ALTER TABLE public.active_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streams"
  ON public.active_streams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streams"
  ON public.active_streams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streams"
  ON public.active_streams FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own streams"
  ON public.active_streams FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_active_streams_user_id ON public.active_streams(user_id);
CREATE INDEX idx_active_streams_heartbeat ON public.active_streams(last_heartbeat);

-- Create community_requests table
CREATE TYPE public.community_request_status AS ENUM ('pending', 'approved', 'rejected', 'published');

CREATE TABLE public.community_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_title TEXT NOT NULL,
  content_description TEXT,
  content_type TEXT,
  content_details JSONB,
  status public.community_request_status NOT NULL DEFAULT 'pending',
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  published_content_id UUID REFERENCES public.content(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_requests
CREATE POLICY "Users can view their own requests"
  ON public.community_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and staff can view all requests"
  ON public.community_requests FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Users can insert their own requests"
  ON public.community_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and staff can update requests"
  ON public.community_requests FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );

CREATE TRIGGER update_community_requests_updated_at
  BEFORE UPDATE ON public.community_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_community_requests_status ON public.community_requests(status);
CREATE INDEX idx_community_requests_user_id ON public.community_requests(user_id);

-- Function to clean up stale streams (older than 5 minutes without heartbeat)
CREATE OR REPLACE FUNCTION public.cleanup_stale_streams()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.active_streams
  WHERE last_heartbeat < NOW() - INTERVAL '5 minutes';
END;
$$;