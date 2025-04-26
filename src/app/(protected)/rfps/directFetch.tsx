"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "../../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";

// Sample data to always show
const SAMPLE_DATA = [
  { id: 999, name: "Sample RFP 1", status: "Demo" },
  { id: 998, name: "Sample RFP 2", status: "Demo" }
];

export function DirectFetch() {
  const [data, setData] = useState<any[]>(SAMPLE_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchTime, setFetchTime] = useState<string>(new Date().toLocaleTimeString());
  
  // Create a memoized supabase client to avoid recreating it on each render
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching RFPs data from client...');
      
      // Try to fetch RFPs from database
      const { data: rfps, error: rfpsError } = await supabase
        .from('rfps')
        .select('*')
        .order('id', { ascending: false })
        .limit(10);
      
      if (rfpsError) {
        throw rfpsError;
      }
      
      // Update state with fetched data
      if (rfps && rfps.length > 0) {
        setData(rfps);
      } else {
        // If no data found, keep showing sample data
        setData(SAMPLE_DATA);
      }
      
      // Update fetch time
      setFetchTime(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error('Error fetching RFPs:', err);
      setError(err.message || "Unknown error");
      // Keep showing sample data on error
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Only fetch on button click, not on initial load
  // This avoids potential SSR issues with Supabase client

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">Direct Database Fetch Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">
            Last fetched: {fetchTime}
          </span>
          <Button 
            onClick={fetchData} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Fetch Data
              </>
            )}
          </Button>
        </div>
        
        {error && (
          <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
            <p className="font-medium">Error fetching data:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div>
          <span className="font-medium">Showing {data.length} records</span>
          
          {data.length === 0 ? (
            <p className="mt-2 text-muted-foreground">No records found.</p>
          ) : (
            <ul className="pl-5 list-disc space-y-1 mt-2">
              {data.map((item) => (
                <li key={item.id}>
                  ID: {item.id} - {item.name || "Unnamed"} 
                  {item.status ? ` (${item.status})` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 