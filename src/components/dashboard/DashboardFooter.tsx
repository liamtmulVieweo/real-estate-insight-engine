import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardFooter() {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-border rounded-xl p-8 text-center">
      <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
        <HelpCircle className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Need help interpreting these insights?
      </h3>
      <p className="text-muted-foreground max-w-xl mx-auto mb-6">
        Our AI visibility experts can help you understand your firm's competitive 
        position and develop strategies to improve your rankings across key markets and roles.
      </p>
      <Button size="lg">
        Talk to an Expert
      </Button>
    </div>
  );
}
