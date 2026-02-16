import { useState, useEffect } from "react";
import {
  DashboardHeader,
  KPICards,
  MarketVisibility,
  CompetitiveRankings,
  MissedOpportunities,
  PromptIntelligence,
  SourceAttribution,
  PropertyTypeBreakdown,
  BrokerTeamBreakdown,
  DashboardFooter,
} from "@/components/dashboard";
import {
  useBrokerageList,
  useCompetitiveRankings,
  useMissedMarketOpportunities,
  useUnderIndexSegments,
  usePromptIntelligence,
  useSourceAttribution,
  useSubmarketsForBrokerage,
  useBrokerTeamBreakdown,
  useOriginalBrokerageNames,
} from "@/hooks/useDashboardData";
import { useCREBootstrap } from "@/hooks/useCREBootstrap";
import type { Filters } from "@/types/dashboard";

export default function Dashboard() {
  const [selectedBrokerage, setSelectedBrokerage] = useState<string>("");
  const [brokerTeamPropertyFilter, setBrokerTeamPropertyFilter] = useState<string>("All");
  const [filters, setFilters] = useState<Filters>({
    market: "All",
    propertyType: "All",
    role: "All",
    brokerage: "",
  });

  // Brokerage list (fast, pre-aggregated view)
  const { data: brokerages = [], isLoading: loadingBrokerages } = useBrokerageList();

  // Auto-select first brokerage
  useEffect(() => {
    if (brokerages.length > 0 && !selectedBrokerage) {
      setSelectedBrokerage(brokerages[0].brokerage);
    }
  }, [brokerages, selectedBrokerage]);

  const marketFilter = filters.market !== "All" ? filters.market : undefined;

  // Tier 1: Single bootstrap RPC for filters + summary + market data + property types
  const { data: bootstrap, isLoading: loadingBootstrap } = useCREBootstrap(
    selectedBrokerage,
    marketFilter
  );

  // Extract bootstrap data
  const markets = bootstrap?.markets || [];
  const allSubmarkets = bootstrap?.submarkets || [];
  const propertyTypes = bootstrap?.propertyTypes || [];
  const roles = bootstrap?.roles || [];
  const summary = bootstrap?.summary;
  const marketData = bootstrap?.marketRankings || [];
  const propertyTypeData = bootstrap?.propertyTypeBreakdown || [];
  const primaryMarkets = bootstrap?.primaryMarkets || [];

  // Tier 1 ready flag
  const tier1Ready = !loadingBrokerages && !loadingBootstrap;

  // Tier 2: Below-the-fold (deferred until Tier 1 renders)
  const { data: competitors = [], isLoading: loadingCompetitors } = useCompetitiveRankings(
    selectedBrokerage,
    marketFilter,
    tier1Ready
  );

  const { data: missedMarkets = [], isLoading: loadingMissedMarkets } = useMissedMarketOpportunities(
    selectedBrokerage,
    tier1Ready
  );

  const { data: underIndexed = [], isLoading: loadingUnderIndexed } = useUnderIndexSegments(
    selectedBrokerage,
    tier1Ready
  );

  const { data: prompts = [], isLoading: loadingPrompts } = usePromptIntelligence({
    brokerage: selectedBrokerage || undefined,
    market: marketFilter,
    propertyType: filters.propertyType !== "All" ? filters.propertyType : undefined,
    brokerRole: filters.role !== "All" ? filters.role : undefined,
    fetchAll: true,
    enabled: tier1Ready,
  });

  const { data: sourceData = [], isLoading: loadingSource } = useSourceAttribution(
    selectedBrokerage,
    tier1Ready
  );

  const { data: submarkets = [], isLoading: loadingSubmarkets } = useSubmarketsForBrokerage(
    selectedBrokerage,
    tier1Ready
  );

  const brokerTeamPropertyTypeFilter = brokerTeamPropertyFilter !== "All" ? brokerTeamPropertyFilter : undefined;

  const { data: brokerTeamData = [], isLoading: loadingBrokerTeam } = useBrokerTeamBreakdown(
    selectedBrokerage, marketFilter, brokerTeamPropertyTypeFilter, tier1Ready
  );

  const { data: originalNames = [] } = useOriginalBrokerageNames(selectedBrokerage, tier1Ready);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loadingBrokerages) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with brokerage selector and filters */}
      <DashboardHeader
        selectedBrokerage={selectedBrokerage}
        brokerages={brokerages}
        markets={markets}
        propertyTypes={propertyTypes}
        roles={roles}
        filters={filters}
        onBrokerageChange={setSelectedBrokerage}
        onFilterChange={handleFilterChange}
        originalNames={originalNames}
      />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section 2: Executive Overview - KPI Cards */}
        <section>
          <KPICards
            summary={summary}
            isLoading={loadingBootstrap}
            primaryMarkets={primaryMarkets}
            primaryMarketsLoading={loadingBootstrap}
            submarkets={submarkets}
            submarketsLoading={loadingSubmarkets}
            totalTrackedMarkets={markets.length}
            totalTrackedSubmarkets={allSubmarkets.length}
            totalBrokerages={brokerages.length}
            missedMarkets={missedMarkets}
            missedMarketsLoading={loadingMissedMarkets}
          />
        </section>

        {/* Section 3: Market Visibility & Property Types */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarketVisibility data={marketData} isLoading={loadingBootstrap} />
          <PropertyTypeBreakdown data={propertyTypeData} isLoading={loadingBootstrap} selectedMarket={marketFilter} />
        </section>

        {/* Section 5: Competitive Rankings */}
        <section>
          <CompetitiveRankings competitors={competitors} isLoading={loadingCompetitors} />
        </section>

        {/* Section 6: Missed Opportunities */}
        <section>
          <MissedOpportunities
            gapMarkets={missedMarkets}
            sourceData={sourceData}
            isLoadingMarkets={loadingMissedMarkets}
            isLoadingSource={loadingSource}
          />
        </section>

        {/* Section 8 & 9: Prompt Intelligence */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PromptIntelligence prompts={prompts} isLoading={loadingPrompts} />
          <div className="flex items-stretch">
            <DashboardFooter />
          </div>
        </section>

        {/* Section 10: Brokerage Team Breakdown */}
        <section>
          <BrokerTeamBreakdown
            data={brokerTeamData}
            isLoading={loadingBrokerTeam}
            selectedMarket={marketFilter}
            propertyTypes={propertyTypes}
            selectedPropertyType={brokerTeamPropertyFilter}
            onPropertyTypeChange={setBrokerTeamPropertyFilter}
          />
        </section>
      </main>
    </div>
  );
}
