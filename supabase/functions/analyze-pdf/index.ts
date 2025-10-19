import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.24.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { pdfPath, wallThickness } = await req.json();

    if (!pdfPath) {
      throw new Error("pdfPath is required");
    }

    console.log("Processing PDF:", pdfPath);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download PDF from storage
    const { data: pdfData, error: downloadError } = await supabase.storage
      .from("pressure-vessel-pdfs")
      .download(pdfPath);

    if (downloadError) {
      console.error("Download error:", downloadError);
      throw new Error(`Failed to download PDF: ${downloadError.message}`);
    }

    console.log("PDF downloaded, size:", pdfData.size);

    // Convert PDF to base64
    const arrayBuffer = await pdfData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const base64Pdf = btoa(String.fromCharCode(...bytes));

    console.log("PDF converted to base64");
    console.log("PDF size in bytes:", arrayBuffer.byteLength);
    console.log("Base64 length:", base64Pdf.length);

    // Initialize Anthropic client
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY")!;
    const anthropic = new Anthropic({ apiKey: anthropicApiKey });

    console.log("Calling Claude API for PDF analysis...");

    // Call Claude API with vision using Sonnet 4.5 for best text reading
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Pdf,
              },
            },
            {
              type: "text",
              text: `You are analyzing a technical drawing of a pressure vessel (flat-end cylinder).

Extract the following dimensions from this PDF drawing:
1. RADIUS (R) or DIAMETER (D) - if diameter is given, divide by 2 for radius
2. HEIGHT (H) or LENGTH (L) of the cylindrical section

Look for:
- Dimension labels like "R = X", "D = X", "H = X", "L = X"
- Dimension lines with measurements
- Title blocks or dimension tables
- Any numerical values with units (inches, mm, cm, meters, feet)

Respond ONLY with a JSON object in this exact format:
{
  "radius": <number>,
  "height": <number>,
  "unit": "<unit string like 'inches', 'mm', 'cm', 'm', 'ft'>"
}

If you find diameter instead of radius, convert it by dividing by 2.
If units are abbreviated (in, ", mm, cm, m, ft, '), expand them to full words.
Only include the JSON object in your response, no other text.`,
            },
          ],
        },
      ],
    });

    console.log("Claude API response received");

    // Extract the text response
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const responseText = textContent.text;
    console.log("Claude response:", responseText);
    console.log("Full message object:", JSON.stringify(message, null, 2));

    // Parse JSON from response
    let parsedData;
    try {
      // Try to extract JSON if there's extra text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error("Failed to parse Claude response:", responseText);
      throw new Error(`Failed to parse dimensions from PDF: ${parseError.message}`);
    }

    // Validate parsed data
    if (typeof parsedData.radius !== "number" || typeof parsedData.height !== "number") {
      throw new Error("Invalid dimension data extracted from PDF");
    }

    console.log("Extracted dimensions:", parsedData);

    return new Response(
      JSON.stringify({
        radius: parsedData.radius,
        height: parsedData.height,
        unit: parsedData.unit || "inches",
        wallThickness: wallThickness || 1,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in analyze-pdf function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
