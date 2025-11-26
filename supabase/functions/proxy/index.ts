import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[PROXY] Fetching:', targetUrl);

    // Fetch with browser-like headers to bypass 403
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://google.com',
        'Origin': 'https://google.com',
        'Accept': '*/*',
        'Accept-Language': 'es-PE,es;q=0.9,en;q=0.8',
      }
    });

    if (!response.ok) {
      console.error('[PROXY] Fetch failed:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: `Proxy failed: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    let content = await response.text();

    // Rewrite m3u8 URLs to use proxy
    if (contentType.includes('m3u8') || contentType.includes('mpegURL') || targetUrl.endsWith('.m3u8')) {
      console.log('[PROXY] Rewriting m3u8 URLs');
      const baseUrl = new URL(targetUrl);
      
      // Get the Supabase project URL from environment
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || url.origin;
      const proxyBaseUrl = `${supabaseUrl}/functions/v1/proxy?url=`;

      content = content.split('\n').map(line => {
        if (line.startsWith('#') || line.trim() === '') {
          return line;
        }

        if (line.trim().length > 0) {
          let absoluteUrl: string;

          if (line.startsWith('http://') || line.startsWith('https://')) {
            absoluteUrl = line;
          } else if (line.startsWith('//')) {
            absoluteUrl = baseUrl.protocol + line;
          } else if (line.startsWith('/')) {
            absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}${line}`;
          } else {
            const basePath = baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1);
            absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}${basePath}${line}`;
          }

          return `${proxyBaseUrl}${encodeURIComponent(absoluteUrl)}`;
        }

        return line;
      }).join('\n');
    }

    console.log('[PROXY] Success:', contentType, content.length, 'bytes');

    return new Response(content, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType.includes('m3u8') || contentType.includes('mpegURL') 
          ? 'application/x-mpegURL' 
          : contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('[PROXY] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
