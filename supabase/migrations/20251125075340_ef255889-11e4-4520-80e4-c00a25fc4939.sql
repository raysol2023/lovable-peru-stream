-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Plans are viewable by authenticated users" ON public.plans;

-- Create new policy allowing public read access (including anonymous users)
CREATE POLICY "Plans are viewable by everyone"
ON public.plans
FOR SELECT
USING (true);

-- Plans table already has RLS enabled, so we don't need to enable it again