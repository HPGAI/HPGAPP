"use client";

import { useState, useEffect } from "react";
import { DataTable } from "../../components/ui/data-table";
import { createClient } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import { PlusCircle, Search, Filter, X, ChevronDown, CheckCircle } from "lucide-react";
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
import { formatAmountWithCurrency } from "../../lib/currency";
import { getStatusNameById } from "../../lib/rfp-options";
import { fetchRfpStatuses } from "../../lib/rfp-options";
import { branchOptions } from "../../lib/rfp-options";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";

// Define the RFP type
export type Rfp = {
  id: number;
  branch: string | null;
  proposal_no: string | null;
  file_no: string | null;
  name: string | null;
  status: string | null;
  status_id: number | null;
  request_date: string | null;
  deadline: string | null;
  quoted_amount: number | null;
  currency: string | null;
};

// Tab type definition
type TabType = "All" | "Pending";

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
      
      if (status === 'Pending') {
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 rounded-md font-normal">
            {status}
          </Badge>
        );
      } else if (status === 'Approved') {
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 rounded-md font-normal">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {status}
            </div>
          </Badge>
        );
      } else if (status === 'Rejected') {
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 rounded-md font-normal">
            {status}
          </Badge>
        );
      } else if (status === 'Completed') {
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 rounded-md font-normal">
            {status}
          </Badge>
        );
      }
      
      return (
        <span>{status || "Unknown"}</span>
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
      const currency = row.original.currency || "INR";
      
      // For client-side rendering only, use a simpler formatting approach
      const symbol = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'AED': 'د.إ',
        'JPY': '¥',
        'AUD': 'A$',
        'CAD': 'C$',
        'CNY': '¥',
        'SGD': 'S$'
      }[currency] || '';
      
      return (
        <span className="text-right">
          {amount === null || amount === undefined ? '-' : 
            `${symbol} ${amount.toLocaleString(undefined, { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`
          }
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
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [statusOptions, setStatusOptions] = useState<{ id: number; name: string }[]>([]);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<TabType>("All");
  
  // Fetch status options
  useEffect(() => {
    fetchRfpStatuses()
      .then(statuses => {
        setStatusOptions(statuses);
      })
      .catch(error => {
        console.error('Error fetching RFP statuses:', error);
      });
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // Calculate the range for pagination
      const { from, to } = calculatePaginationRange(pagination);
      
      // Build the query with filters
      let query = supabase
        .from('rfps')
        .select('*', { count: 'exact' });
      
      // Apply search filter if provided
      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,proposal_no.ilike.%${searchTerm}%,file_no.ilike.%${searchTerm}%`
        );
      }
      
      // Apply status filter based on tab or dropdown selection
      if (activeTab === "Pending") {
        // If "Pending" tab is active, only show Pending RFPs
        query = query.eq('status', 'Pending');
      } else if (selectedStatus && selectedStatus !== "all") {
        // Otherwise, use the status filter dropdown if set
        query = query.eq('status', selectedStatus);
      }
      
      // Get count of filtered results
      const { data: countData, count, error: countError } = await query;
      
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
      
      // Add ordering and pagination to query
      query = query
        .order('id', { ascending: false })
        .range(from, to);
      
      // Execute the query
      const { data: rfps, error } = await query;
      
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
                
                // Only add the RFP if it matches the current filter view
                const shouldAddRfp = 
                  activeTab === "All" || 
                  (activeTab === "Pending" && newRfp.status === "Pending");
                  
                if (shouldAddRfp) {
                  setData(prevData => {
                    // Only add if it doesn't exceed page size
                    if (prevData.length < pagination.pageSize) {
                      return [newRfp, ...prevData.slice(0, pagination.pageSize - 1)];
                    }
                    return [newRfp, ...prevData.slice(0, pagination.pageSize - 1)];
                  });
                }
                
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
              
              // Handle status changes with active tab filter
              if (activeTab === "Pending" && updatedRfp.status !== "Pending") {
                // Remove RFP from view if it's no longer Pending
                setData(prevData => 
                  prevData.filter(rfp => rfp.id !== updatedRfp.id)
                );
              } else if (activeTab === "All" || (activeTab === "Pending" && updatedRfp.status === "Pending")) {
                // Update the record if it should be visible
                setData(prevData => 
                  prevData.map(rfp => 
                    rfp.id === updatedRfp.id ? updatedRfp : rfp
                  )
                );
              }
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
  }, [pagination.pageIndex, pagination.pageSize, totalEntries, data.length, pageCount, activeTab]); // Include activeTab dependency

  // Initial data fetch with filters
  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, searchTerm, selectedStatus, activeTab]);

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

  // Handle filter removal
  const handleClearFilter = (filterType: string) => {
    switch (filterType) {
      case 'status':
        setSelectedStatus('all');
        break;
      case 'search':
        setSearchTerm('');
        break;
      case 'all':
        setSelectedStatus('all');
        setSearchTerm('');
        break;
    }
  };

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize }); // Reset to first page
  };

  return (
    <div className="space-y-4">
      {/* Tab navigation - styled like the example image */}
      <div className="border-b flex items-end">
        <div className="flex">
          <button
            onClick={() => handleTabChange("All")}
            className={cn(
              "px-6 py-2 text-sm font-medium transition-colors",
              activeTab === "All" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-current"
            )}
          >
            All
          </button>
          <button
            onClick={() => handleTabChange("Pending")}
            className={cn(
              "px-6 py-2 text-sm font-medium transition-colors",
              activeTab === "Pending" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-current"
            )}
          >
            Pending
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search RFPs..."
            className="pl-8 w-full h-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 w-9 px-2.5"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setEditingRfp(null);
              setIsEditMode(false);
              setIsModalOpen(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add RFP
          </Button>
        </div>
      </div>
      
      {/* Only show status filter if not in Pending view */}
      {activeTab === "All" && (
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 h-9 px-3 border rounded-md bg-white">
              <span className="text-sm font-medium">Status</span>
              <ChevronDown className="h-4 w-4 ml-1" />
              <div className="h-5 border-l border-gray-300 mx-1"></div>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="border-0 p-0 h-auto shadow-none">
                  <SelectValue placeholder="All Statuses" className="text-sm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.id} value={status.name}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStatus !== "all" && (
                <X className="h-4 w-4 ml-1 cursor-pointer" onClick={() => handleClearFilter('status')} />
              )}
            </div>

            {selectedStatus !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-sm text-blue-600"
                onClick={() => handleClearFilter('all')}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-white border rounded-md overflow-hidden">
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
      </div>

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