import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ScanLoadingProps {
  label?: string;
}

export function ScanLoading({ label = "Scanning brokerage website…" }: ScanLoadingProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-4 text-center py-12">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <Progress value={undefined} className="h-2" />
    </div>
  );
}
