import { VieweoLogo } from '@/components/VieweoLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Methodology() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <VieweoLogo className="h-10 w-auto" />
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link to="/" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Methodology</h1>

        <div className="space-y-10 text-foreground">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Purpose of This Analysis</h2>
            <p className="text-muted-foreground leading-relaxed">
              This analysis measures how AI systems represent commercial real estate professionals in discovery queries. 
              It reveals who AI trusts, who it omits, and where visibility gaps exist. This is not a ranking of 
              performance, deal volume, or revenue — it's an analysis of AI representation.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Data Collection</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect responses from leading AI models to tens of thousands of CRE-specific discovery prompts. 
              These prompts simulate real buyer and seller intent, such as "Who should I contact to lease office 
              space in downtown Chicago?" or "What are the top industrial brokerages in Dallas?"
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Entity Extraction</h2>
            <p className="text-muted-foreground leading-relaxed">
              From each AI response, we extract named entities — individual brokers and brokerages. We categorize 
              these mentions by market, property type, and broker role to understand visibility patterns across 
              different segments.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Analysis Dimensions</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong className="text-foreground">By Market:</strong> Geographic visibility across MSAs and submarkets</li>
              <li><strong className="text-foreground">By Property Type:</strong> Asset class expertise perception (Office, Retail, Industrial, etc.)</li>
              <li><strong className="text-foreground">By Role:</strong> Professional focus visibility (Tenant Rep, Landlord Rep, Investment Sales, etc.)</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Limitations</h2>
            <p className="text-muted-foreground leading-relaxed">
              Visibility metrics reflect current AI system outputs based on training data. AI responses can change 
              over time as models are updated. This analysis is not an endorsement of any specific broker or 
              brokerage and should not be used as the sole basis for business decisions.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. Updates</h2>
            <p className="text-muted-foreground leading-relaxed">
              We continuously update our data to reflect the latest AI model outputs. The dashboard displays 
              the most recent analysis available at any given time.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/vieweo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Vieweo Dashboard
            </Link>
            <Link to="/cre-dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              CRE Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
