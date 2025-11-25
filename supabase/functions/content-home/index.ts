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
    const pathParts = url.pathname.split('/');
    const profileId = pathParts[pathParts.length - 1];

    if (!profileId) {
      return new Response(
        JSON.stringify({ error: 'Profile ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify profile belongs to user
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('user_id')
      .eq('id', profileId)
      .single();

    if (!profile || profile.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Profile not found or unauthorized' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get "Continue Watching" - content from user_history
    const { data: continueWatching } = await supabaseClient
      .from('user_history')
      .select(`
        content_id,
        last_watched_time,
        content:content_id (*)
      `)
      .eq('profile_id', profileId)
      .order('updated_at', { ascending: false })
      .limit(10);

    const continueWatchingContent = continueWatching?.map((item: any) => ({
      ...item.content,
      last_watched_time: item.last_watched_time,
    })) || [];

    // Get "Trending" - most recently added content with "Tendencias" category
    const { data: trending } = await supabaseClient
      .from('content')
      .select('*')
      .contains('category', ['Tendencias'])
      .eq('is_tv', false)
      .order('created_at', { ascending: false })
      .limit(15);

    // Get "Recommended" - content with "Recomendados" category
    const { data: recommended } = await supabaseClient
      .from('content')
      .select('*')
      .contains('category', ['Recomendados'])
      .eq('is_tv', false)
      .limit(15);

    // Get "Community Requests" - content with "Comunidad" category
    const { data: community } = await supabaseClient
      .from('content')
      .select('*')
      .contains('category', ['Comunidad'])
      .eq('is_tv', false)
      .limit(15);

    // Get other carousels by category
    const { data: documentaries } = await supabaseClient
      .from('content')
      .select('*')
      .contains('category', ['Documentales'])
      .eq('is_tv', false)
      .limit(15);

    const { data: series } = await supabaseClient
      .from('content')
      .select('*')
      .contains('category', ['Series'])
      .eq('is_tv', false)
      .limit(15);

    // Build carousels response
    const carousels = [
      {
        title: 'Seguir Viendo',
        category: 'continue_watching',
        content: continueWatchingContent,
      },
      {
        title: 'Tendencias Perú',
        category: 'trending',
        content: trending || [],
      },
      {
        title: 'Recomendados para Ti',
        category: 'recommended',
        content: recommended || [],
      },
      {
        title: 'Pedido por la Comunidad',
        category: 'community',
        content: community || [],
      },
      {
        title: 'Documentales',
        category: 'documentales',
        content: documentaries || [],
      },
      {
        title: 'Series',
        category: 'series',
        content: series || [],
      },
    ].filter(carousel => carousel.content.length > 0);

    return new Response(
      JSON.stringify({ carousels }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in content-home function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
