import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fallback prices (average historical values)
const AVG_PRICES = {
  hrc: 850,        // Hot Rolled Coil
  scrap: 450,      // Scrap metal
  iron_ore: 115,   // Iron ore
  oil: 80,         // WTI Crude
  gas: 3,          // Natural Gas
  aluminum: 2500,  // Aluminum
  copper: 4500,    // Copper
};

// Material multipliers for different steel grades
const MATERIAL_MULTIPLIERS: Record<string, number> = {
  "A36": 1.0,
  "4140": 1.25,
  "304SS": 2.5,
  "A572": 1.1,
  "Steel": 1.0,
  "Aluminum": 1.0,
  "Copper": 1.0,
  "Stainless": 2.5,
};

// Weighted formula for steel pricing
const WEIGHTS = {
  hrc: 0.55,
  scrap: 0.15,
  iron_ore: 0.10,
  oil: 0.10,
  gas: 0.05,
  premium: 0.05,
};

const BASE_A36 = 800; // Base price for A36 steel per metric ton

// Fetch price from Yahoo Finance API or similar
async function fetchYahooPrice(symbol: string, fallback: number): Promise<number> {
  try {
    // Using a simpler approach - fetch from Yahoo Finance API
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (!response.ok) {
      console.log(`Failed to fetch ${symbol}, using fallback`);
      return fallback;
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const price = result?.meta?.regularMarketPrice;

    if (price && typeof price === "number") {
      console.log(`Fetched ${symbol}: $${price}`);
      return price;
    }

    return fallback;
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return fallback;
  }
}

// Calculate weighted steel price
function calculateWeightedSteelPrice(prices: Record<string, number>, material: string = "A36"): number {
  const base = BASE_A36 * (
    WEIGHTS.hrc * (prices.hrc / AVG_PRICES.hrc) +
    WEIGHTS.scrap * (prices.scrap / AVG_PRICES.scrap) +
    WEIGHTS.iron_ore * (prices.iron_ore / AVG_PRICES.iron_ore) +
    WEIGHTS.oil * (prices.oil / AVG_PRICES.oil) +
    WEIGHTS.gas * (prices.gas / AVG_PRICES.gas) +
    WEIGHTS.premium
  );

  const multiplier = MATERIAL_MULTIPLIERS[material.toUpperCase()] || 1.0;
  return Math.round(base * multiplier * 100) / 100;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Fetching live commodity prices...");

    // Fetch live prices
    const [hrc, scrap, oil, gas, aluminum, copper] = await Promise.all([
      fetchYahooPrice("HRC=F", AVG_PRICES.hrc),       // Hot Rolled Coil
      fetchYahooPrice("HG=F", AVG_PRICES.scrap),      // Copper as scrap proxy
      fetchYahooPrice("CL=F", AVG_PRICES.oil),        // WTI Crude
      fetchYahooPrice("NG=F", AVG_PRICES.gas),        // Natural Gas
      fetchYahooPrice("ALI=F", AVG_PRICES.aluminum),  // Aluminum
      fetchYahooPrice("HG=F", AVG_PRICES.copper),     // Copper
    ]);

    const prices = {
      hrc,
      scrap,
      iron_ore: AVG_PRICES.iron_ore, // No direct ticker, use average
      oil,
      gas,
      aluminum,
      copper,
    };

    console.log("Fetched prices:", prices);

    // Calculate prices for different materials
    const steelPrice = calculateWeightedSteelPrice(prices, "Steel");
    const stainlessPrice = calculateWeightedSteelPrice(prices, "Stainless");
    const aluminumPrice = aluminum;
    const copperPrice = copper;

    console.log("Calculated prices:", { steelPrice, stainlessPrice, aluminumPrice, copperPrice });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update commodity prices in database
    const updates = [
      { name: "Steel", price: steelPrice, unit: "$/ton", change_percentage: 0, trend: "stable" },
      { name: "Stainless Steel", price: stainlessPrice, unit: "$/ton", change_percentage: 0, trend: "stable" },
      { name: "Aluminum", price: aluminumPrice, unit: "$/ton", change_percentage: 0, trend: "stable" },
      { name: "Copper", price: copperPrice, unit: "$/ton", change_percentage: 0, trend: "stable" },
    ];

    for (const update of updates) {
      const { error } = await supabase
        .from("commodity_prices")
        .upsert(
          {
            name: update.name,
            price: update.price,
            unit: update.unit,
            change_percentage: update.change_percentage,
            trend: update.trend,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "name",
          }
        );

      if (error) {
        console.error(`Error updating ${update.name}:`, error);
      } else {
        console.log(`Updated ${update.name}: $${update.price}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        prices: {
          steel: steelPrice,
          stainless: stainlessPrice,
          aluminum: aluminumPrice,
          copper: copperPrice,
        },
        raw_prices: prices,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating commodity prices:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
