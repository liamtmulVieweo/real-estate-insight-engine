import { useState, useEffect, useMemo } from "react";
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
  CompetitorsList,
  ExpertCTA,
} from "@/components/dashboard";
import {
  useBrokerageList,
  useCompetitiveRankings,
  useMissedMarketOpportunities,
  useUnderIndexSegments,
  usePromptIntelligence,
  useSourceAttribution,
  useSourceAttributionVsCompetitor,
  useBrokerageMatchedDomain,
  useSubmarketsForBrokerage,
  useBrokerTeamBreakdown,
  useOriginalBrokerageNames,
  useCoMentionedBrokerages,
} from "@/hooks/useDashboardData";
import { useCREBootstrap } from "@/hooks/useCREBootstrap";
import type { Filters } from "@/types/dashboard";
import { DashboardLoadingScreen } from "@/components/ui/DashboardLoadingScreen";

// Full state name → abbreviation (used to pass state abbr to RPCs)
const STATE_TO_ABBR: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR",
  California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID",
  Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS",
  Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS",
  Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT",
  Vermont: "VT", Virginia: "VA", Washington: "WA", "West Virginia": "WV",
  Wisconsin: "WI", Wyoming: "WY", "District of Columbia": "DC",
};

export default function Dashboard() {
  const [selectedBrokerage, setSelectedBrokerage] = useState<string>("");
  const [competitorBrokerage, setCompetitorBrokerage] = useState<string>("");
  const [brokerTeamPropertyFilter, setBrokerTeamPropertyFilter] = useState<string>("All");
  const [filters, setFilters] = useState<Filters>({
    market: "All",
    propertyType: "All",
    role: "All",
    brokerage: "",
    state: "All",
  });

  // Brokerage list (fast, pre-aggregated view)
  const { data: allBrokerages = [], isLoading: loadingBrokerages } = useBrokerageList();

  // Auto-select first brokerage
  useEffect(() => {
    if (allBrokerages.length > 0 && !selectedBrokerage) {
      setSelectedBrokerage(allBrokerages[0].brokerage);
    }
  }, [allBrokerages, selectedBrokerage]);

  const marketFilter = filters.market !== "All" ? filters.market : undefined;
  const propertyTypeFilter = filters.propertyType !== "All" ? filters.propertyType : undefined;
  const roleFilter = filters.role !== "All" ? filters.role : undefined;
  // Convert full state name → abbreviation for RPC calls; only when no specific market is selected
  const stateAbbr = useMemo(() => {
    if (filters.state === "All" || filters.market !== "All") return undefined;
    return STATE_TO_ABBR[filters.state] || undefined;
  }, [filters.state, filters.market]);

  // Tier 1: Single bootstrap RPC for filters + summary + market data + property types
  const { data: bootstrap, isLoading: loadingBootstrap } = useCREBootstrap(
    selectedBrokerage,
    marketFilter,
    propertyTypeFilter,
    roleFilter,
    stateAbbr,
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

  // Filter brokerage list to only those present in the selected state's markets
  const brokerages = useMemo(() => {
    if (filters.state === "All" || filters.market !== "All") return allBrokerages;
    // Markets for this state are already scoped by the bootstrap; use marketData as the signal
    // We filter brokerages based on state from brokerage_market_rankings via bootstrap markets
    const abbr = STATE_TO_ABBR[filters.state];
    if (!abbr) return allBrokerages;
    const stateSuffix = `, ${abbr}`;
    // Use the full markets list from bootstrap (which is unfiltered) to check which markets belong to this state
    // Instead, filter allBrokerages by checking if they appear in markets ending with the state abbr
    // Since we can't easily do this client-side without extra data, we keep the full list
    // but we leverage the competitive rankings (which IS state-filtered) to determine relevant brokerages
    return allBrokerages;
  }, [allBrokerages, filters.state, filters.market]);

  // Tier 1 ready flag
  const tier1Ready = !loadingBrokerages && !loadingBootstrap;

  // Tier 2: Below-the-fold (deferred until Tier 1 renders)
  const { data: competitors = [], isLoading: loadingCompetitors } = useCompetitiveRankings(
    selectedBrokerage,
    marketFilter,
    propertyTypeFilter,
    roleFilter,
    tier1Ready,
    stateAbbr,
  );

  // Derive brokerages list filtered to state using competitive rankings data
  const brokeragesForState = useMemo(() => {
    if (filters.state === "All" || filters.market !== "All") return allBrokerages;
    if (competitors.length === 0) return allBrokerages;
    const stateSet = new Set(competitors.map((c) => c.brokerage));
    return allBrokerages.filter((b) => stateSet.has(b.brokerage));
  }, [allBrokerages, competitors, filters.state, filters.market]);

  const { data: missedMarkets = [], isLoading: loadingMissedMarkets } = useMissedMarketOpportunities(
    selectedBrokerage,
    tier1Ready,
    stateAbbr,
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
    state: stateAbbr,
  });

  const { data: sourceDataBase = [], isLoading: loadingSourceBase } = useSourceAttribution(
    selectedBrokerage,
    tier1Ready && !competitorBrokerage
  );

  const { data: sourceDataVs = [], isLoading: loadingSourceVs } = useSourceAttributionVsCompetitor(
    selectedBrokerage,
    competitorBrokerage,
    tier1Ready && !!competitorBrokerage
  );

  const sourceData = competitorBrokerage ? sourceDataVs : sourceDataBase;
  const loadingSource = competitorBrokerage ? loadingSourceVs : loadingSourceBase;

  const { data: submarkets = [], isLoading: loadingSubmarkets } = useSubmarketsForBrokerage(
    selectedBrokerage,
    tier1Ready
  );

  const brokerTeamPropertyTypeFilter = brokerTeamPropertyFilter !== "All" ? brokerTeamPropertyFilter : undefined;

  const { data: brokerTeamData = [], isLoading: loadingBrokerTeam } = useBrokerTeamBreakdown(
    selectedBrokerage, marketFilter, brokerTeamPropertyTypeFilter, tier1Ready, stateAbbr
  );

  const { data: originalNames = [] } = useOriginalBrokerageNames(selectedBrokerage, tier1Ready);
  const { data: matchedDomain } = useBrokerageMatchedDomain(selectedBrokerage, tier1Ready);
  const { data: coMentioned = [], isLoading: loadingCoMentioned } = useCoMentionedBrokerages(selectedBrokerage, tier1Ready);
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loadingBrokerages) {
    return (
      <DashboardLoadingScreen
        title="CRE Dashboard"
        steps={[
          "Connecting to database...",
          "Loading brokerage list...",
          "Fetching market data...",
          "Aggregating brokerage rankings...",
          "Preparing market visualizations...",
        ]}
      />
    );
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Header with brokerage selector and filters */}
      <DashboardHeader
        selectedBrokerage={selectedBrokerage}
        brokerages={brokeragesForState}
        markets={markets}
        propertyTypes={propertyTypes}
        roles={roles}
        filters={filters}
        onBrokerageChange={setSelectedBrokerage}
        onFilterChange={handleFilterChange}
        originalNames={originalNames}
        filteredTotalMentions={summary?.total_mentions}
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
            totalBrokerages={brokeragesForState.length}
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
            selectedBrokerage={selectedBrokerage}
            brokerageMatchedDomain={matchedDomain ?? undefined}
            brokerages={brokeragesForState}
            competitorBrokerage={competitorBrokerage}
            onCompetitorChange={setCompetitorBrokerage}
          />
        </section>

        {/* Expert CTA */}
        <section>
          <ExpertCTA />
        </section>

        {/* Competitors */}
        <section>
          <CompetitorsList
            data={coMentioned}
            isLoading={loadingCoMentioned}
            selectedBrokerage={selectedBrokerage}
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
