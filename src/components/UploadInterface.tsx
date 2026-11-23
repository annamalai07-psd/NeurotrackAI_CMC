import { useState, useCallback } from "react";
import { Upload, FileImage, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UploadInterfaceProps {
  onUpload: (file: File) => void;
  isAnalyzing: boolean;
}

const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".dcm"];

const isSupportedFile = (file: File) => {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
};

const UploadInterface = ({ onUpload, isAnalyzing }: UploadInterfaceProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isSupportedFile(file)) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a valid CT scan image (PNG, JPG, JPEG, DCM)",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isSupportedFile(file)) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a valid CT scan image (PNG, JPG, JPEG, DCM)",
          variant: "destructive",
        });
      }
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-foreground">Upload CT Scan</CardTitle>
        <p className="text-muted-foreground">
          Upload skull-sliced CT scan images for AI-powered stroke detection
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!selectedFile ? (
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.dcm,application/dicom"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">
                  Drop your CT scan here
                </h3>
                <p className="text-muted-foreground">
                  or <span className="text-primary font-medium">click to browse</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PNG, JPG, JPEG, DCM • Max 10MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileImage className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isAnalyzing}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
            
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              variant="default"
              className="w-full bg-gradient-medical"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Analyzing CT Scan...
                </>
              ) : (
                "Start AI Analysis"
              )}
            </Button>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-2">Security Notice</h4>
          <p className="text-sm text-muted-foreground">
            All uploaded images are processed securely and in compliance with healthcare 
            data protection standards. Images are not stored permanently.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadInterface;
