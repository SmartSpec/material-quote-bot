import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CADUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

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

      const { error: dbError } = await supabase
        .from('cad_uploads')
        .insert({
          user_id: user.id,
          file_name: uploadedFile.name,
          file_path: filePath,
          file_size: uploadedFile.size,
        });

      if (dbError) throw dbError;

      setFile(uploadedFile);
      toast.success(`File "${uploadedFile.name}" uploaded successfully!`);
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
              <Button
                variant="outline"
                onClick={() => setFile(null)}
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
