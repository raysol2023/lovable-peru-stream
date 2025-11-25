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

    // GET - Get all community requests (for admins) or user's own requests
    if (req.method === 'GET') {
      // Check if user has admin or staff role
      const { data: userRole } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'staff'])
        .single();

      let query = supabaseClient
        .from('community_requests')
        .select('*')
        .order('submission_date', { ascending: false });

      // If not admin/staff, only show user's own requests
      if (!userRole) {
        query = query.eq('user_id', user.id);
      }

      const { data: requests, error } = await query;

      if (error) {
        console.error('Error fetching community requests:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ requests }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Create new community request
    if (req.method === 'POST') {
      const { content_title, content_description, content_type, content_details } = await req.json();

      if (!content_title) {
        return new Response(
          JSON.stringify({ error: 'content_title is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: request, error } = await supabaseClient
        .from('community_requests')
        .insert({
          user_id: user.id,
          content_title,
          content_description,
          content_type: content_type || 'movie',
          content_details: content_details || {},
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating community request:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          request,
          message: 'Solicitud enviada exitosamente. Será revisada en menos de 24 horas.'
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in community-request function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
