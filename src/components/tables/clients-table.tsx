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
import { ModalForm } from "../../components/ui/modal-form";

// Define the Client type
export type Client = {
  id: number;
  name: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string | null;
  created_at: string | null;
};

const clientStatusClasses = {
  "active": "px-2 py-1 text-xs bg-green-100 text-green-800",
  "inactive": "px-2 py-1 text-xs bg-gray-100 text-gray-800",
  "prospect": "px-2 py-1 text-xs bg-blue-100 text-blue-800",
  "default": "px-2 py-1 text-xs bg-gray-100 text-gray-800"
};

// Define the columns for the Clients table
export const clientColumns: ColumnDef<Client>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Client Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name") || "-"}</span>
    ),
  },
  {
    accessorKey: "contact_person",
    header: "Contact Person",
    cell: ({ row }) => <span>{row.getValue("contact_person") || "-"}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span>{row.getValue("email") || "-"}</span>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <span>{row.getValue("phone") || "-"}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string | null;
      return (
        <span
          className={`inline-flex items-center rounded-full ${getStatusBadgeClass(status, clientStatusClasses)}`}
        >
          {status || "Unknown"}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string | null;
      return <span>{formatDate(date)}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button asChild size="sm" variant="outline" className="h-6 px-2 text-xs">
            <Link href={`/clients/${row.original.id}`}>View</Link>
          </Button>
        </div>
      );
    },
  },
];

interface ClientsTableProps {
  initialData?: Client[];
  fixedTotalEntries?: number;
}

export function ClientsTable({ initialData = [], fixedTotalEntries }: ClientsTableProps) {
  const [data, setData] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [totalEntries, setTotalEntries] = useState<number | undefined>(fixedTotalEntries);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // Calculate the range for pagination
      const { from, to } = calculatePaginationRange(pagination);
      
      // First get the count of all records
      const { count, error: countError } = await supabase
        .from('clients')
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
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('id', { ascending: false })
        .range(from, to);
      
      if (error) {
        throw error;
      }
      
      setData(clients || []);
    } catch (err) {
      console.error("Error fetching Clients:", err);
      
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

  const handleAddSuccess = () => {
    setIsModalOpen(false);
    fetchData(); // Refresh the data to show the new client
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-end mb-1">
        <Button 
          className="gap-1 h-7 px-2 text-xs"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle className="h-3 w-3 mr-1" />
          Add Client
        </Button>
      </div>
      
      <DataTable
        columns={clientColumns}
        data={data}
        pageCount={pageCount}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        totalEntries={totalEntries}
      />

      {/* Add Client Modal */}
      <ModalForm
        title="Add New Client"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="lg"
      >
        <div className="p-2">
          <p className="mb-4 text-muted-foreground">
            Client form placeholder - implement a form similar to the RfpForm component for clients.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleCloseModal}>Create Client</Button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
} 