import { Building2, Factory, ShoppingBag, Home, Hotel, Mountain } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const PROPERTY_TYPES = [
  {
    type: "Office",
    icon: Building2,
    subtypes: ["Class A", "Class B", "Creative/Flex", "Medical Office", "Co-Working/Flex", "Government/GSA"],
  },
  {
    type: "Industrial",
    icon: Factory,
    subtypes: ["Warehouse/Distribution", "Manufacturing", "Cold Storage", "Data Center", "Flex/R&D", "Last-Mile Logistics"],
  },
  {
    type: "Retail",
    icon: ShoppingBag,
    subtypes: ["Strip Center", "Power Center", "Regional Mall", "Single-Tenant NNN", "Restaurant/QSR", "Mixed-Use Retail"],
  },
  {
    type: "Multifamily",
    icon: Home,
    subtypes: ["Garden Style", "Mid-Rise", "High-Rise", "Student Housing", "Senior/55+", "Affordable/LIHTC"],
  },
  {
    type: "Hospitality",
    icon: Hotel,
    subtypes: ["Full-Service Hotel", "Select-Service", "Extended Stay", "Resort", "Boutique/Lifestyle"],
  },
  {
    type: "Land/Development",
    icon: Mountain,
    subtypes: ["Entitled Land", "Raw Land", "Infill/Redevelopment", "Master-Planned", "Special Purpose"],
  },
];

interface PropertyTypeSelectorProps {
  selectedTypes: Record<string, string[]>;
  onChange: (selected: Record<string, string[]>) => void;
}

export function PropertyTypeSelector({ selectedTypes, onChange }: PropertyTypeSelectorProps) {
  const isTypeSelected = (type: string) => type in selectedTypes;

  const toggleType = (type: string) => {
    const next = { ...selectedTypes };
    if (type in next) {
      delete next[type];
    } else {
      next[type] = [];
    }
    onChange(next);
  };

  const toggleSubtype = (type: string, subtype: string) => {
    const current = selectedTypes[type] || [];
    const next = current.includes(subtype)
      ? current.filter((s) => s !== subtype)
      : [...current, subtype];
    onChange({ ...selectedTypes, [type]: next });
  };

  // Group into rows of 3 so subtype panel appears below the correct row
  const rows: (typeof PROPERTY_TYPES)[] = [];
  for (let i = 0; i < PROPERTY_TYPES.length; i += 3) {
    rows.push(PROPERTY_TYPES.slice(i, i + 3));
  }

  return (
    <div className="space-y-2">
      {rows.map((row, rowIdx) => {
        const activeInRow = row.find((pt) => isTypeSelected(pt.type));
        return (
          <div key={rowIdx}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {row.map((pt) => {
                const Icon = pt.icon;
                const active = isTypeSelected(pt.type);
                const subtypeCount = selectedTypes[pt.type]?.length || 0;
                return (
                  <button
                    key={pt.type}
                    type="button"
                    onClick={() => toggleType(pt.type)}
                    className={`relative p-4 rounded-lg border-2 text-left transition-all cursor-pointer select-none hover:-translate-y-0.5 hover:shadow-sm ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Checkbox
                      checked={active}
                      className="absolute top-3 right-3"
                      tabIndex={-1}
                      onCheckedChange={() => toggleType(pt.type)}
                    />
                    <Icon className="h-6 w-6 mb-2 text-muted-foreground" />
                    <div className="text-sm font-semibold text-foreground pr-7">{pt.type}</div>
                    {active && subtypeCount > 0 && (
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {subtypeCount} subtype{subtypeCount !== 1 ? "s" : ""}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {activeInRow && (
              <div className="mt-1 mb-3 p-4 bg-muted rounded-lg border-l-[3px] border-primary animate-in fade-in slide-in-from-top-1 duration-200">
                <h4 className="text-xs font-semibold text-foreground mb-3">
                  {activeInRow.type} Subtypes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(185px,1fr))] gap-1.5">
                  {activeInRow.subtypes.map((sub) => {
                    const checked = selectedTypes[activeInRow.type]?.includes(sub) || false;
                    return (
                      <label
                        key={sub}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md border-2 cursor-pointer transition-all select-none ${
                          checked
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:border-muted-foreground"
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleSubtype(activeInRow.type, sub)}
                        />
                        <span className="text-[13px] text-muted-foreground">{sub}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
