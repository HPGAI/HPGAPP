"use server";

import { RfpsTable } from "./rfps-table";
import { getServerClient } from "../../src/lib/supabase";
import { Loader2 } from "lucide-react";
import { getFilteredRfps } from "../../src/lib/rfps";

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
  try {
    // Get initial RFPs with default settings
    const { data: rfps, count } = await getFilteredRfps({
      page: 1,
      pageSize: 10,
      sortBy: 'id',
      sortOrder: 'desc'
    });
      
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