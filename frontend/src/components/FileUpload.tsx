import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, AlertCircle, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useCostStore } from '../store/cost-store';
import { downloadSampleCSV } from '../lib/sample-csv-generator';

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setCostData, setAnomalies, setRecommendations, isLoading, setLoading } = useCostStore();

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setError('');
    setFileName(file.name);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('table_name', 'cost_data');

      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload file');
      }

      // Extract all the processed data from backend response
      const costData = result.results || [];
      const anomalies = result.anomalies || [];
      const recommendations = result.recommendations || [];
      
      setCostData(costData);
      setAnomalies(anomalies);
      setRecommendations(recommendations);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      setFileName('');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      <Card
        className={`p-8 border-2 border-dashed transition-colors cursor-pointer ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          {isLoading ? (
            <>
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <div className="text-center">
                <p className="text-gray-900">Processing {fileName}...</p>
                <p className="text-sm text-gray-500">Analyzing cost data with AI</p>
              </div>
            </>
          ) : fileName ? (
            <>
              <FileText className="h-12 w-12 text-green-500" />
              <div className="text-center">
                <p className="text-gray-900">{fileName}</p>
                <p className="text-sm text-gray-500">Click or drag to replace</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400" />
              <div className="text-center">
                <p className="text-gray-900">Upload AWS Cost & Usage Report</p>
                <p className="text-sm text-gray-500">
                  Drag and drop your CSV file here, or click to browse
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={(e) => e.stopPropagation()}>
                  Select File
                </Button>
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSampleCSV();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample
                </Button>
              </div>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
