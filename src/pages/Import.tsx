import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trash2 } from "lucide-react";

type TableName = "lovable_prompts" | "lovable_entities" | "lovable_domains" | "visibility_records";

const Import = () => {
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const clearTable = async (table: TableName) => {
    if (!confirm(`Are you sure you want to delete ALL data from ${table}? This cannot be undone.`)) {
      return;
    }
    
    setIsLoading(true);
    setProgress(50);
    setStatus(`Clearing ${table}...`);

    try {
      const { error } = await supabase.functions.invoke("import-csv", {
        body: { table, action: "clear" },
      });

      setProgress(100);
      if (error) {
        setStatus(`Error: ${error.message}`);
      } else {
        setStatus(`Successfully cleared all data from ${table}`);
      }
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const importFromFile = async (table: TableName, filePath: string) => {
    setIsLoading(true);
    setProgress(10);
    setStatus(`Fetching ${filePath}...`);

    try {
      const response = await fetch(filePath);
      const csvData = await response.text();
      
      setProgress(30);
      setStatus(`Uploading ${table} (${csvData.split('\n').length - 1} rows)...`);

      const result = await supabase.functions.invoke("import-csv", {
        body: { table, csvData },
      });

      setProgress(100);
      if (result.error) {
        setStatus(`Error: ${result.error.message}`);
      } else {
        setStatus(`Success! Inserted ${result.data.inserted} rows into ${table}`);
      }
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const importFromUpload = async (table: TableName, file: File) => {
    setIsLoading(true);
    setProgress(10);
    setStatus(`Reading ${file.name}...`);

    try {
      const csvText = await file.text();
      const lines = csvText.split('\n');
      const header = lines[0];
      const dataLines = lines.slice(1).filter(l => l.trim().length > 0);
      
      const chunkSize = 500; // rows per request
      const totalChunks = Math.ceil(dataLines.length / chunkSize);
      let totalInserted = 0;
      let totalSkipped = 0;
      const allErrors: string[] = [];

      setStatus(`Uploading ${table} (${dataLines.length} rows in ${totalChunks} chunks)...`);

      for (let i = 0; i < totalChunks; i++) {
        const chunkLines = dataLines.slice(i * chunkSize, (i + 1) * chunkSize);
        const chunkCsv = [header, ...chunkLines].join('\n');

        const result = await supabase.functions.invoke("import-csv", {
          body: { table, csvData: chunkCsv },
        });

        if (result.error) {
          allErrors.push(`Chunk ${i + 1}: ${result.error.message}`);
        } else {
          const data = result.data as { inserted: number; skippedMissingPrompt?: number; errors?: string[] };
          totalInserted += data.inserted || 0;
          totalSkipped += data.skippedMissingPrompt || 0;
          if (data.errors) {
            allErrors.push(...data.errors.map(e => `Chunk ${i + 1}: ${e}`));
          }
        }

        const pct = Math.round(((i + 1) / totalChunks) * 90) + 10;
        setProgress(pct);
        setStatus(`Chunk ${i + 1}/${totalChunks} complete (${totalInserted} inserted so far)...`);
      }

      setProgress(100);
      setStatus(
        `Success! Inserted ${totalInserted} rows into ${table}` +
        (totalSkipped > 0 ? ` (skipped ${totalSkipped} rows missing prompts)` : "") +
        (allErrors.length > 0 ? ` (${allErrors.length} errors)` : "")
      );
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (table: TableName) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFromUpload(table, file);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">CSV Data Import</h1>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Import lovable_prompts</CardTitle>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => clearTable("lovable_prompts")}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">⚠️ Clearing prompts will also clear entities and domains (foreign keys)</p>
            <Button 
              onClick={() => importFromFile("lovable_prompts", "/data/lovable_prompts.csv")}
              disabled={isLoading}
            >
              Import from /data/lovable_prompts.csv
            </Button>
            <div>
              <label className="block text-sm font-medium mb-2">Or upload CSV file:</label>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload("lovable_prompts")}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Import lovable_entities</CardTitle>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => clearTable("lovable_entities")}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <label className="block text-sm font-medium mb-2">Upload CSV file:</label>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload("lovable_entities")}
              disabled={isLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Import lovable_domains</CardTitle>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => clearTable("lovable_domains")}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <label className="block text-sm font-medium mb-2">Upload CSV file:</label>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload("lovable_domains")}
              disabled={isLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Import visibility_records</CardTitle>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => clearTable("visibility_records")}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Expected columns: entity_key, entity_type, name, market, property_type, broker_role, prompt, brokerage, evidence, entity_display, market_role, market_asset
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">Upload CSV file:</label>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload("visibility_records")}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {(status || isLoading) && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              {isLoading && <Progress value={progress} />}
              <p className="text-sm">{status}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Import;
