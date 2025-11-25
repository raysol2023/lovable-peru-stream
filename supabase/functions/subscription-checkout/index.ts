import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CULQI_API_URL = 'https://api.culqi.com/v2';
const CULQI_SECRET_KEY = Deno.env.get('CULQI_SECRET_KEY');

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

    const { plan_id, token_id, email } = await req.json();

    if (!plan_id || !token_id || !email) {
      return new Response(
        JSON.stringify({ error: 'plan_id, token_id and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create charge in Culqi
    const chargeData = {
      amount: Math.round(plan.price * 100), // Culqi uses cents
      currency_code: 'PEN',
      email: email,
      source_id: token_id,
      description: `Suscripción ${plan.name} - OTT Perú`,
      metadata: {
        user_id: user.id,
        plan_id: plan_id,
        plan_name: plan.name
      }
    };

    console.log('Creating Culqi charge:', chargeData);

    const culqiResponse = await fetch(`${CULQI_API_URL}/charges`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CULQI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chargeData),
    });

    const culqiData = await culqiResponse.json();

    if (!culqiResponse.ok) {
      console.error('Culqi charge error:', culqiData);
      return new Response(
        JSON.stringify({ 
          error: 'Error al procesar el pago',
          details: culqiData.user_message || culqiData.merchant_message
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Culqi charge successful:', culqiData);

    // Check if user already has an active subscription
    const { data: existingSub } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingSub) {
      // Update existing subscription
      await supabaseClient
        .from('subscriptions')
        .update({
          plan_id: plan_id,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        })
        .eq('id', existingSub.id);
    } else {
      // Create new subscription
      await supabaseClient
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: plan_id,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        charge_id: culqiData.id,
        message: 'Pago procesado exitosamente',
        subscription: {
          plan_name: plan.name,
          price: plan.price,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in subscription-checkout function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
