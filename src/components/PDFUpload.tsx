import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// Using custom supabase client to bypass Lovable's auto-generated one

interface PDFAnalysisResult {
  pages: number;
  text_content: string;
  dimensions?: string;
  file_name: string;
}

const PDFUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PDFAnalysisResult | null>(null);

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
    const fileExtension = uploadedFile.name.toLowerCase().slice(uploadedFile.name.lastIndexOf('.'));

    if (fileExtension !== '.pdf') {
      toast.error("Invalid file type. Please upload PDF files only.");
      return;
    }

    // Debug: Log Supabase URL being used by the client
    console.log("Supabase client URL:", (supabase as any).supabaseUrl);
    console.log("Env SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log("Env SUPABASE_PROJECT_ID:", import.meta.env.VITE_SUPABASE_PROJECT_ID);

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in to upload files");
        return;
      }

      const filePath = `${user.id}/${Date.now()}_${uploadedFile.name}`;

      // Upload PDF to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('pressure-vessel-pdfs')
        .upload(filePath, uploadedFile);

      if (uploadError) throw uploadError;

      // Create database record
      const { data: uploadData, error: dbError } = await supabase
        .from('pressure_vessel_uploads')
        .insert({
          user_id: user.id,
          file_name: uploadedFile.name,
          file_path: filePath,
          file_size: uploadedFile.size,
          wall_thickness: 1, // Default wall thickness
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setFile(uploadedFile);
      toast.success(`PDF "${uploadedFile.name}" uploaded successfully!`);

      // Trigger PDF analysis
      setAnalyzing(true);
      try {
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-pdf', {
          body: {
            pressure_vessel_upload_id: uploadData.id
          },
        });

        if (analysisError) throw analysisError;

        if (analysisData?.success && analysisData?.analysis) {
          setAnalysis({
            pages: 1, // PDF analysis doesn't return page count but we keep for compatibility
            text_content: `Radius: ${analysisData.analysis.radius} ${analysisData.analysis.unit}, Height: ${analysisData.analysis.height} ${analysisData.analysis.unit}`,
            dimensions: `${analysisData.analysis.radius} x ${analysisData.analysis.height} ${analysisData.analysis.unit}`,
            file_name: analysisData.analysis.file_name
          });
          toast.success("PDF analyzed successfully!");
        }
      } catch (analysisError: any) {
        console.error("Analysis error:", analysisError);
        toast.error("File uploaded but analysis failed.");
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
          Upload PDF Drawings
        </CardTitle>
        <CardDescription>
          Upload PDF drawings and blueprints for analysis (architectural plans, schematics, etc.)
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
                  Analyzing PDF...
                </div>
              )}

              {analysis && (
                <div className="w-full p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-semibold mb-3 text-sm">Analysis Results</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pages:</span>
                      <span className="font-medium">{analysis.pages}</span>
                    </div>
                    {analysis.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span className="font-medium">{analysis.dimensions}</span>
                      </div>
                    )}
                    <div className="mt-3">
                      <span className="text-muted-foreground block mb-2">Text Preview:</span>
                      <div className="max-h-32 overflow-y-auto text-left bg-background/50 p-2 rounded text-xs">
                        {analysis.text_content.substring(0, 500)}
                        {analysis.text_content.length > 500 && '...'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setAnalysis(null);
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
                  {uploading ? "Uploading..." : "Drag and drop your PDF here, or"}
                </p>
                <Button variant="default" asChild className="cursor-pointer" disabled={uploading}>
                  <label>
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleFileInput}
                    />
                  </label>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported format: PDF (Max 50MB)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFUpload;
