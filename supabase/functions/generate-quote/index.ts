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

    const { quantity, material, process, cadUploadId, estimatedVolume } = await req.json();

    // Fetch current commodity price for the exact material
    const { data: commodityData } = await supabaseClient
      .from('commodity_prices')
      .select('price')
      .eq('name', material)
      .single();

    const basePrice = commodityData?.price || 1000;

    // Material density (kg/mm³)
    const densities: Record<string, number> = {
      'A36': 0.0000078, // 7.8 g/cm³
      '4140': 0.0000078, // 7.8 g/cm³
      '304SS': 0.0000080, // 8.0 g/cm³
      'A572': 0.0000078, // 7.8 g/cm³
      'Steel': 0.0000078, // 7.8 g/cm³
      'Aluminum': 0.0000027, // 2.7 g/cm³
      'Titanium': 0.0000045, // 4.5 g/cm³
    };

    const density = densities[material] || 0.0000078;

    // Calculate costs based on actual volume or estimate
    let volume = estimatedVolume || 50000; // Default 50,000 mm³ if no CAD
    let materialWeight = volume * density; // kg
    let materialCostPerUnit = (basePrice / 1000) * materialWeight; // Price per metric ton to kg
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

    // Labor hours estimation based on volume, complexity, and process
    // Adjusted to ensure realistic labor hours (target ~18-20 hours for typical parts)
    const baseHoursPerUnit = 6; // Base hours for setup, programming, and initial fabrication
    
    // Volume-based complexity factor (larger/more complex parts = more time)
    const volumeInCubicInches = volume / 16387; // Convert mm³ to cubic inches
    // Use a more aggressive scaling to reflect real fabrication time
    const volumeComplexityFactor = Math.max(2.0, 1 + Math.sqrt(volumeInCubicInches) * 0.3);
    
    // Process-specific time multipliers (realistic shop floor times)
    const processComplexityMultipliers: Record<string, number> = {
      'laser-cutting': 1.3,  // Programming, setup, cutting, and finishing
      'cnc-machining': 2.2,  // Most time-intensive: setup, tooling, machining, QC
      'sheet-metal': 1.1,    // Faster with modern equipment but still needs setup
      'welding': 1.7,        // Prep, fit-up, welding, and post-weld cleanup
    };
    const processComplexity = processComplexityMultipliers[process] || 1.5;
    
    // Calculate per-unit hours
    const estimatedHoursPerUnit = baseHoursPerUnit * volumeComplexityFactor * processComplexity;
    
    // Total labor hours (with batch efficiency for quantities > 1)
    const batchEfficiency = quantity > 1 ? 0.85 : 1.0; // 15% efficiency gain for batch production
    const totalLaborHours = estimatedHoursPerUnit * quantity * batchEfficiency;
    
    const laborRate = 25.00; // $25 per hour (industry standard fabrication shop rate)
    const laborCost = totalLaborHours * laborRate;
    
    console.log(`Labor calculation details:
      - Volume: ${volume} mm³ (${volumeInCubicInches.toFixed(2)} cubic inches)
      - Volume complexity factor: ${volumeComplexityFactor.toFixed(2)}
      - Process: ${process} (multiplier: ${processComplexity})
      - Base hours: ${baseHoursPerUnit}
      - Hours per unit: ${estimatedHoursPerUnit.toFixed(2)}
      - Quantity: ${quantity}
      - Batch efficiency: ${batchEfficiency}
      - Total labor hours: ${totalLaborHours.toFixed(2)}
      - Labor rate: $${laborRate}/hr
      - Total labor cost: $${laborCost.toFixed(2)}`);

    // Overhead calculation (energy, risk premium)
    const energyCost = 0.05 * quantity;
    const riskBuffer = 1.03; // 3% volatility buffer
    
    const overheadCost = energyCost;
    const totalPrice = (materialCost + fabricationCost + laborCost + overheadCost) * riskBuffer;

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
        labor_hours: parseFloat(totalLaborHours.toFixed(2)),
        labor_rate: laborRate,
        labor_cost: parseFloat(laborCost.toFixed(2)),
        overhead_cost: parseFloat(overheadCost.toFixed(2)),
        total_price: parseFloat(totalPrice.toFixed(2)),
        valid_until: validUntil.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Include volume in response for display
    const responseData = {
      ...quote,
      volume: estimatedVolume || null,
    };

    return new Response(JSON.stringify(responseData), {
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
