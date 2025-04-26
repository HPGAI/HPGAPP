"use client";

import { useState, useEffect } from "react";
import { DataTable } from "../../components/ui/data-table";
import { createClient } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import { PlusCircle } from "lucide-react";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import Link from "next/link";
import { 
  calculatePaginationRange, 
  calculatePageCount, 
  formatDate, 
  formatCurrency, 
  getStatusBadgeClass,
  defaultStatusClasses 
} from "./utils";

// Define the RFP type
export type Rfp = {
  id: number;
  branch: string | null;
  proposal_no: string | null;
  file_no: string | null;
  name: string | null;
  status: string | null;
  request_date: string | null;
  deadline: string | null;
  quoted_amount: number | null;
  currency: string | null;
};

// Define the columns for the RFPs table
export const rfpColumns: ColumnDef<Rfp>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "proposal_no",
    header: "Proposal #",
    cell: ({ row }) => <span>{row.getValue("proposal_no") || "-"}</span>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name") || "-"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string | null;
      return (
        <span
          className={`inline-flex items-center rounded-full ${getStatusBadgeClass(status, defaultStatusClasses)}`}
        >
          {status || "Unknown"}
        </span>
      );
    },
  },
  {
    accessorKey: "request_date",
    header: "Request Date",
    cell: ({ row }) => {
      const date = row.getValue("request_date") as string | null;
      return <span>{formatDate(date)}</span>;
    },
  },
  {
    accessorKey: "deadline",
    header: "Deadline",
    cell: ({ row }) => {
      const date = row.getValue("deadline") as string | null;
      return <span>{formatDate(date)}</span>;
    },
  },
  {
    accessorKey: "quoted_amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("quoted_amount") as number | null;
      const currency = row.original.currency || "USD";
      return (
        <span className="text-right">
          {formatCurrency(amount, currency)}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button asChild size="sm" variant="outline" className="h-6 px-2 text-xs">
            <Link href={`/rfps/${row.original.id}`}>View</Link>
          </Button>
        </div>
      );
    },
  },
];

interface RfpsTableProps {
  initialData?: Rfp[];
}

export function RfpsTable({ initialData = [] }: RfpsTableProps) {
  const [data, setData] = useState<Rfp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // Calculate the range for pagination
      const { from, to } = calculatePaginationRange(pagination);
      
      // First get the count of all records
      const { count, error: countError } = await supabase
        .from('rfps')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        throw countError;
      }
      
      // Calculate page count
      setPageCount(calculatePageCount(count, pagination.pageSize));
      
      // Then fetch the data for the current page
      const { data: rfps, error } = await supabase
        .from('rfps')
        .select('*')
        .order('id', { ascending: false })
        .range(from, to);
      
      if (error) {
        throw error;
      }
      
      setData(rfps || []);
    } catch (err) {
      console.error("Error fetching RFPs:", err);
      
      // If there's an error, use initial data if available
      if (initialData.length > 0) {
        setData(initialData);
        setPageCount(calculatePageCount(initialData.length, pagination.pageSize));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="gap-1 h-7 px-2 text-xs">
          <PlusCircle className="h-3 w-3 mr-1" />
          Add RFP
        </Button>
      </div>
      
      <DataTable
        columns={rfpColumns}
        data={data}
        pageCount={pageCount}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
      />
    </div>
  );
} 