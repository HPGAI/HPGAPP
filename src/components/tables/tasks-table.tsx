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
  getStatusBadgeClass
} from "./utils";

export type Task = {
  id: number;
  title: string | null;
  description: string | null;
  status: string | null;
  priority: string | null;
  due_date: string | null;
  project_id: number | null;
  project_name: string | null;
  assignee_id: string | null;
  assignee_name: string | null;
};

const taskStatusClasses = {
  "not started": "px-2 py-1 text-xs bg-gray-100 text-gray-800",
  "in progress": "px-2 py-1 text-xs bg-blue-100 text-blue-800",
  "completed": "px-2 py-1 text-xs bg-green-100 text-green-800",
  "blocked": "px-2 py-1 text-xs bg-red-100 text-red-800",
  "default": "px-2 py-1 text-xs bg-gray-100 text-gray-800"
};

const priorityClasses = {
  "low": "px-2 py-1 text-xs bg-gray-100 text-gray-800",
  "medium": "px-2 py-1 text-xs bg-yellow-100 text-yellow-800",
  "high": "px-2 py-1 text-xs bg-orange-100 text-orange-800",
  "urgent": "px-2 py-1 text-xs bg-red-100 text-red-800",
  "default": "px-2 py-1 text-xs bg-gray-100 text-gray-800"
};

export const taskColumns: ColumnDef<Task>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <span>{row.getValue("title") || "-"}</span>,
  },
  {
    accessorKey: "project_name",
    header: "Project",
    cell: ({ row }) => <span>{row.getValue("project_name") || "-"}</span>,
  },
  {
    accessorKey: "assignee_name",
    header: "Assignee",
    cell: ({ row }) => <span>{row.getValue("assignee_name") || "-"}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string | null;
      return (
        <span
          className={`inline-flex items-center rounded-full ${getStatusBadgeClass(status, taskStatusClasses)}`}
        >
          {status || "Unknown"}
        </span>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string | null;
      return (
        <span
          className={`inline-flex items-center rounded-full ${getStatusBadgeClass(priority, priorityClasses)}`}
        >
          {priority || "Unknown"}
        </span>
      );
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
            <Link href={`/tasks/${row.original.id}`}>View</Link>
          </Button>
        </div>
      );
    },
  },
];

interface TasksTableProps {
  initialData?: Task[];
  fixedTotalEntries?: number;
}

export function TasksTable({ initialData = [], fixedTotalEntries }: TasksTableProps) {
  const [data, setData] = useState<Task[]>([]);
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
        .from('tasks')
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
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects(name),
          profiles(full_name)
        `)
        .order('id', { ascending: false })
        .range(from, to);
      
      if (error) {
        throw error;
      }
      
      // Map the project name and assignee name from the joined tables
      const formattedTasks = tasks.map((task) => ({
        ...task,
        project_name: task.projects?.name || null,
        assignee_name: task.profiles?.full_name || null,
      }));
      
      setData(formattedTasks || []);
    } catch (err) {
      console.error("Error fetching Tasks:", err);
      
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
          Add Task
        </Button>
      </div>
      
      <DataTable
        columns={taskColumns}
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