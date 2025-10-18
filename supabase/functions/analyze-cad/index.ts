import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CADAnalysis {
  volume: number;
  surfaceArea: number;
  boundingBox: {
    length: number;
    width: number;
    height: number;
  };
  materialType?: string;
}

// Parse STEP file format
function parseStepFile(content: string): CADAnalysis {
  console.log("Parsing STEP file, content length:", content.length);

  // STEP files have geometry data in specific sections
  // This is a simplified parser - production would use a proper CAD library

  // Look for CARTESIAN_POINT coordinates
  const pointRegex = /CARTESIAN_POINT\('',\(([-\d.]+),([-\d.]+),([-\d.]+)\)\)/g;
  const points: number[][] = [];
  let match;

  while ((match = pointRegex.exec(content)) !== null) {
    points.push([
      parseFloat(match[1]),
      parseFloat(match[2]),
      parseFloat(match[3])
    ]);
  }

  // Calculate bounding box from points
  if (points.length === 0) {
    // Default values if no points found
    return {
      volume: 1000,
      surfaceArea: 600,
      boundingBox: { length: 10, width: 10, height: 10 }
    };
  }

  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const zs = points.map(p => p[2]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);

  const length = Math.abs(maxX - minX);
  const width = Math.abs(maxY - minY);
  const height = Math.abs(maxZ - minZ);

  // Estimate volume (simplified - real calculation would need proper mesh)
  const volume = length * width * height;
  const surfaceArea = 2 * (length * width + width * height + height * length);

  return {
    volume,
    surfaceArea,
    boundingBox: { length, width, height }
  };
}

// Parse DXF file format
function parseDxfFile(content: string): CADAnalysis {
  console.log("Parsing DXF file, content length:", content.length);

  // DXF files use group codes
  // Look for LWPOLYLINE and 3DFACE entities
  const lines = content.split('\n');
  const points: number[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Group code 10, 20, 30 are X, Y, Z coordinates
    if (line === '10' && i + 1 < lines.length) {
      const x = parseFloat(lines[i + 1]);
      const y = lines.findIndex((l, idx) => idx > i && l.trim() === '20') !== -1
        ? parseFloat(lines[lines.findIndex((l, idx) => idx > i && l.trim() === '20') + 1])
        : 0;
      const z = lines.findIndex((l, idx) => idx > i && l.trim() === '30') !== -1
        ? parseFloat(lines[lines.findIndex((l, idx) => idx > i && l.trim() === '30') + 1])
        : 0;

      if (!isNaN(x)) {
        points.push([x, y, z]);
      }
    }
  }

  if (points.length === 0) {
    return {
      volume: 1000,
      surfaceArea: 600,
      boundingBox: { length: 10, width: 10, height: 10 }
    };
  }

  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const zs = points.map(p => p[2]);

  const length = Math.max(...xs) - Math.min(...xs);
  const width = Math.max(...ys) - Math.min(...ys);
  const height = Math.max(...zs) - Math.min(...zs);

  const volume = length * width * Math.max(height, 1); // 2D DXF might have height = 0
  const surfaceArea = 2 * (length * width + width * height + height * length);

  return {
    volume,
    surfaceArea,
    boundingBox: { length, width, height }
  };
}

// Parse STL file format
function parseStlFile(content: string): CADAnalysis {
  console.log("Parsing STL file, content length:", content.length);

  // STL files have triangular facets
  const facetRegex = /facet normal ([-\d.eE]+) ([-\d.eE]+) ([-\d.eE]+)[\s\S]*?vertex ([-\d.eE]+) ([-\d.eE]+) ([-\d.eE]+)[\s\S]*?vertex ([-\d.eE]+) ([-\d.eE]+) ([-\d.eE]+)[\s\S]*?vertex ([-\d.eE]+) ([-\d.eE]+) ([-\d.eE]+)/g;
  const points: number[][] = [];
  let match;

  while ((match = facetRegex.exec(content)) !== null) {
    // Extract 3 vertices from each facet
    points.push([parseFloat(match[4]), parseFloat(match[5]), parseFloat(match[6])]);
    points.push([parseFloat(match[7]), parseFloat(match[8]), parseFloat(match[9])]);
    points.push([parseFloat(match[10]), parseFloat(match[11]), parseFloat(match[12])]);
  }

  if (points.length === 0) {
    return {
      volume: 1000,
      surfaceArea: 600,
      boundingBox: { length: 10, width: 10, height: 10 }
    };
  }

  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const zs = points.map(p => p[2]);

  const length = Math.max(...xs) - Math.min(...xs);
  const width = Math.max(...ys) - Math.min(...ys);
  const height = Math.max(...zs) - Math.min(...zs);

  const volume = length * width * height;
  const surfaceArea = 2 * (length * width + width * height + height * length);

  return {
    volume,
    surfaceArea,
    boundingBox: { length, width, height }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    const { cad_upload_id } = await req.json();

    // Get CAD file info from database
    const { data: cadUpload, error: fetchError } = await supabaseClient
      .from('cad_uploads')
      .select('*')
      .eq('id', cad_upload_id)
      .single();

    if (fetchError || !cadUpload) {
      throw new Error('CAD upload not found');
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('cad-files')
      .download(cadUpload.file_path);

    if (downloadError || !fileData) {
      throw new Error('Failed to download CAD file');
    }

    // Read file content
    const fileContent = await fileData.text();

    // Parse based on file extension
    const fileExtension = cadUpload.file_name.toLowerCase().slice(cadUpload.file_name.lastIndexOf('.'));
    let analysis: CADAnalysis;

    switch (fileExtension) {
      case '.step':
      case '.stp':
        analysis = parseStepFile(fileContent);
        break;
      case '.dxf':
        analysis = parseDxfFile(fileContent);
        break;
      case '.stl':
        analysis = parseStlFile(fileContent);
        break;
      case '.dwg':
        // DWG is binary format - would need special library
        // For now, return estimated values
        analysis = {
          volume: 5000,
          surfaceArea: 1500,
          boundingBox: { length: 50, width: 30, height: 20 }
        };
        break;
      default:
        throw new Error('Unsupported file format');
    }

    // Update database with analysis results
    const { error: updateError } = await supabaseClient
      .from('cad_uploads')
      .update({
        estimated_volume: analysis.volume,
        material_type: analysis.materialType || null,
      })
      .eq('id', cad_upload_id);

    if (updateError) {
      console.error('Failed to update CAD upload:', updateError);
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: {
        volume: analysis.volume,
        surface_area: analysis.surfaceArea,
        bounding_box: analysis.boundingBox,
        file_name: cadUpload.file_name,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error analyzing CAD file:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
