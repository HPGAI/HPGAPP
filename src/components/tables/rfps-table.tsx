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
import { ModalForm } from "../../components/ui/modal-form";
import { RfpForm } from "../../components/forms/rfp-form";
import { RealtimeChannel } from "@supabase/supabase-js";

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
  // Allow overriding total entries count for testing or demo purposes
  fixedTotalEntries?: number;
}

export function RfpsTable({ initialData = [], fixedTotalEntries }: RfpsTableProps) {
  const [data, setData] = useState<Rfp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [totalEntries, setTotalEntries] = useState<number | undefined>(fixedTotalEntries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRfp, setEditingRfp] = useState<Rfp | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

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
      
      // Set total entries count and calculate page count
      if (count !== null) {
        // Use fixed entries count if provided, otherwise use the actual count
        if (fixedTotalEntries === undefined) {
          setTotalEntries(count);
        }
        setPageCount(calculatePageCount(count, pagination.pageSize));
      }
      
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
        if (fixedTotalEntries === undefined) {
          setTotalEntries(initialData.length);
        }
        setPageCount(calculatePageCount(fixedTotalEntries ?? initialData.length, pagination.pageSize));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Set up Supabase realtime subscription
  useEffect(() => {
    const supabase = createClient();
    
    // Enable realtime subscriptions for this table
    let channel: RealtimeChannel;
    
    const setupRealtimeSubscription = async () => {
      try {
        // Subscribe to changes on the rfps table
        channel = supabase
          .channel('rfps-changes')
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'rfps' 
            }, 
            (payload) => {
              console.log('New record inserted:', payload);
              // If we're on the first page, add the new record to the top of the data
              if (pagination.pageIndex === 0) {
                // Add the new record at the beginning of the array
                const newRfp = payload.new as Rfp;
                setData(prevData => {
                  // Only add if it doesn't exceed page size
                  if (prevData.length < pagination.pageSize) {
                    return [newRfp, ...prevData.slice(0, pagination.pageSize - 1)];
                  }
                  return [newRfp, ...prevData.slice(0, pagination.pageSize - 1)];
                });
                
                // Update total entries count
                setTotalEntries(prev => prev !== undefined ? prev + 1 : 1);
                setPageCount(calculatePageCount((totalEntries || 0) + 1, pagination.pageSize));
              } else {
                // For other pages, just update the count but not the data
                setTotalEntries(prev => prev !== undefined ? prev + 1 : 1);
                setPageCount(calculatePageCount((totalEntries || 0) + 1, pagination.pageSize));
              }
            }
          )
          .on('postgres_changes', 
            { 
              event: 'UPDATE', 
              schema: 'public', 
              table: 'rfps' 
            }, 
            (payload) => {
              console.log('Record updated:', payload);
              // Update the record in the current data if it exists
              const updatedRfp = payload.new as Rfp;
              setData(prevData => 
                prevData.map(rfp => 
                  rfp.id === updatedRfp.id ? updatedRfp : rfp
                )
              );
            }
          )
          .on('postgres_changes', 
            { 
              event: 'DELETE', 
              schema: 'public', 
              table: 'rfps' 
            }, 
            (payload) => {
              console.log('Record deleted:', payload);
              // Remove the record from the current data if it exists
              const deletedRfpId = payload.old.id;
              setData(prevData => 
                prevData.filter(rfp => rfp.id !== deletedRfpId)
              );
              
              // Update total entries count
              setTotalEntries(prev => prev !== undefined && prev > 0 ? prev - 1 : 0);
              setPageCount(calculatePageCount(Math.max((totalEntries || 0) - 1, 0), pagination.pageSize));
              
              // If we've deleted the last item on the page and there are more pages,
              // fetch data again to pull in the next record
              if (data.length === 1 && pageCount > 1) {
                fetchData();
              }
            }
          )
          .subscribe((status, err) => {
            if (err) {
              console.error('Error setting up realtime subscription:', err);
            } else {
              console.log('Realtime subscription status:', status);
            }
          });
      } catch (error) {
        console.error('Failed to set up realtime subscription:', error);
        // Fallback to polling if realtime fails
        const pollingInterval = setInterval(fetchData, 10000); // Poll every 10 seconds
        return () => clearInterval(pollingInterval);
      }
    };
    
    setupRealtimeSubscription();
    
    // Clean up subscription when component unmounts
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [pagination.pageIndex, pagination.pageSize, totalEntries, data.length, pageCount]); // Include all dependencies
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleAddRfpSuccess = () => {
    setIsModalOpen(false);
    setEditingRfp(null);
    setIsEditMode(false);
    // No need to manually refresh the data since we're using realtime subscriptions
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRfp(null);
    setIsEditMode(false);
  };

  const handleRowDoubleClick = (rfp: Rfp) => {
    setEditingRfp(rfp);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-end mb-1">
        <Button 
          className="gap-1 h-7 px-2 text-xs"
          onClick={() => {
            setEditingRfp(null);
            setIsEditMode(false);
            setIsModalOpen(true);
          }}
        >
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
        totalEntries={totalEntries || 16} // Use 16 as fallback if we have no data yet
        onRowDoubleClick={handleRowDoubleClick}
      />

      {/* Add/Edit RFP Modal */}
      <ModalForm
        title={isEditMode ? "Edit RFP" : "Add New RFP"}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="lg"
      >
        <RfpForm 
          onSuccess={handleAddRfpSuccess}
          onCancel={handleCloseModal}
          defaultValues={editingRfp || undefined}
          isEditMode={isEditMode}
        />
      </ModalForm>
    </div>
  );
} 