import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const browserUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

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
    
    console.log('Geo-IP check:', { ip, country: data.country_code, fullData: data });
    
    // TEMPORAL: Bypass geo-blocking for debugging
    console.log('⚠️ TEMPORAL: Geo-blocking bypassed for debugging');
    return true;
    
    // Check if country is Peru (PE)
    // If country_code is undefined, fail-open (allow access)
    // return data.country_code === 'PE' || !data.country_code;
  } catch (error) {
    console.error('Geo-IP validation error:', error);
    // In case of error, allow access (fail-open for better UX)
    return true;
  }
}

// Helper function to check if URL needs proxy
function needsProxy(url: string): boolean {
  return url.includes('38.183.182.166:8000') || 
         url.includes('jireh-3-hls-video-us-isp.dps.live');
}

// Helper function to rewrite URLs in manifest
function rewriteManifestUrls(manifestContent: string, baseUrl: string, proxyBaseUrl: string): string {
  const lines = manifestContent.split('\n');
  const rewrittenLines = lines.map(line => {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.trim() === '') {
      return line;
    }
    
    // If it's a relative URL (doesn't start with http:// or https://)
    if (!line.startsWith('http://') && !line.startsWith('https://')) {
      // Convert relative URL to absolute using the original base URL
      const url = new URL(line, baseUrl);
      // Return proxied URL
      return `${proxyBaseUrl}/proxy?url=${encodeURIComponent(url.toString())}`;
    }
    
    // If it's an absolute URL, proxy it
    if (line.startsWith('http://') || line.startsWith('https://')) {
      return `${proxyBaseUrl}/proxy?url=${encodeURIComponent(line)}`;
    }
    
    return line;
  });
  
  return rewrittenLines.join('\n');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  // === PROXY MODE: GET /proxy?url=... ===
  if (req.method === 'GET' && url.pathname.endsWith('/proxy')) {
    try {
      const targetUrl = url.searchParams.get('url');
      
      if (!targetUrl) {
        return new Response(
          JSON.stringify({ error: 'Missing url parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Proxying request to:', targetUrl);

      // Fetch the actual content with browser headers
      const urlObj = new URL(targetUrl);
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': browserUserAgent,
          'Accept': '*/*',
          'Accept-Language': 'es-PE,es;q=0.9,en;q=0.8',
          'Referer': urlObj.origin + '/',
          'Origin': urlObj.origin,
        }
      });
      
      if (!response.ok) {
        console.error('Proxy fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        return new Response(
          JSON.stringify({ error: `Failed to fetch content: ${response.status} ${response.statusText}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const contentType = response.headers.get('content-type') || 'application/x-mpegURL';
      let content = await response.text();

      // If it's a manifest file (.m3u8), rewrite URLs
      if (contentType.includes('mpegURL') || contentType.includes('m3u8') || targetUrl.endsWith('.m3u8')) {
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
        const proxyBaseUrl = url.origin + url.pathname.replace('/proxy', '');
        content = rewriteManifestUrls(content, baseUrl, proxyBaseUrl);
      }

      // Return with CORS headers
      return new Response(content, {
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
        },
      });
    } catch (error) {
      console.error('Error in proxy:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        JSON.stringify({ error: message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // === PLAYBACK SESSION MODE: POST (existing functionality) ===
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Log incoming request details
    console.log('Play function invoked:', {
      method: req.method,
      hasAuthHeader: !!req.headers.get('Authorization'),
      authHeaderPrefix: req.headers.get('Authorization')?.substring(0, 20)
    });

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Create client with user's auth token for RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user using the JWT token
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      console.error('No authorization token provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No token provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader);
    
    console.log('👤 LOG 1 - User ID:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    });
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { content_id, profile_id, device_id } = await req.json();
    
    console.log('Request body parsed:', {
      content_id,
      profile_id,
      device_id
    });

    if (!content_id || !profile_id || !device_id) {
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
      .eq('id', content_id)
      .single();

    console.log('🎬 LOG 3 - Content URL:', {
      hasContent: !!content,
      contentTitle: content?.title,
      manifestUrl: content?.manifest_url,
      isTV: content?.is_tv,
      contentError: contentError?.message
    });

    if (contentError || !content) {
      return new Response(
        JSON.stringify({ error: 'Content not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // === 3. GET USER'S ACTIVE SUBSCRIPTION AND PLAN ===
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*, plan:plan_id(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    console.log('📋 LOG 2 - Subscription:', {
      hasSubscription: !!subscription,
      subscriptionStatus: subscription?.status,
      planId: subscription?.plan_id,
      planScope: (subscription?.plan as any)?.scope,
      planName: (subscription?.plan as any)?.name,
      fullSubscription: subscription
    });

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
    await supabaseAdmin.rpc('cleanup_stale_streams');

    // Get current active streams for this user
    const { data: activeStreams, error: streamsError } = await supabaseAdmin
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
      await supabaseAdmin
        .from('active_streams')
        .update({ 
          last_heartbeat: new Date().toISOString(),
          content_id: content_id,
          profile_id: profile_id
        })
        .eq('id', existingDeviceStream.id);
    } else {
      // Create new stream
      await supabaseAdmin
        .from('active_streams')
        .insert({
          user_id: user.id,
          profile_id: profile_id,
          content_id: content_id,
          device_id: device_id,
        });
    }

    // === 7. RETURN MANIFEST URL (or proxied URL) ===
    let manifestUrl = content.manifest_url;
    
    // If content needs proxy, return proxied URL
    if (needsProxy(manifestUrl)) {
      const functionUrl = Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co/functions/v1/play') || 
                         req.url.split('/play')[0] + '/play';
      manifestUrl = `${functionUrl}/proxy?url=${encodeURIComponent(manifestUrl)}`;
      console.log('🔄 Using proxy for URL:', { original: content.manifest_url, proxied: manifestUrl });
    }
    
    return new Response(
      JSON.stringify({ 
        manifest_url: manifestUrl,
        content_id: content_id,
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
