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
    // Create Supabase client with service role for webhook access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData = await req.json();
    console.log('Culqi webhook received:', webhookData);

    const eventType = webhookData.type;
    const eventData = webhookData.data;

    // Handle different event types
    if (eventType === 'charge.succeeded') {
      const userId = eventData.metadata?.user_id;
      const planId = eventData.metadata?.plan_id;

      if (!userId || !planId) {
        console.error('Missing user_id or plan_id in webhook metadata');
        return new Response(
          JSON.stringify({ error: 'Invalid webhook data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update subscription status to active
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        })
        .eq('user_id', userId)
        .eq('plan_id', planId);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
      } else {
        console.log('Subscription activated successfully for user:', userId);
      }
    } 
    else if (eventType === 'charge.failed') {
      const userId = eventData.metadata?.user_id;
      const planId = eventData.metadata?.plan_id;

      if (userId && planId) {
        // Update subscription status to canceled
        await supabaseClient
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('user_id', userId)
          .eq('plan_id', planId);

        console.log('Subscription canceled due to failed payment for user:', userId);
      }
    }
    else if (eventType === 'refund.created') {
      const userId = eventData.metadata?.user_id;
      
      if (userId) {
        // Cancel subscription on refund
        await supabaseClient
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('user_id', userId);

        console.log('Subscription canceled due to refund for user:', userId);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in subscription-webhook function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
