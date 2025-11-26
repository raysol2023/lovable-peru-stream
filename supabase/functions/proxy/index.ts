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
    // Extract target URL from query parameter
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
      console.error('[PROXY] Fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        url: targetUrl
      });
      return new Response(
        JSON.stringify({ error: `Proxy failed: ${response.status} ${response.statusText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get content type from response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    let content = await response.text();

    // If it's a playlist (m3u8), rewrite URLs to go through proxy
    if (contentType.includes('m3u8') || contentType.includes('mpegURL') || targetUrl.endsWith('.m3u8')) {
      console.log('[PROXY] Rewriting m3u8 URLs');
      const baseUrl = new URL(targetUrl);
      const proxyBaseUrl = `${url.origin}/functions/v1/proxy?url=`;

      // Rewrite relative and absolute URLs in the manifest
      content = content.split('\n').map(line => {
        // Skip comments and empty lines
        if (line.startsWith('#') || line.trim() === '') {
          return line;
        }

        // If line is a URL
        if (line.trim().length > 0) {
          let absoluteUrl: string;

          // Handle absolute URLs
          if (line.startsWith('http://') || line.startsWith('https://')) {
            absoluteUrl = line;
          } 
          // Handle protocol-relative URLs
          else if (line.startsWith('//')) {
            absoluteUrl = baseUrl.protocol + line;
          }
          // Handle absolute paths
          else if (line.startsWith('/')) {
            absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}${line}`;
          }
          // Handle relative paths
          else {
            const basePath = baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1);
            absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}${basePath}${line}`;
          }

          // Return proxied URL
          return `${proxyBaseUrl}${encodeURIComponent(absoluteUrl)}`;
        }

        return line;
      }).join('\n');
    }

    console.log('[PROXY] Success:', {
      contentType,
      contentLength: content.length,
      url: targetUrl
    });

    // Return content with CORS headers
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
