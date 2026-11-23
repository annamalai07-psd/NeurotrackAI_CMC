import { useState } from "react";
import { CheckCircle, AlertCircle, Download, Eye, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ResultsDisplayProps {
  result: {
    isStroke: boolean;
    confidence: number;
    fileName: string;
    analysisTime: string;
    originalImage: string;
    processedImage?: string;
  };
  onNewAnalysis: () => void;
}

const ResultsDisplay = ({ result, onNewAnalysis }: ResultsDisplayProps) => {
  const [viewingProcessed, setViewingProcessed] = useState(false);

  const handleDownloadReport = () => {
    // Mock report generation
    const reportData = {
      patientInfo: "Anonymous Patient",
      scanDate: new Date().toLocaleDateString(),
      analysisResult: result.isStroke ? "Stroke Detected" : "Normal",
      confidence: `${result.confidence}%`,
      recommendations: result.isStroke 
        ? "Immediate medical intervention recommended. Consult neurologist."
        : "No signs of stroke detected. Continue routine care.",
    };

    const csvContent = `
Patient,Scan Date,Result,Confidence,Recommendations
${reportData.patientInfo},${reportData.scanDate},${reportData.analysisResult},${reportData.confidence},"${reportData.recommendations}"
    `.trim();

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stroke-analysis-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Results Header */}
      <Card className={`shadow-card ${result.isStroke ? 'border-destructive/20' : 'border-success/20'}`}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            {result.isStroke ? (
              <AlertCircle className="w-12 h-12 text-destructive" />
            ) : (
              <CheckCircle className="w-12 h-12 text-success" />
            )}
            <div>
              <CardTitle className="text-3xl text-foreground">
                {result.isStroke ? "Stroke Detected" : "Normal Scan"}
              </CardTitle>
              <Badge 
                variant={result.isStroke ? "destructive" : "secondary"}
                className="mt-2"
              >
                {result.confidence}% Confidence
              </Badge>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            Analysis completed in {result.analysisTime} • File: {result.fileName}
          </p>
        </CardHeader>
      </Card>

      {/* Image Display */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-foreground">
              CT Scan Analysis
            </CardTitle>
            {result.processedImage && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingProcessed(!viewingProcessed)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {viewingProcessed ? "Original" : "Processed"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="relative rounded-lg overflow-hidden bg-muted/30">
            <img
              src={viewingProcessed && result.processedImage ? result.processedImage : result.originalImage}
              alt={viewingProcessed ? "Processed CT scan with highlighted regions" : "Original CT scan"}
              className="w-full h-auto max-h-96 object-contain mx-auto"
            />
            
            {viewingProcessed && result.isStroke && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-destructive text-destructive-foreground">
                  Stroke Region Highlighted
                </Badge>
              </div>
            )}
          </div>
          
          {result.isStroke && (
            <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">Clinical Recommendations</h4>
              <ul className="text-sm text-destructive/80 space-y-1">
                <li>• Immediate consultation with neurologist recommended</li>
                <li>• Consider emergency stroke protocols</li>
                <li>• Monitor patient vitals closely</li>
                <li>• Prepare for potential intervention procedures</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleDownloadReport}
              className="flex-1"
              variant="outline"
            >
              <Download className="mr-2 w-4 h-4" />
              Download Report (CSV)
            </Button>
            
            <Button
              onClick={onNewAnalysis}
              className="flex-1 bg-gradient-medical"
              variant="default"
            >
              <RotateCcw className="mr-2 w-4 h-4" />
              New Analysis
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Report generated on {new Date().toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              This AI analysis is intended to assist healthcare professionals and should not replace clinical judgment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsDisplay;