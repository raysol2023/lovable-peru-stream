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

    // Check if user is admin or staff
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'staff'])
      .single();

    if (!userRole) {
      return new Response(
        JSON.stringify({ error: 'Forbidden. Admin or staff role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const requestId = pathParts[pathParts.length - 1];

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'request_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, rejection_reason, manifest_url, trailer_url, cover_image_url } = await req.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'action must be "approve" or "reject"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the community request
    const { data: request, error: requestError } = await supabaseClient
      .from('community_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return new Response(
        JSON.stringify({ error: 'Community request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reject') {
      // Reject the request
      await supabaseClient
        .from('community_requests')
        .update({
          status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejection_reason || 'No especificado',
        })
        .eq('id', requestId);

      return new Response(
        JSON.stringify({ 
          message: 'Solicitud rechazada exitosamente',
          request_id: requestId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // APPROVE - Create content and update request
    const { data: newContent, error: contentError } = await supabaseClient
      .from('content')
      .insert({
        title: request.content_title,
        description: request.content_description,
        category: ['Comunidad', request.content_type || 'movie'],
        is_tv: false,
        trailer_url: trailer_url || null,
        cover_image_url: cover_image_url || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1',
        manifest_url: manifest_url || `https://example.com/manifest_${requestId}.m3u8`,
      })
      .select()
      .single();

    if (contentError) {
      console.error('Error creating content:', contentError);
      return new Response(
        JSON.stringify({ error: 'Error creating content: ' + contentError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update community request to approved and published
    await supabaseClient
      .from('community_requests')
      .update({
        status: 'published',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        published_content_id: newContent.id,
      })
      .eq('id', requestId);

    return new Response(
      JSON.stringify({ 
        message: 'Solicitud aprobada y contenido publicado exitosamente (SLA < 24h)',
        request_id: requestId,
        content_id: newContent.id,
        content: newContent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in community-approve function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
