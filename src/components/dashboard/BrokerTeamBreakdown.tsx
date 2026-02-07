import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users } from "lucide-react";

interface BrokerTeamData {
  broker_name: string;
  property_types: string[];
  mentions: number;
  global_rank: number;
  total_brokers: number;
}

interface BrokerTeamBreakdownProps {
  data: BrokerTeamData[];
  isLoading: boolean;
  selectedMarket?: string;
  propertyTypes: string[];
  selectedPropertyType?: string;
  onPropertyTypeChange: (value: string) => void;
}

export function BrokerTeamBreakdown({ 
  data, 
  isLoading, 
  selectedMarket,
  propertyTypes,
  selectedPropertyType,
  onPropertyTypeChange,
}: BrokerTeamBreakdownProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter(
    (d) =>
      d.broker_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.property_types || []).some((pt) => pt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Brokerage Team Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Brokerage Team Breakdown
          </CardTitle>
          <CardDescription className="flex items-center gap-2 flex-wrap mt-1">
            Individual broker visibility
            {selectedMarket && (
              <Badge variant="secondary" className="text-xs">
                {selectedMarket}
              </Badge>
            )}
            {selectedPropertyType && selectedPropertyType !== "All" && (
              <Badge variant="outline" className="text-xs">
                {selectedPropertyType}
              </Badge>
            )}
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPropertyType || "All"} onValueChange={onPropertyTypeChange}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Property Types</SelectItem>
              {propertyTypes.map((pt) => (
                <SelectItem key={pt} value={pt}>
                  {pt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search brokers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {data.length === 0
              ? "No broker data available for this brokerage"
              : "No results match your search"}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Broker</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Property Types</th>
                  <th className="text-right py-3 px-3 font-medium text-muted-foreground">Mentions</th>
                  <th className="text-right py-3 px-3 font-medium text-muted-foreground">Global Rank</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr
                    key={`${row.broker_name}-${index}`}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    <td className="py-3 px-3 font-medium">{row.broker_name}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {(row.property_types || []).map((pt) => (
                          <Badge key={pt} variant="outline" className="font-normal text-xs">
                            {pt}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-medium">
                      {row.mentions.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                            row.global_rank <= 3
                              ? "bg-amber-100 text-amber-700"
                              : row.global_rank <= 10
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {row.global_rank}
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          of {(row.total_brokers || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data.length > 0 && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Showing {filteredData.length} of {data.length} brokers
          </p>
        )}
      </CardContent>
    </Card>
  );
}
