import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ScanResult, AnalysisResult, SiteSignals } from "@/types/brokerage";

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
      // Run scan-website and gemini-lookup in parallel
      const [signalResult, ledgerResult] = await Promise.allSettled([
        supabase.functions.invoke("scan-website", { body: { url } }),
        supabase.functions.invoke("gemini-lookup", { body: { url } }),
      ]);

      // scan-website is non-fatal
      let siteSignals: SiteSignals | null = null;
      if (signalResult.status === "fulfilled" && !signalResult.value.error && signalResult.value.data && !signalResult.value.data.error) {
        siteSignals = signalResult.value.data as SiteSignals;
      } else {
        console.warn("scan-website failed (non-fatal):", signalResult);
      }

      // gemini-lookup is required
      if (ledgerResult.status === "rejected") {
        throw new Error("Failed to fetch brokerage data");
      }
      const { data: ledgerData, error: ledgerError } = ledgerResult.value;
      if (ledgerError) throw new Error(ledgerError.message);
      if (!ledgerData || ledgerData.error) throw new Error(ledgerData?.error || "Scan failed");

      setScanResult({
        brokerage_name: ledgerData.brokerage_name,
        website_url: ledgerData.website_url || url,
        results: ledgerData.results,
        site_signals: siteSignals,
      });
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
          site_signals: editedResult.site_signals ?? undefined,
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
