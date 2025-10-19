import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VesselDimensions {
  radius: number;
  height: number;
  wallThickness: number;
  unit: string;
}

interface PressureVesselUploadProps {
  onDimensionsExtracted?: (dimensions: VesselDimensions) => void;
}

const PressureVesselUpload = ({ onDimensionsExtracted }: PressureVesselUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedDimensions, setExtractedDimensions] = useState<VesselDimensions | null>(null);
  const [wallThickness, setWallThickness] = useState("1");
  const [uploadId, setUploadId] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setExtractedDimensions(null);
    } else {
      toast.error("Please select a PDF file");
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file first");
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in to upload files");
        setIsUploading(false);
        return;
      }

      // Upload PDF to Supabase Storage
      const fileName = `${user.id}/${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('pressure-vessel-pdfs')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Create database record
      const { data: uploadData, error: dbError } = await supabase
        .from('pressure_vessel_uploads')
        .insert({
          user_id: user.id,
          file_name: selectedFile.name,
          file_path: fileName,
          file_size: selectedFile.size,
          wall_thickness: parseFloat(wallThickness),
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      setUploadId(uploadData.id);
      toast.success("PDF uploaded successfully!");
      setIsUploading(false);

      // Call analyze-pdf Edge Function
      setIsAnalyzing(true);
      console.log("Calling analyze-pdf function with ID:", uploadData.id);

      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-pdf', {
        body: {
          pressure_vessel_upload_id: uploadData.id
        }
      });

      console.log("Analysis response:", { data: analysisData, error: analysisError });

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        toast.error("PDF uploaded but analysis failed. You can still generate quotes with manual inputs.");
        setIsAnalyzing(false);
        return;
      }

      if (analysisData?.success && analysisData?.analysis) {
        const analysis = analysisData.analysis;
        const dimensions: VesselDimensions = {
          radius: analysis.radius,
          height: analysis.height,
          wallThickness: analysis.wall_thickness,
          unit: analysis.unit || "inches"
        };

        setExtractedDimensions(dimensions);
        toast.success("Vessel dimensions extracted successfully!");

        if (onDimensionsExtracted) {
          onDimensionsExtracted(dimensions);
        }
      }
    } catch (error: any) {
      console.error("Full error object:", error);
      console.error("Error message:", error.message);
      toast.error(error.message || "Failed to process PDF");
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleWallThicknessChange = (newThickness: string) => {
    setWallThickness(newThickness);
    if (extractedDimensions) {
      const updated = { ...extractedDimensions, wallThickness: parseFloat(newThickness) };
      setExtractedDimensions(updated);
      if (onDimensionsExtracted) {
        onDimensionsExtracted(updated);
      }
    }
  };

  return (
    <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Pressure Vessel Drawing Upload
        </CardTitle>
        <CardDescription>
          Upload a PDF technical drawing of your pressure vessel. We'll extract dimensions automatically using AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedFile ? (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="w-12 h-12 text-success" />
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">{selectedFile.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>

            <div className="w-full space-y-2">
              <Label htmlFor="wall-thickness">Wall Thickness (inches)</Label>
              <Input
                id="wall-thickness"
                type="number"
                step="0.125"
                min="0.1"
                value={wallThickness}
                onChange={(e) => handleWallThicknessChange(e.target.value)}
                placeholder="1.0"
                disabled={isAnalyzing}
              />
              <p className="text-xs text-muted-foreground">
                Default: 1 inch. Adjust if your vessel uses a different wall thickness.
              </p>
            </div>

            {isAnalyzing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing drawing with Claude AI...
              </div>
            )}

            {extractedDimensions && (
              <div className="w-full p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold mb-3">Extracted Vessel Dimensions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Radius:</span>
                    <span className="font-medium">{extractedDimensions.radius} {extractedDimensions.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Height:</span>
                    <span className="font-medium">{extractedDimensions.height} {extractedDimensions.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wall Thickness:</span>
                    <span className="font-medium">{extractedDimensions.wallThickness} {extractedDimensions.unit}</span>
                  </div>
                  <div className="pt-2 border-t border-primary/20">
                    <span className="text-xs text-success">✓ Ready to generate quote</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setExtractedDimensions(null);
                  setUploadId(null);
                }}
                className="flex-1"
                disabled={isUploading || isAnalyzing}
              >
                Remove File
              </Button>
              {!extractedDimensions && (
                <Button
                  onClick={handleUploadAndAnalyze}
                  disabled={isUploading || isAnalyzing}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="space-y-2 w-full">
              <Label htmlFor="pdf-upload">PDF Drawing</Label>
              <div className="flex gap-2">
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  disabled={isUploading || isAnalyzing}
                />
              </div>
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="wall-thickness-init">Wall Thickness (inches)</Label>
              <Input
                id="wall-thickness-init"
                type="number"
                step="0.125"
                min="0.1"
                value={wallThickness}
                onChange={(e) => setWallThickness(e.target.value)}
                placeholder="1.0"
              />
              <p className="text-xs text-muted-foreground">
                Default: 1 inch. Adjust if needed.
              </p>
            </div>

            <Button
              onClick={handleUploadAndAnalyze}
              disabled={!selectedFile || isUploading || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Drawing...
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Analyze
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PressureVesselUpload;
