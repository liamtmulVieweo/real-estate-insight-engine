import { useState } from "react";
import { Pencil, Check, X, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScanResult, LedgerItem } from "@/types/brokerage";

interface LedgerEditorProps {
  scanResult: ScanResult;
  onSave: (result: ScanResult) => void;
  isAnalyzing: boolean;
}

export function LedgerEditor({ scanResult, onSave, isAnalyzing }: LedgerEditorProps) {
  const [items, setItems] = useState<LedgerItem[]>(scanResult.results);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (item: LedgerItem) => {
    setEditingKey(item.key);
    setEditValue(item.answer);
  };

  const saveEdit = () => {
    setItems((prev) =>
      prev.map((item) => (item.key === editingKey ? { ...item, answer: editValue } : item))
    );
    setEditingKey(null);
  };

  const cancelEdit = () => setEditingKey(null);

  const handleSaveMapping = () => {
    onSave({ ...scanResult, results: items });
  };

  const isEmpty = (answer: string) => !answer || answer === "Not found" || answer === "N/A";

  return (
    <Card className="border">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-medium">{scanResult.brokerage_name}</CardTitle>
            <a
              href={scanResult.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
            >
              {scanResult.website_url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-3 p-3 rounded-md border ${
              isEmpty(item.answer) ? "border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20" : "border-border"
            }`}
          >
            <span className="text-sm font-medium min-w-[140px] shrink-0">{item.label}</span>
            {editingKey === item.key ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-8 text-sm flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveEdit}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className={`text-sm flex-1 ${isEmpty(item.answer) ? "text-yellow-600 dark:text-yellow-400 italic" : "text-muted-foreground"}`}>
                  {isEmpty(item.answer) ? "Not found" : item.answer}
                </span>
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => startEdit(item)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
        <div className="pt-4">
          <Button onClick={handleSaveMapping} disabled={isAnalyzing} className="w-full gap-2">
            {isAnalyzing ? "Analyzing…" : "Run Analysis"}
            {!isAnalyzing && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
