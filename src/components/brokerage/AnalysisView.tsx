import type { AnalysisResult } from "@/types/brokerage";
import { OverallScore } from "./analysis/OverallScore";
import { RecommendedActions } from "./analysis/RecommendedActions";
import { PromptCoverageSection } from "./analysis/PromptCoverageSection";
import { MarketOpportunitySection } from "./analysis/MarketOpportunitySection";
import { SummarySection } from "./analysis/SummarySection";
import { HyperspecificInstructions } from "./analysis/HyperspecificInstructions";
import { IntentMonitoring } from "./analysis/IntentMonitoring";

interface AnalysisViewProps {
  analysis: AnalysisResult;
}

export function AnalysisView({ analysis }: AnalysisViewProps) {
  if (!analysis || typeof analysis.overall_score !== "number") {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Analysis data is incomplete. Please try running the analysis again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <OverallScore score={analysis.overall_score} saltScores={analysis.salt_scores || []} />

      <hr className="border-border" />

      <RecommendedActions actions={analysis.recommended_actions || []} />

      <hr className="border-border" />

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold">Visibility Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed breakdown of your AI visibility across different dimensions
          </p>
        </div>
        {analysis.prompt_coverage && <PromptCoverageSection coverage={analysis.prompt_coverage} />}
        {analysis.market_opportunity && <MarketOpportunitySection opportunity={analysis.market_opportunity} />}
        {analysis.analysis_summary && <SummarySection summary={analysis.summary} analysisSummary={analysis.analysis_summary} />}
      </div>

      <hr className="border-border" />

      <HyperspecificInstructions instructions={analysis.hyperspecific_instructions || []} />

      <hr className="border-border" />

      <IntentMonitoring intents={analysis.intent_coverage || []} />
    </div>
  );
}
