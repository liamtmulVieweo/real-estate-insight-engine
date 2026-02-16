import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VieweoLogo } from '@/components/VieweoLogo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useVieweoData } from '@/hooks/useVieweoData';
import {
  GlobalFilters,
  MarketSummary,
  TopBrokerages,
  TopBrokers,
  PromptExplorer,
  RawDataTable,
  TrustDisclaimer,
  UpgradeBanner,
} from '@/components/vieweo';
import { DashboardLoadingScreen } from '@/components/ui/DashboardLoadingScreen';
import { SubscriptionModal } from '@/components/subscription';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, FileSearch, TableIcon, LogIn, LogOut, Database, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function VieweoDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('brokerages');

  const {
    filters,
    setFilters,
    markets,
    propertyTypes,
    brokerRoles,
    entityTypes,
    stats,
    allBrokerages,
    topBrokerages,
    allBrokers,
    topBrokers,
    brokersLoading,
    promptData,
    promptsLoading,
    rawData,
    rawDataLoading,
    isLoading,
  } = useVieweoData(activeTab);

  if (isLoading) {
    return (
      <DashboardLoadingScreen
        title="Vieweo Dashboard"
        steps={[
          "Connecting to database...",
          "Loading AI visibility data...",
          "Aggregating brokerage mentions...",
          "Analyzing broker rankings...",
          "Crunching 64,000+ records...",
          "Preparing visualizations...",
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <VieweoLogo className="h-10 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5">
                <Database className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  {stats.totalRecords.toLocaleString()} records
                </span>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/cre-dashboard')}>
                CRE Dashboard
              </Button>
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth?redirect=/vieweo')}
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
            {/* Mobile CTA */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={user ? signOut : () => navigate('/auth?redirect=/vieweo')}
              >
                {user ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Description */}
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            <span className="font-semibold text-foreground">Vieweo</span> measures how AI systems represent real estate professionals in discovery queries — revealing who AI trusts, who it omits, and where visibility gaps exist. This is not a ranking of performance or deals; it's an analysis of AI representation.
          </p>
        </div>

        {/* Upgrade Banner */}
        <UpgradeBanner onOpenSubscription={() => setIsSubscriptionModalOpen(true)} />

        {/* Global Filters */}
        <GlobalFilters
          filters={filters}
          setFilters={setFilters}
          markets={markets}
          propertyTypes={propertyTypes}
          brokerRoles={brokerRoles}
          entityTypes={entityTypes}
        />

        {/* Market Summary */}
        <MarketSummary stats={stats} />

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="brokerages" className="gap-2 data-[state=active]:bg-card">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Brokerages</span>
            </TabsTrigger>
            <TabsTrigger value="brokers" className="gap-2 data-[state=active]:bg-card">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Brokers</span>
            </TabsTrigger>
            <TabsTrigger value="prompts" className="gap-2 data-[state=active]:bg-card">
              <FileSearch className="h-4 w-4" />
              <span className="hidden sm:inline">Prompts</span>
            </TabsTrigger>
            <TabsTrigger value="raw" className="gap-2 data-[state=active]:bg-card">
              <TableIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Raw Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brokerages" className="mt-4">
            <TopBrokerages data={topBrokerages} allData={allBrokerages} />
          </TabsContent>

          <TabsContent value="brokers" className="mt-4">
            {brokersLoading ? (
              <div className="bg-card rounded-lg border border-border p-5 shadow-sm space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-[420px] w-full" />
              </div>
            ) : (
              <TopBrokers data={topBrokers} allData={allBrokers} />
            )}
          </TabsContent>

          <TabsContent value="prompts" className="mt-4">
            {promptsLoading ? (
              <div className="bg-card rounded-lg border border-border p-5 shadow-sm space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <PromptExplorer data={promptData} />
            )}
          </TabsContent>

          <TabsContent value="raw" className="mt-4">
            {rawDataLoading ? (
              <div className="bg-card rounded-lg border border-border p-5 shadow-sm space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-[400px] w-full" />
              </div>
            ) : (
              <RawDataTable data={rawData} />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Trust Disclaimer */}
      <TrustDisclaimer />

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 space-y-3">
          <p className="text-xs text-muted-foreground text-center">
            Data represents AI responses to commercial real estate discovery prompts. This measures AI visibility, not transaction volume or deal performance.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              to="/methodology"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <FileSearch className="h-4 w-4" />
              View Methodology
            </Link>
            <button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              CRE Dashboard →
            </button>
          </div>
        </div>
      </footer>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </div>
  );
}
