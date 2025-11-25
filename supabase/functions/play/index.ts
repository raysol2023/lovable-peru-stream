import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Geo-IP validation function (using ipapi.co free service)
async function validateGeoIP(ip: string): Promise<boolean> {
  try {
    // Skip validation for localhost/development
    if (ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      console.log('Development IP detected, skipping geo validation');
      return true;
    }

    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    
    console.log('Geo-IP check:', { ip, country: data.country_code });
    
    // Check if country is Peru (PE)
    return data.country_code === 'PE';
  } catch (error) {
    console.error('Geo-IP validation error:', error);
    // In case of error, allow access (fail-open for better UX)
    return true;
  }
}

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
    const contentId = pathParts[pathParts.length - 1];
    const { profile_id, device_id } = await req.json();

    if (!contentId || !profile_id || !device_id) {
      return new Response(
        JSON.stringify({ error: 'content_id, profile_id and device_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // === 1. GEO-IP VALIDATION ===
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const isInPeru = await validateGeoIP(clientIP);
    if (!isInPeru) {
      return new Response(
        JSON.stringify({ 
          error: 'Reproducción bloqueada. El servicio StreemingTv solo está disponible en Perú.',
          code: 'GEO_BLOCKED'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // === 2. GET CONTENT DETAILS ===
    const { data: content, error: contentError } = await supabaseClient
      .from('content')
      .select('*')
      .eq('id', contentId)
      .single();

    if (contentError || !content) {
      return new Response(
        JSON.stringify({ error: 'Content not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // === 3. GET USER'S ACTIVE SUBSCRIPTION AND PLAN ===
    const { data: subscription } = await supabaseClient
      .from('subscriptions')
      .select('*, plan:plan_id(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return new Response(
        JSON.stringify({ 
          error: 'No tienes una suscripción activa. Por favor, suscríbete para continuar.',
          code: 'NO_SUBSCRIPTION'
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const plan = subscription.plan as any;

    // === 4. PLAN VALIDATION (UPSELL) ===
    // If content is Live TV (is_tv=true) and plan is VOD only
    if (content.is_tv && plan.scope === 'VOD') {
      return new Response(
        JSON.stringify({ 
          error: 'Necesitas un plan VOD + TV para ver TV en vivo. Actualiza tu plan.',
          code: 'PLAN_UPGRADE_REQUIRED',
          required_scope: 'VOD_TV',
          current_plan: plan.name,
          available_plans: ['Plan C', 'Plan D']
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // === 5. CONCURRENCY VALIDATION ===
    // Clean up stale streams first
    await supabaseClient.rpc('cleanup_stale_streams');

    // Get current active streams for this user
    const { data: activeStreams, error: streamsError } = await supabaseClient
      .from('active_streams')
      .select('*')
      .eq('user_id', user.id);

    if (streamsError) {
      console.error('Error checking active streams:', streamsError);
    }

    const currentStreamsCount = activeStreams?.length || 0;
    const simultaneousLimit = plan.simultaneous_limit;

    // Check if current device already has an active stream
    const existingDeviceStream = activeStreams?.find(s => s.device_id === device_id);

    if (!existingDeviceStream && currentStreamsCount >= simultaneousLimit) {
      // Get the oldest stream to suggest closing it
      const oldestStream = activeStreams?.sort((a, b) => 
        new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
      )[0];

      return new Response(
        JSON.stringify({ 
          error: `Límite de reproducción simultánea alcanzado (${simultaneousLimit} dispositivo${simultaneousLimit > 1 ? 's' : ''}). Por favor, cierra otros dispositivos.`,
          code: 'CONCURRENT_LIMIT_REACHED',
          limit: simultaneousLimit,
          current: currentStreamsCount,
          oldest_device: oldestStream?.device_id
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // === 6. REGISTER/UPDATE STREAM ===
    if (existingDeviceStream) {
      // Update heartbeat for existing stream
      await supabaseClient
        .from('active_streams')
        .update({ 
          last_heartbeat: new Date().toISOString(),
          content_id: contentId,
          profile_id: profile_id
        })
        .eq('id', existingDeviceStream.id);
    } else {
      // Create new stream
      await supabaseClient
        .from('active_streams')
        .insert({
          user_id: user.id,
          profile_id: profile_id,
          content_id: contentId,
          device_id: device_id,
        });
    }

    // === 7. RETURN MANIFEST URL ===
    return new Response(
      JSON.stringify({ 
        manifest_url: content.manifest_url,
        content_id: contentId,
        title: content.title,
        device_id: device_id,
        session_info: {
          concurrent_streams: existingDeviceStream ? currentStreamsCount : currentStreamsCount + 1,
          limit: simultaneousLimit
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in play function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
