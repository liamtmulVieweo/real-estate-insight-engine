import { Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "@/components/brokerage/ScanForm";
import { ScanLoading } from "@/components/brokerage/ScanLoading";
import { LedgerEditor } from "@/components/brokerage/LedgerEditor";
import { AnalysisView } from "@/components/brokerage/AnalysisView";
import { useBrokerageScan } from "@/hooks/useBrokerageScan";

const AIVisibility = () => {
  const { scanResult, analysisResult, isScanning, isAnalyzing, error, scan, analyze } = useBrokerageScan();

  const activeTab = analysisResult ? "analysis" : scanResult ? "ledger" : "overview";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">AI Visibility Dashboard</h1>
        </div>

        <Tabs value={activeTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ledger">Ledger</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-xl font-semibold">Check your AI visibility</h2>
              <p className="text-muted-foreground">
                Discover how AI assistants see and recommend your brokerage. Get actionable fixes to improve your visibility.
              </p>
            </div>
            {isScanning ? (
              <ScanLoading />
            ) : (
              <ScanForm onScan={scan} isLoading={isScanning} />
            )}
            {error && (
              <p className="text-destructive text-center mt-4">{error}</p>
            )}
          </TabsContent>

          <TabsContent value="ledger">
            {scanResult && (
              <LedgerEditor scanResult={scanResult} onSave={analyze} isAnalyzing={isAnalyzing} />
            )}
            {isAnalyzing && <ScanLoading label="Running AI analysis…" />}
            {error && <p className="text-destructive text-center mt-4">{error}</p>}
          </TabsContent>

          <TabsContent value="analysis">
            {analysisResult && <AnalysisView analysis={analysisResult} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIVisibility;
