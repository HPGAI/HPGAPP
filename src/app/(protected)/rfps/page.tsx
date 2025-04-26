import { getServerClient } from "../../../lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Home, PlusCircle } from "lucide-react";
import { SimpleRfpsTable } from "./simple-table";
import { DirectFetch } from "./directFetch";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: "RFPs Management",
  description: "Manage Request for Proposals",
};

// Sample/dummy data to always show something
const dummyRfps = [
  { id: 1, branch: "Main Branch", proposal_no: "RFP-2025-001", file_no: "F001", name: "Office Equipment Upgrade", status: "Pending", request_date: "2025-03-01", deadline: "2025-03-30", quoted_amount: 25000, currency: "USD" },
  { id: 2, branch: "East Branch", proposal_no: "RFP-2025-002", file_no: "F002", name: "Software Licensing", status: "Approved", request_date: "2025-02-15", deadline: "2025-03-15", quoted_amount: 35000, currency: "USD" }
];

// Error boundary component
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
      <h3 className="text-lg font-medium mb-2">Error</h3>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// Async component to fetch and display RFPs
async function RfpsList() {
  console.log('RfpsList component starting');
  
  try {
    // Create the Supabase client using our helper
    const supabase = await getServerClient();
    console.log('Supabase client created in RfpsList');
    
    console.log('Fetching RFPs data from server component...');
    
    // Fetch RFPs data
    const { data: rfps, error } = await supabase
      .from('rfps')
      .select('*')
      .order('id', { ascending: false });
    
    console.log('Database query completed', { error: error?.message, recordCount: rfps?.length || 0 });
      
    if (error) {
      console.error('Error fetching RFPs:', error);
      
      // Show dummy data on error instead of just error message
      console.log('Showing dummy data instead of error');
      return (
        <>
          <ErrorDisplay message={`Database error: ${error.message} - Showing sample data instead`} />
          <SimpleRfpsTable initialData={dummyRfps} />
        </>
      );
    }

    if (!rfps || rfps.length === 0) {
      console.log('No RFPs found in database, showing empty state message and dummy data');
      return (
        <>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 my-4">
            <h3 className="text-lg font-medium mb-2">No RFPs Found</h3>
            <p className="text-sm">There are no RFPs in the database yet. Click the "Add RFP" button to create your first entry.</p>
            <p className="text-sm mt-2">Showing sample data for demonstration purposes.</p>
          </div>
          <SimpleRfpsTable initialData={dummyRfps} />
        </>
      );
    }
    
    console.log('RFPs data loaded successfully:', rfps.length, 'records');
    return <SimpleRfpsTable initialData={rfps} />;
  } catch (err: any) {
    console.error('Unexpected error in RfpsList component:', err);
    
    // Show dummy data on unexpected error
    console.log('Showing dummy data after unexpected error');
    return (
      <>
        <ErrorDisplay message={`Something went wrong: ${err?.message || 'Unknown error'} - Showing sample data instead`} />
        <SimpleRfpsTable initialData={dummyRfps} />
      </>
    );
  }
}

export default function RfpsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RFPs Management</h1>
          <p className="text-muted-foreground">
            Manage and track all Request for Proposals
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add RFP
          </Button>
          <Button variant="outline" asChild size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4 mb-6">
        <h3 className="text-lg font-medium mb-2">RFPs Management Page</h3>
        <p>View and manage all Request for Proposals.</p>
        <p className="mt-2"><strong>Current time:</strong> {new Date().toLocaleString()}</p>
      </div>
      
      <DirectFetch />
      
      {/* Server component for RFPs fetching and display */}
      <RfpsList />
    </div>
  );
} 