import { useState } from "react";
import { Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ScanFormProps {
  onScan: (url: string) => void;
  isLoading: boolean;
}

export function ScanForm({ onScan, isLoading }: ScanFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onScan(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-brokerage.com"
          className="pl-10 h-12 text-base"
          required
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading || !url.trim()} className="w-full h-11 text-base gap-2">
        <Search className="h-4 w-4" />
        {isLoading ? "Scanning…" : "Scan Brokerage"}
      </Button>
    </form>
  );
}
