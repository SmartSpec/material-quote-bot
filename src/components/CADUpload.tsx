import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CADAnalysisResult {
  volume: number;
  surface_area: number;
  bounding_box: {
    length: number;
    width: number;
    height: number;
  };
  file_name: string;
}

const CADUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CADAnalysisResult | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const uploadFile = async (uploadedFile: File) => {
    const validExtensions = ['.dxf', '.step', '.stp', '.dwg'];
    const fileExtension = uploadedFile.name.toLowerCase().slice(uploadedFile.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error("Invalid file type. Please upload .DXF, .STEP, or .DWG files.");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to upload files");
        return;
      }

      const filePath = `${user.id}/${Date.now()}_${uploadedFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('cad-files')
        .upload(filePath, uploadedFile);

      if (uploadError) throw uploadError;

      const { data: uploadData, error: dbError } = await supabase
        .from('cad_uploads')
        .insert({
          user_id: user.id,
          file_name: uploadedFile.name,
          file_path: filePath,
          file_size: uploadedFile.size,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setFile(uploadedFile);
      setUploadId(uploadData.id);
      toast.success(`File "${uploadedFile.name}" uploaded successfully!`);

      // Trigger CAD analysis
      setAnalyzing(true);
      try {
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-cad', {
          body: { cad_upload_id: uploadData.id },
        });

        if (analysisError) throw analysisError;

        if (analysisData?.success) {
          setAnalysis(analysisData.analysis);
          toast.success("CAD file analyzed successfully!");
        }
      } catch (analysisError: any) {
        console.error("Analysis error:", analysisError);
        toast.error("File uploaded but analysis failed. You can still generate quotes.");
      } finally {
        setAnalyzing(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  return (
    <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload CAD File
        </CardTitle>
        <CardDescription>
          Upload your CAD file (.DXF, .STEP, or .DWG) to generate an instant quote
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="w-12 h-12 text-success" />
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{file.name}</span>
              </div>

              {analyzing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Analyzing CAD file...
                </div>
              )}

              {analysis && (
                <div className="w-full p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-semibold mb-3 text-sm">Analysis Results</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume:</span>
                      <span className="font-medium">{analysis.volume.toFixed(2)} mm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Surface Area:</span>
                      <span className="font-medium">{analysis.surface_area.toFixed(2)} mm²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions (L×W×H):</span>
                      <span className="font-medium">
                        {analysis.bounding_box.length.toFixed(1)}×
                        {analysis.bounding_box.width.toFixed(1)}×
                        {analysis.bounding_box.height.toFixed(1)} mm
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setAnalysis(null);
                  setUploadId(null);
                }}
                className="mt-2"
              >
                Remove File
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div>
                <p className="mb-2 text-sm font-medium">
                  {uploading ? "Uploading..." : "Drag and drop your CAD file here, or"}
                </p>
                <Button variant="default" asChild className="cursor-pointer" disabled={uploading}>
                  <label>
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      accept=".dxf,.step,.stp,.dwg"
                      onChange={handleFileInput}
                    />
                  </label>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: .DXF, .STEP, .DWG (Max 50MB)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CADUpload;
