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

export type Invoice = {
  id: number;
  invoice_no: string | null;
  project_id: number | null;
  project_name: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  date: string | null;
  due_date: string | null;
};

export const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "invoice_no",
    header: "Invoice #",
    cell: ({ row }) => <span>{row.getValue("invoice_no") || "-"}</span>,
  },
  {
    accessorKey: "project_name",
    header: "Project",
    cell: ({ row }) => <span>{row.getValue("project_name") || "-"}</span>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number | null;
      const currency = row.original.currency || "USD";
      return <span>{formatCurrency(amount, currency)}</span>;
    },
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
    accessorKey: "date",
    header: "Issue Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as string | null;
      return <span>{formatDate(date)}</span>;
    },
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => {
      const date = row.getValue("due_date") as string | null;
      return <span>{formatDate(date)}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button asChild size="sm" variant="outline" className="h-6 px-2 text-xs">
            <Link href={`/invoices/${row.original.id}`}>View</Link>
          </Button>
        </div>
      );
    },
  },
];

interface InvoicesTableProps {
  initialData?: Invoice[];
  fixedTotalEntries?: number;
}

export function InvoicesTable({ initialData = [], fixedTotalEntries }: InvoicesTableProps) {
  const [data, setData] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [totalEntries, setTotalEntries] = useState<number | undefined>(fixedTotalEntries);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // Calculate the range for pagination
      const { from, to } = calculatePaginationRange(pagination);
      
      // First get the count of all records
      const { count, error: countError } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        throw countError;
      }
      
      // Set total entries count and calculate page count
      if (count !== null) {
        // Use fixed entries count if provided, otherwise use the actual count
        if (fixedTotalEntries === undefined) {
          setTotalEntries(count);
        }
        setPageCount(calculatePageCount(count, pagination.pageSize));
      }
      
      // Then fetch the data for the current page
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*, projects(name)')
        .order('id', { ascending: false })
        .range(from, to);
      
      if (error) {
        throw error;
      }
      
      // Map the project name from the joined table
      const formattedInvoices = invoices.map((invoice) => ({
        ...invoice,
        project_name: invoice.projects?.name || null,
      }));
      
      setData(formattedInvoices || []);
    } catch (err) {
      console.error("Error fetching Invoices:", err);
      
      // If there's an error, use initial data if available
      if (initialData.length > 0) {
        setData(initialData);
        if (fixedTotalEntries === undefined) {
          setTotalEntries(initialData.length);
        }
        setPageCount(calculatePageCount(fixedTotalEntries ?? initialData.length, pagination.pageSize));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize]);

  return (
    <div className="space-y-1">
      <div className="flex justify-end mb-1">
        <Button className="gap-1 h-7 px-2 text-xs">
          <PlusCircle className="h-3 w-3 mr-1" />
          Add Invoice
        </Button>
      </div>
      
      <DataTable
        columns={invoiceColumns}
        data={data}
        pageCount={pageCount}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        totalEntries={totalEntries}
      />
    </div>
  );
} 