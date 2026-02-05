import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trash2 } from "lucide-react";

type TableName = "lovable_prompts" | "lovable_entities" | "lovable_domains";

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
      const csvData = await file.text();
      
      setProgress(30);
      setStatus(`Uploading ${table} (${csvData.split('\n').length - 1} rows)...`);

      const result = await supabase.functions.invoke("import-csv", {
        body: { table, csvData },
      });

      setProgress(100);
      if (result.error) {
        setStatus(`Error: ${result.error.message}`);
      } else {
        const data = result.data as { inserted: number; errors?: string[] };
        setStatus(
          `Success! Inserted ${data.inserted} rows into ${table}` +
          (data.errors ? ` (${data.errors.length} batch errors)` : "")
        );
      }
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
          <CardHeader>
            <CardTitle>Import lovable_prompts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
