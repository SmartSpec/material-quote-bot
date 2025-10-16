import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { quantity, material, process, cadUploadId } = await req.json();

    // Fetch current commodity price
    const { data: commodityData } = await supabaseClient
      .from('commodity_prices')
      .select('price')
      .ilike('name', `%${material}%`)
      .single();

    const basePrice = commodityData?.price || 1000;

    // Calculate costs based on specifications
    const materialCostPerUnit = basePrice * 0.05; // Assume 50kg per part
    const materialCost = materialCostPerUnit * quantity;

    // Process cost estimation
    const processCosts: Record<string, number> = {
      'laser-cutting': 25,
      'cnc-machining': 45,
      'sheet-metal': 20,
      'welding': 35,
    };
    const processCostPerUnit = processCosts[process] || 30;
    const fabricationCost = processCostPerUnit * quantity;

    // Overhead calculation (labor, energy, risk premium)
    const laborMultiplier = 1.25;
    const energyCost = 0.05 * quantity;
    const riskBuffer = 1.03; // 3% volatility buffer
    
    const overheadCost = (materialCost + fabricationCost) * (laborMultiplier - 1) + energyCost;
    const totalPrice = (materialCost + fabricationCost + overheadCost) * riskBuffer;

    // Calculate validity period (7 days from now)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);

    // Save quote to database
    const { data: quote, error } = await supabaseClient
      .from('quotes')
      .insert({
        user_id: user.id,
        cad_upload_id: cadUploadId,
        quantity,
        material,
        process,
        material_cost: parseFloat(materialCost.toFixed(2)),
        fabrication_cost: parseFloat(fabricationCost.toFixed(2)),
        overhead_cost: parseFloat(overheadCost.toFixed(2)),
        total_price: parseFloat(totalPrice.toFixed(2)),
        valid_until: validUntil.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(quote), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error generating quote:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
