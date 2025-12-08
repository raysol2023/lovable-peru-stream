import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Headers to bypass 403 blocks
const browserHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Referer': 'https://google.com',
  'Origin': 'https://google.com',
  'Accept': '*/*',
  'Accept-Language': 'es-PE,es;q=0.9,en;q=0.8',
};

/**
 * Checks if the URL is a video segment (.ts) or binary content
 */
function isVideoSegment(url: string, contentType: string): boolean {
  const lowerUrl = url.toLowerCase();
  const lowerContentType = contentType.toLowerCase();
  
  return (
    lowerUrl.endsWith('.ts') ||
    lowerUrl.endsWith('.m4s') ||
    lowerUrl.endsWith('.mp4') ||
    lowerUrl.endsWith('.aac') ||
    lowerContentType.includes('video/') ||
    lowerContentType.includes('audio/') ||
    lowerContentType.includes('octet-stream')
  );
}

/**
 * Checks if the URL is an m3u8 manifest
 */
function isManifest(url: string, contentType: string): boolean {
  const lowerUrl = url.toLowerCase();
  const lowerContentType = contentType.toLowerCase();
  
  return (
    lowerUrl.endsWith('.m3u8') ||
    lowerContentType.includes('m3u8') ||
    lowerContentType.includes('mpegurl')
  );
}

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
    const response = await fetch(targetUrl, { headers: browserHeaders });

    if (!response.ok) {
      console.error('[PROXY] Fetch failed:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: `Proxy failed: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // OPTIMIZATION: For video segments, stream directly without buffering
    // This prevents memory issues and reduces latency
    if (isVideoSegment(targetUrl, contentType)) {
      console.log('[PROXY] Streaming video segment directly');
      
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // For manifests (.m3u8), process and rewrite URLs
    if (isManifest(targetUrl, contentType)) {
      console.log('[PROXY] Processing m3u8 manifest');
      const content = await response.text();
      const baseUrl = new URL(targetUrl);
      
      // Get the Supabase project URL from environment
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || url.origin;
      const proxyBaseUrl = `${supabaseUrl}/functions/v1/proxy?url=`;

      const rewrittenContent = content.split('\n').map(line => {
        // Skip comments and empty lines
        if (line.startsWith('#') || line.trim() === '') {
          return line;
        }

        // Rewrite segment/playlist URLs
        if (line.trim().length > 0) {
          let absoluteUrl: string;

          if (line.startsWith('http://') || line.startsWith('https://')) {
            absoluteUrl = line.trim();
          } else if (line.startsWith('//')) {
            absoluteUrl = baseUrl.protocol + line.trim();
          } else if (line.startsWith('/')) {
            absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}${line.trim()}`;
          } else {
            const basePath = baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1);
            absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}${basePath}${line.trim()}`;
          }

          return `${proxyBaseUrl}${encodeURIComponent(absoluteUrl)}`;
        }

        return line;
      }).join('\n');

      console.log('[PROXY] Manifest rewritten successfully');

      return new Response(rewrittenContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/x-mpegURL',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // For other content types, pass through
    console.log('[PROXY] Passing through:', contentType);
    
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
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
