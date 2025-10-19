import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PDFAnalysis {
  pages: number;
  text_content: string;
  dimensions?: string;
  file_name: string;
}

async function analyzePDF(pdfBuffer: ArrayBuffer, fileName: string): Promise<PDFAnalysis> {
  // Basic PDF analysis - extract page count and basic text
  const decoder = new TextDecoder();
  const text = decoder.decode(pdfBuffer);
  
  // Count pages by looking for page objects
  const pageMatches = text.match(/\/Type[\s]*\/Page[^s]/g);
  const pageCount = pageMatches ? pageMatches.length : 1;
  
  // Extract visible text content (simplified extraction)
  const textMatches = text.match(/\(([^)]+)\)/g);
  let extractedText = '';
  if (textMatches) {
    extractedText = textMatches
      .map(match => match.slice(1, -1))
      .join(' ')
      .replace(/\\[rn]/g, ' ')
      .trim();
  }
  
  // Try to extract dimensions from MediaBox
  const mediaBoxMatch = text.match(/\/MediaBox\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/);
  let dimensions = undefined;
  if (mediaBoxMatch) {
    const width = parseInt(mediaBoxMatch[3]) - parseInt(mediaBoxMatch[1]);
    const height = parseInt(mediaBoxMatch[4]) - parseInt(mediaBoxMatch[2]);
    dimensions = `${width} × ${height} pts`;
  }

  return {
    pages: pageCount,
    text_content: extractedText.substring(0, 2000) || 'No text content extracted',
    dimensions,
    file_name: fileName
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { file_path, file_name } = await req.json();

    console.log('Analyzing PDF:', file_path);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('cad-files')
      .download(file_path);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error('Failed to download PDF file');
    }

    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();

    // Analyze the PDF
    const analysis = await analyzePDF(arrayBuffer, file_name);

    console.log('Analysis complete:', analysis);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error: any) {
    console.error('Error in analyze-pdf function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
