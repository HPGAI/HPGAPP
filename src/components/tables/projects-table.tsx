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
  getStatusBadgeClass,
  formatCurrency
} from "./utils";

export type Project = {
  id: number;
  name: string | null;
  description: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  currency: string | null;
  client_id: string | null;
  client_name: string | null;
};

const projectStatusClasses = {
  "not started": "px-2 py-1 text-xs bg-gray-100 text-gray-800",
  "in progress": "px-2 py-1 text-xs bg-blue-100 text-blue-800",
  "completed": "px-2 py-1 text-xs bg-green-100 text-green-800",
  "on hold": "px-2 py-1 text-xs bg-yellow-100 text-yellow-800",
  "cancelled": "px-2 py-1 text-xs bg-red-100 text-red-800",
  "default": "px-2 py-1 text-xs bg-gray-100 text-gray-800"
};

export const projectColumns: ColumnDef<Project>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Project Name",
    cell: ({ row }) => <span>{row.getValue("name") || "-"}</span>,
  },
  {
    accessorKey: "client_name",
    header: "Client",
    cell: ({ row }) => <span>{row.getValue("client_name") || "-"}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string | null;
      return (
        <span
          className={`inline-flex items-center rounded-full ${getStatusBadgeClass(status, projectStatusClasses)}`}
        >
          {status || "Unknown"}
        </span>
      );
    },
  },
  {
    accessorKey: "budget",
    header: "Budget",
    cell: ({ row }) => {
      const budget = row.getValue("budget") as number | null;
      const currency = row.original.currency as string | undefined;
      return <span>{formatCurrency(budget, currency)}</span>;
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
  fixedTotalEntries?: number;
}

export function ProjectsTable({ initialData = [], fixedTotalEntries }: ProjectsTableProps) {
  const [data, setData] = useState<Project[]>([]);
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
        .from('projects')
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
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients(name)
        `)
        .order('id', { ascending: false })
        .range(from, to);
      
      if (error) {
        throw error;
      }
      
      // Map the client name from the joined table
      const formattedProjects = projects.map((project) => ({
        ...project,
        client_name: project.clients?.name || null,
      }));
      
      setData(formattedProjects || []);
    } catch (err) {
      console.error("Error fetching Projects:", err);
      
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
        totalEntries={totalEntries}
      />
    </div>
  );
} 