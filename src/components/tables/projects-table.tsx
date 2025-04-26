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

// Define the Project type
export type Project = {
  id: number;
  name: string | null;
  description: string | null;
  status: string | null;
  client: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  currency: string | null;
};

// Define the columns for the Projects table
export const projectColumns: ColumnDef<Project>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Project Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name") || "-"}</span>
    ),
  },
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => <span>{row.getValue("client") || "-"}</span>,
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
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => {
      const date = row.getValue("start_date") as string | null;
      return <span>{formatDate(date)}</span>;
    },
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => {
      const date = row.getValue("end_date") as string | null;
      return <span>{formatDate(date)}</span>;
    },
  },
  {
    accessorKey: "budget",
    header: "Budget",
    cell: ({ row }) => {
      const budget = row.getValue("budget") as number | null;
      const currency = row.original.currency || "USD";
      return (
        <span className="text-right">
          {formatCurrency(budget, currency)}
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
            <Link href={`/projects/${row.original.id}`}>View</Link>
          </Button>
        </div>
      );
    },
  },
];

interface ProjectsTableProps {
  initialData?: Project[];
}

export function ProjectsTable({ initialData = [] }: ProjectsTableProps) {
  const [data, setData] = useState<Project[]>([]);
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
        .from('projects')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        throw countError;
      }
      
      // Calculate page count
      setPageCount(calculatePageCount(count, pagination.pageSize));
      
      // Then fetch the data for the current page
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false })
        .range(from, to);
      
      if (error) {
        throw error;
      }
      
      setData(projects || []);
    } catch (err) {
      console.error("Error fetching Projects:", err);
      
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
          Add Project
        </Button>
      </div>
      
      <DataTable
        columns={projectColumns}
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