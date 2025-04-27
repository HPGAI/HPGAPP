import { RfpsTable } from "../../../components/tables/rfps-table";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: "RFPs Management",
  description: "Manage Request for Proposals",
};

export default function RfpsPage() {
  return (
    <div className="container mx-auto py-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">RFPs Management</h1>
        <p className="text-muted-foreground">
          Manage and track all Request for Proposals
        </p>
      </div>
      
      {/* Server-side paginated table */}
      <RfpsTable />
    </div>
  );
} 