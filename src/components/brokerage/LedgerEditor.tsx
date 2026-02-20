import { useState } from "react";
import { Pencil, Check, X, ArrowRight, ExternalLink, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScanResult, LedgerItem } from "@/types/brokerage";
import { PropertyTypeSelector } from "./PropertyTypeSelector";

interface LedgerEditorProps {
  scanResult: ScanResult;
  onSave: (result: ScanResult) => void;
  isAnalyzing: boolean;
}

const SECTIONS = [
  {
    title: "Identity",
    keys: ["brokerage_name", "aliases", "legal_suffix"],
  },
  {
    title: "Operations",
    keys: ["markets_served", "services", "headquarters", "year_founded", "team_size"],
  },
  {
    title: "Social Profiles",
    keys: ["social_instagram", "social_facebook", "social_youtube", "social_linkedin", "social_gbp"],
  },
  {
    title: "Other",
    keys: ["website_description"],
  },
];

const SOCIAL_KEYS = new Set(["social_instagram", "social_facebook", "social_youtube", "social_linkedin", "social_gbp"]);

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export function LedgerEditor({ scanResult, onSave, isAnalyzing }: LedgerEditorProps) {
  const [items, setItems] = useState<LedgerItem[]>(scanResult.results);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Initialize property type selections from existing ledger item
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<Record<string, string[]>>(() => {
    const ptItem = scanResult.results.find((i) => i.key === "property_types");
    if (!ptItem || !ptItem.answer || ptItem.answer === "Not found" || ptItem.answer === "N/A") return {};
    const result: Record<string, string[]> = {};
    // Parse "Office (Class A, Medical Office), Industrial (Warehouse/Distribution)" format
    const parts = ptItem.answer.split(/\),?\s*/).filter(Boolean);
    for (const part of parts) {
      const match = part.match(/^([^(]+?)(?:\s*\((.+))?$/);
      if (match) {
        const type = match[1].trim();
        const subs = match[2] ? match[2].split(",").map((s) => s.trim()).filter(Boolean) : [];
        result[type] = subs;
      }
    }
    return result;
  });

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
    // Serialize property type selections into the property_types ledger item
    const serialized = Object.entries(selectedPropertyTypes)
      .filter(([, subs]) => true) // keep all selected types even without subtypes
      .map(([type, subs]) => subs.length > 0 ? `${type} (${subs.join(", ")})` : type)
      .join(", ");

    const updatedItems = items.map((item) =>
      item.key === "property_types" ? { ...item, answer: serialized || "Not found" } : item
    );
    // If no property_types item exists, add one
    const hasItem = updatedItems.some((i) => i.key === "property_types");
    const finalItems = hasItem
      ? updatedItems
      : [...updatedItems, { key: "property_types", label: "Property Types", answer: serialized || "Not found" }];

    onSave({ ...scanResult, results: finalItems });
  };

  const isEmpty = (answer: string) => !answer || answer === "Not found" || answer === "N/A";

  const itemMap = new Map(items.map((item) => [item.key, item]));

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
      <CardContent className="space-y-6">
        {SECTIONS.map((section, idx) => {
          const sectionItems = section.keys
            .map((key) => itemMap.get(key))
            .filter(Boolean) as LedgerItem[];

          if (sectionItems.length === 0) return null;

          return (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-2">
                {sectionItems.map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-center gap-3 p-3 rounded-md border ${
                      isEmpty(item.answer) ? "border-status-warning bg-status-warning/5" : "border-border"
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
                        {SOCIAL_KEYS.has(item.key) && !isEmpty(item.answer) && isUrl(item.answer) ? (
                          <a
                            href={item.answer}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm flex-1 text-primary hover:underline inline-flex items-center gap-1 truncate"
                          >
                            <Link className="h-3 w-3 shrink-0" />
                            <span className="truncate">{item.answer}</span>
                          </a>
                        ) : (
                          <span className={`text-sm flex-1 ${isEmpty(item.answer) ? "text-status-warning italic" : "text-muted-foreground"}`}>
                            {isEmpty(item.answer) ? "Not found" : item.answer}
                          </span>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => startEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Insert Property Types section after Operations */}
              {section.title === "Operations" && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Property Types
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Select the property types you work with. Check a type to reveal its subtypes.
                  </p>
                  <PropertyTypeSelector
                    selectedTypes={selectedPropertyTypes}
                    onChange={setSelectedPropertyTypes}
                  />
                </div>
              )}
            </div>
          );
        })}
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
