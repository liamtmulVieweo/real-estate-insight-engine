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
  useDashboardSummary,
  useCompetitiveRankings,
  useMissedMarketOpportunities,
  useUnderIndexSegments,
  usePromptIntelligence,
  useSourceAttribution,
  useMarketRankings,
  useDistinctMarkets,
  useDistinctSubmarkets,
  useDistinctPropertyTypes,
  useDistinctRoles,
  useSubmarketsForBrokerage,
  usePrimaryMarketsForBrokerage,
  usePropertyTypeBreakdown,
  useBrokerTeamBreakdown,
} from "@/hooks/useDashboardData";
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

  // Fetch filter options
  const { data: brokerages = [], isLoading: loadingBrokerages } = useBrokerageList();
  const { data: markets = [] } = useDistinctMarkets();
  const { data: allSubmarkets = [] } = useDistinctSubmarkets();
  const { data: propertyTypes = [] } = useDistinctPropertyTypes();
  const { data: roles = [] } = useDistinctRoles();

  // Auto-select first brokerage
  useEffect(() => {
    if (brokerages.length > 0 && !selectedBrokerage) {
      setSelectedBrokerage(brokerages[0].brokerage);
    }
  }, [brokerages, selectedBrokerage]);

  // Fetch dashboard data for selected brokerage
  const marketFilter = filters.market !== "All" ? filters.market : undefined;
  
  const { data: summary, isLoading: loadingSummary } = useDashboardSummary(
    selectedBrokerage,
    marketFilter
  );
  
  const { data: competitors = [], isLoading: loadingCompetitors } = useCompetitiveRankings(
    selectedBrokerage,
    marketFilter
  );
  
  const { data: missedMarkets = [], isLoading: loadingMissedMarkets } = useMissedMarketOpportunities(
    selectedBrokerage
  );
  
  const { data: underIndexed = [], isLoading: loadingUnderIndexed } = useUnderIndexSegments(
    selectedBrokerage
  );
  
  const { data: prompts = [], isLoading: loadingPrompts } = usePromptIntelligence({
    brokerage: selectedBrokerage || undefined,
    market: marketFilter,
    propertyType: filters.propertyType !== "All" ? filters.propertyType : undefined,
    brokerRole: filters.role !== "All" ? filters.role : undefined,
    fetchAll: true,
  });
  
  const { data: sourceData = [], isLoading: loadingSource } = useSourceAttribution(
    selectedBrokerage
  );
  
  const { data: marketData = [], isLoading: loadingMarkets } = useMarketRankings(
    selectedBrokerage
  );
  
  const { data: submarkets = [], isLoading: loadingSubmarkets } = useSubmarketsForBrokerage(
    selectedBrokerage
  );
  
  const { data: primaryMarkets = [], isLoading: loadingPrimaryMarkets } = usePrimaryMarketsForBrokerage(
    selectedBrokerage
  );
  
  const { data: propertyTypeData = [], isLoading: loadingPropertyTypes } = usePropertyTypeBreakdown(
    selectedBrokerage,
    marketFilter
  );

  const brokerTeamPropertyTypeFilter = brokerTeamPropertyFilter !== "All" ? brokerTeamPropertyFilter : undefined;
  
  const { data: brokerTeamData = [], isLoading: loadingBrokerTeam } = useBrokerTeamBreakdown(
    selectedBrokerage,
    marketFilter,
    brokerTeamPropertyTypeFilter
  );

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
      />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section 2: Executive Overview - KPI Cards */}
        <section>
          <KPICards 
            summary={summary} 
            isLoading={loadingSummary} 
            primaryMarkets={primaryMarkets}
            primaryMarketsLoading={loadingPrimaryMarkets}
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
          <MarketVisibility data={marketData} isLoading={loadingMarkets} />
          <PropertyTypeBreakdown data={propertyTypeData} isLoading={loadingPropertyTypes} selectedMarket={marketFilter} />
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
          
          {/* Additional insights panel */}
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
