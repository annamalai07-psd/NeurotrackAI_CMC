import React, { useState } from "react";
import { predictStroke } from "@/services/predictService";
import heroImage from "@/assets/medical-hero.jpg";

interface PredictionResult {
  prediction: "Stroke" | "Normal";
  confidence: number;           // already %
  color: "red" | "green";
  original_image_base64?: string;
  overlayed_image_base64?: string;
}

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const isSupportedFile = (file: File) => {
    const name = file.name.toLowerCase();
    return [".png", ".jpg", ".jpeg", ".dcm"].some((ext) => name.endsWith(ext));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      if (!isSupportedFile(file)) {
        alert("Select a PNG, JPG, JPEG, or DCM file.");
        e.target.value = "";
        return;
      }

      setSelectedFile(file);
      setPreview(file.name.toLowerCase().endsWith(".dcm") ? null : URL.createObjectURL(file));
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      alert("Select an image first");
      return;
    }

    setLoading(true);
    try {
      const data = await predictStroke(selectedFile);
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Backend error on port 5002";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-calm">
      {/* HEADER */}
      <header className="flex justify-between px-8 py-4 bg-white shadow">
        <div>
          <b>🏥 CMCH NeurotrackAI</b>
          <p className="text-sm text-gray-500">AI-Powered Stroke Detection</p>
        </div>
        <span className="text-green-600 font-semibold">🟢 System Online</span>
      </header>

      <main className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">

        {!result ? (
          <>
            <input type="file" accept=".png,.jpg,.jpeg,.dcm,application/dicom" onChange={handleFileChange} />
            <p className="mt-2 text-sm text-gray-500">Supported: PNG, JPG, JPEG, DCM</p>
            {preview && (
              <img src={preview} className="w-64 mt-4 border rounded" />
            )}
            {selectedFile && !preview && (
              <div className="w-64 mt-4 border rounded p-4 text-sm text-gray-600 bg-gray-50">
                Selected DICOM: <b>{selectedFile.name}</b>
              </div>
            )}

            <button
              onClick={handlePredict}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? "Analyzing…" : "Start Analysis"}
            </button>
          </>
        ) : (
          <>
            {/* RESULT BANNER */}
            <div
              className={`p-6 rounded-xl text-center text-white ${
                result.color === "red"
                  ? "bg-gradient-alert"
                  : "bg-gradient-success"
              }`}
            >
              <h2 className="text-3xl font-bold">
                {result.prediction === "Stroke" ? "Stroke Detected" : "Normal"}
              </h2>

              <p className="mt-2">
                Confidence: <b>{result.confidence.toFixed(1)}%</b>
              </p>
            </div>

            {/* IMAGE DISPLAY */}
            {result.prediction === "Stroke" && result.overlayed_image_base64 ? (
              <div className="flex gap-8 mt-6 justify-center">
                <img
                  src={`data:image/png;base64,${result.original_image_base64}`}
                  className="w-72 border rounded"
                />
                <img
                  src={`data:image/png;base64,${result.overlayed_image_base64}`}
                  className="w-72 border rounded"
                />
              </div>
            ) : (
              <div className="mt-6 flex justify-center">
                <img
                  src={`data:image/png;base64,${result.original_image_base64}`}
                  className="w-72 border rounded"
                />
              </div>
            )}

            <button
              onClick={resetAnalysis}
              className="mt-6 px-6 py-2 bg-gray-600 text-white rounded"
            >
              New Analysis
            </button>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
