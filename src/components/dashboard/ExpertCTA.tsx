import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export function ExpertCTA() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-6 text-center space-y-3">
        <MessageSquare className="h-8 w-8 text-primary mx-auto" />
        <h3 className="text-lg font-semibold">Need help interpreting these insights?</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Our AI visibility experts can help you understand your firm's competitive position
          and develop strategies to improve your rankings across key markets and roles.
        </p>
        <Button variant="default" className="mt-2" asChild>
          <a href="/subscription">Talk to an Expert</a>
        </Button>
      </CardContent>
    </Card>
  );
}
