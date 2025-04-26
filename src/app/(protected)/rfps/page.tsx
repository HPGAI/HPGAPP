import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
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
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RFPs Management</h1>
          <p className="text-muted-foreground">
            Manage and track all Request for Proposals
          </p>
        </div>
        <div className="flex gap-2">
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
      
      {/* Server-side paginated table */}
      <RfpsTable />
    </div>
  );
} 