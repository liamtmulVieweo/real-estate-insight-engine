import { VieweoLogo } from '@/components/VieweoLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background">
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
        <h1 className="text-3xl font-bold mb-2">Terms of Use</h1>
        <p className="text-muted-foreground mb-8">Effective Date: [Insert Date]</p>

        <div className="space-y-10 text-foreground">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using or accessing Vieweo, you confirm your acceptance of these Terms of Use. If you disagree with any part of these terms, you must not use the Platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Our Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vieweo provides advanced analytics designed to help users measure and understand AI visibility across various generative systems.
            </p>
            <p className="text-muted-foreground leading-relaxed">Our core offerings include:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>AI visibility scoring and performance metrics.</li>
              <li>Insights into prompt effectiveness.</li>
              <li>Diagnostics for entity clarity.</li>
              <li>Analysis of extractability by AI models.</li>
              <li>Comprehensive, structured reports.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Note: Vieweo is a purely analytical platform. We have no control over external or third-party AI systems.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. No Performance Guarantees</h2>
            <p className="text-muted-foreground leading-relaxed">We make no promises or guarantees regarding:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Your inclusion in AI-generated responses.</li>
              <li>Improvements in search rankings.</li>
              <li>Specific financial or revenue outcomes.</li>
              <li>Any particular visibility result.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              AI systems are constantly changing and are operated independently by third parties, which are outside of our control.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Proprietary Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              All Vieweo methodologies, scoring algorithms, dashboards, and analytical frameworks are our exclusive property.
            </p>
            <p className="text-muted-foreground leading-relaxed">You are expressly prohibited from:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Attempting to reverse engineer the platform.</li>
              <li>Copying or replicating our scoring frameworks.</li>
              <li>Reselling our raw analytical outputs.</li>
              <li>Using data exported from the platform to build a competing system.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Appropriate Conduct</h2>
            <p className="text-muted-foreground leading-relaxed">You agree that you will not:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Use the platform for any illegal purpose.</li>
              <li>Attempt to gain unauthorized access to our systems.</li>
              <li>Scrape or automatically access the dashboard without our explicit permission.</li>
              <li>Take any action that interferes with the platform's performance or integrity.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Accounts and Payment</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Subscription plans are set to automatically renew unless you cancel them.</li>
              <li>All fees are non-refundable, except where required by applicable law.</li>
              <li>We reserve the right to suspend your access for non-payment of fees.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Suspension and Termination</h2>
            <p className="text-muted-foreground leading-relaxed">We may suspend or permanently terminate your access to Vieweo if:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>You breach any of these Terms.</li>
              <li>We detect platform misuse.</li>
              <li>A security risk to our systems or other users arises.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">To the fullest extent permitted by law, Vieweo is not responsible for:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Any business losses you incur.</li>
              <li>Indirect or consequential damages.</li>
              <li>Outcomes resulting from decisions you make based on AI outputs.</li>
              <li>The behavior or changes of external AI systems.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">Your use of the platform is undertaken entirely at your own risk.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">9. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">These Terms will be governed by the laws of: [Insert State / Country]</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">10. Amendments</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may revise and update these Terms at any time. Your continued use of the platform constitutes your acceptance of the updated terms.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/methodology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Methodology</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
