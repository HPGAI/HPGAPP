"use server";

import { RfpsTable } from "./rfps-table";
import { getServerClient } from "../../src/lib/supabase";
import { Loader2 } from "lucide-react";

// Loading component
function RfpsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
      <p className="text-muted-foreground">Loading RFPs data...</p>
    </div>
  );
}

export async function RfpsDataProvider() {
  const supabase = await getServerClient();
  
  try {
    const { data: rfps, error } = await supabase
      .from('rfps')
      .select('*')
      .order('id', { ascending: false });
      
    if (error) {
      console.error('Error fetching RFPs:', error);
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
          <h3 className="text-lg font-medium mb-2">Error loading RFPs</h3>
          <p className="text-sm">There was a problem connecting to the database. Please try again later.</p>
          <p className="text-xs mt-2 text-red-600">{error.message}</p>
        </div>
      );
    }

    if (!rfps || rfps.length === 0) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 my-4">
          <h3 className="text-lg font-medium mb-2">No RFPs Found</h3>
          <p className="text-sm">There are no RFPs in the database yet. Click the "Add RFP" button to create your first entry.</p>
        </div>
      );
    }

    return <RfpsTable initialData={rfps} />;
  } catch (error) {
    console.error('Unexpected error fetching RFPs:', error);
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
        <h3 className="text-lg font-medium mb-2">Unexpected Error</h3>
        <p className="text-sm">There was an unexpected problem. Please try again later.</p>
      </div>
    );
  }
} 