import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Billing Dunning Job...');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get subscriptions with past_due status
    const { data: pastDueSubscriptions, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*, plan:plan_id(*)')
      .eq('status', 'pending'); // Using 'pending' as equivalent to past_due for now

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pastDueSubscriptions?.length || 0} subscriptions in pending/past_due state`);

    if (!pastDueSubscriptions || pastDueSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No past due subscriptions found',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];
    const now = new Date();

    for (const subscription of pastDueSubscriptions) {
      const startDate = new Date(subscription.start_date);
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`Processing subscription ${subscription.id} - Days since start: ${daysSinceStart}`);

      let action = 'none';
      let actionMessage = '';

      // Dunning logic: D+0, D+3, D+7
      if (daysSinceStart === 0) {
        action = 'retry_payment_day_0';
        actionMessage = 'First payment attempt (D+0) - Simulated retry';
        console.log(`[SIMULATION] Retry payment for subscription ${subscription.id} (Day 0)`);
      } else if (daysSinceStart === 3) {
        action = 'retry_payment_day_3';
        actionMessage = 'Second payment attempt (D+3) - Simulated retry';
        console.log(`[SIMULATION] Retry payment for subscription ${subscription.id} (Day 3)`);
      } else if (daysSinceStart >= 7) {
        action = 'cancel_subscription_day_7';
        actionMessage = 'Final attempt failed (D+7) - Simulating cancellation';
        console.log(`[SIMULATION] Cancel subscription ${subscription.id} (Day 7+)`);
        
        // Actually update the subscription status to canceled
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({ 
            status: 'canceled',
            end_date: now.toISOString()
          })
          .eq('id', subscription.id);

        if (updateError) {
          console.error(`Error canceling subscription ${subscription.id}:`, updateError);
          actionMessage += ' - ERROR during cancellation';
        } else {
          actionMessage += ' - Successfully canceled';
        }
      }

      results.push({
        subscription_id: subscription.id,
        user_id: subscription.user_id,
        days_since_start: daysSinceStart,
        action: action,
        message: actionMessage,
        timestamp: now.toISOString()
      });
    }

    console.log(`Dunning job completed. Processed ${results.length} subscriptions.`);

    return new Response(
      JSON.stringify({ 
        message: 'Billing dunning job completed',
        processed: results.length,
        results: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in billing-dunning function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});