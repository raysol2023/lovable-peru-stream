import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname;

    // GET /profiles - Get all profiles for authenticated user
    if (req.method === 'GET' && path.endsWith('/profiles')) {
      const { data: profiles, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching profiles:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ profiles }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /profiles - Create a new profile
    if (req.method === 'POST' && path.endsWith('/profiles')) {
      const { name, avatar_url, pin } = await req.json();

      if (!name) {
        return new Response(
          JSON.stringify({ error: 'Name is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .insert({
          user_id: user.id,
          name,
          avatar_url: avatar_url || '👤',
          pin: pin || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ profile }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /profiles/:id - Update profile (including PIN)
    if (req.method === 'PUT' && path.includes('/profiles/')) {
      const profileId = path.split('/profiles/')[1];
      const { name, avatar_url, pin } = await req.json();

      // Verify profile belongs to user
      const { data: existingProfile } = await supabaseClient
        .from('profiles')
        .select('user_id')
        .eq('id', profileId)
        .single();

      if (!existingProfile || existingProfile.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Profile not found or unauthorized' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
      if (pin !== undefined) updateData.pin = pin;

      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .update(updateData)
        .eq('id', profileId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ profile }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /profiles/:id - Delete profile
    if (req.method === 'DELETE' && path.includes('/profiles/')) {
      const profileId = path.split('/profiles/')[1];

      // Verify profile belongs to user
      const { data: existingProfile } = await supabaseClient
        .from('profiles')
        .select('user_id')
        .eq('id', profileId)
        .single();

      if (!existingProfile || existingProfile.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Profile not found or unauthorized' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabaseClient
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) {
        console.error('Error deleting profile:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ message: 'Profile deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in profiles function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
