-- Create profiles table for user profiles with avatar and PIN
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  pin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Usuario'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '👤')
  );
  RETURN new;
END;
$$;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create ENUM for plan scope
CREATE TYPE public.plan_scope AS ENUM ('VOD', 'VOD_TV');

-- Create plans table with subscription plans
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  scope public.plan_scope NOT NULL,
  simultaneous_limit INTEGER NOT NULL CHECK (simultaneous_limit > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on plans (read-only for all authenticated users)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are viewable by authenticated users"
  ON public.plans FOR SELECT
  TO authenticated
  USING (true);

-- Insert the 4 predefined plans (a, b, c, d)
INSERT INTO public.plans (name, scope, simultaneous_limit, price, description) VALUES
  ('Plan A', 'VOD', 1, 15.00, 'Plan básico VOD con 1 dispositivo simultáneo'),
  ('Plan B', 'VOD', 2, 25.00, 'Plan VOD con 2 dispositivos simultáneos'),
  ('Plan C', 'VOD_TV', 1, 25.00, 'Plan VOD + TV en vivo con 1 dispositivo'),
  ('Plan D', 'VOD_TV', 2, 35.00, 'Plan completo VOD + TV en vivo con 2 dispositivos');

-- Create ENUM for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'pending');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status public.subscription_status NOT NULL DEFAULT 'pending',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_id)
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create content table for VOD and live TV
CREATE TABLE public.content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT[] DEFAULT '{}',
  is_tv BOOLEAN NOT NULL DEFAULT false,
  trailer_url TEXT,
  cover_image_url TEXT,
  manifest_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on content (public read access for authenticated users)
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content is viewable by authenticated users"
  ON public.content FOR SELECT
  TO authenticated
  USING (true);

-- Create index on category for faster carousel queries
CREATE INDEX idx_content_category ON public.content USING GIN(category);

-- Create user_history table for "Continue Watching" and trends
CREATE TABLE public.user_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  last_watched_time INTEGER NOT NULL DEFAULT 0 CHECK (last_watched_time >= 0),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, content_id)
);

-- Enable RLS on user_history
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history"
  ON public.user_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = user_history.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own history"
  ON public.user_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = user_history.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own history"
  ON public.user_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = user_history.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_history_updated_at
  BEFORE UPDATE ON public.user_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample content for testing
INSERT INTO public.content (title, description, category, is_tv, cover_image_url, manifest_url) VALUES
  ('Perú: Tierra de Campeones', 'Documental sobre los mejores deportistas peruanos', ARRAY['Documentales', 'Deportes', 'Tendencias'], false, 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04', 'https://example.com/manifest1.m3u8'),
  ('Lima en la Noche', 'Serie dramática sobre la vida nocturna limeña', ARRAY['Series', 'Drama', 'Recomendados'], false, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23', 'https://example.com/manifest2.m3u8'),
  ('Ceviche Masters', 'Reality show culinario peruano', ARRAY['Reality', 'Gastronomía', 'Comunidad'], false, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', 'https://example.com/manifest3.m3u8'),
  ('Andes: Montañas Sagradas', 'Exploración de los Andes peruanos', ARRAY['Documentales', 'Naturaleza', 'Tendencias'], false, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29', 'https://example.com/manifest4.m3u8'),
  ('América TV', 'Canal de televisión en vivo', ARRAY['TV en Vivo'], true, 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37', 'https://example.com/live1.m3u8'),
  ('Latina', 'Canal de entretenimiento en vivo', ARRAY['TV en Vivo'], true, 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d', 'https://example.com/live2.m3u8');