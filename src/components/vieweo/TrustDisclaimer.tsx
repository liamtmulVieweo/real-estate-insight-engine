import { AlertCircle, Check } from 'lucide-react';

export function TrustDisclaimer() {
  return (
    <section className="py-10 md:py-12 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-accent/30 border border-accent rounded-2xl p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                What This Measures
              </h3>
              <div className="space-y-3">
                <p className="flex items-start gap-3 text-muted-foreground">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    This is <strong className="text-foreground">not</strong> a ranking of performance, deal volume, or revenue.
                  </span>
                </p>
                <p className="flex items-start gap-3 text-muted-foreground">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    Visibility metrics reflect current AI system outputs based on training data and are not an endorsement of any specific broker or brokerage.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
