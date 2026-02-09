import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ScanResult, AnalysisResult } from "@/types/brokerage";

export function useBrokerageScan() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = async (url: string) => {
    setIsScanning(true);
    setError(null);
    setScanResult(null);
    setAnalysisResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("gemini-lookup", {
        body: { url },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data || data.error) throw new Error(data?.error || "Scan failed");

      setScanResult(data as ScanResult);
    } catch (e: any) {
      setError(e.message || "Failed to scan brokerage");
    } finally {
      setIsScanning(false);
    }
  };

  const analyze = async (editedResult: ScanResult) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("analyze-ledger", {
        body: {
          brokerage_name: editedResult.brokerage_name,
          website_url: editedResult.website_url,
          results: editedResult.results,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data || data.error) throw new Error(data?.error || "Analysis failed");
      if (typeof data.overall_score !== "number") throw new Error("Analysis returned incomplete data. Please try again.");

      setAnalysisResult(data as AnalysisResult);
    } catch (e: any) {
      setError(e.message || "Failed to analyze brokerage");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    scanResult,
    setScanResult,
    analysisResult,
    isScanning,
    isAnalyzing,
    error,
    scan,
    analyze,
  };
}
