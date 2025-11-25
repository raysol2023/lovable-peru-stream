import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log(`Closing oldest session for user: ${user.id}`);

    // Find the oldest active stream for this user
    const { data: oldestStream, error: fetchError } = await supabase
      .from('active_streams')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching oldest stream:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch oldest stream' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!oldestStream) {
      return new Response(
        JSON.stringify({ message: 'No active streams found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Delete the oldest stream
    const { error: deleteError } = await supabase
      .from('active_streams')
      .delete()
      .eq('id', oldestStream.id);

    if (deleteError) {
      console.error('Error deleting stream:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to close session' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Successfully closed oldest session: ${oldestStream.device_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Oldest session closed successfully',
        closed_session: {
          device_id: oldestStream.device_id,
          started_at: oldestStream.started_at,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Session close error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
