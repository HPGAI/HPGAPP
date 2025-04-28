"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Filter, PlusCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter, useSearchParams } from "next/navigation";
import { getFilteredRfps, type RfpFilters, type Rfp } from "../../src/lib/rfps";
import { branchOptions } from "../../src/lib/rfp-options";
import { fetchRfpStatuses } from "../../src/lib/rfp-options";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RfpFilterBar } from "./rfp-filter-bar";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
} from "@/components/ui/card";

interface RfpsTableProps {
  initialData?: Rfp[];
}

export function RfpsTable({ initialData = [] }: RfpsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<Rfp[]>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusOptions, setStatusOptions] = useState<{ id: number; name: string }[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'id', desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [tableFilters, setTableFilters] = useState({
    globalFilter: "",
    statusFilter: "",
    dateFromFilter: "",
    dateToFilter: "",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(initialData.length);

  // Define column width constants to ensure consistency
  const COLUMN_WIDTHS = {
    id: 80,
    proposal_no: 150,
    name: 250,
    status: 130,
    request_date: 150,
    deadline: 120,
    quoted_amount: 120,
    actions: 100
  };

  // Define columns for the table with fixed sizes
  const columns = useMemo<ColumnDef<Rfp>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <div className="flex flex-col">
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="h-3 w-3" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="h-3 w-3" />
              ) : null}
            </div>
          </div>
        ),
        cell: ({ row }) => <div className="text-sm">{row.getValue("id")}</div>,
        size: COLUMN_WIDTHS.id,
        minSize: COLUMN_WIDTHS.id,
        maxSize: COLUMN_WIDTHS.id,
        enableSorting: true,
        enableResizing: false,
      },
      {
        accessorKey: "proposal_no",
        header: ({ column }) => (
          <div 
            className="flex items-center justify-between cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Proposal #
            <div className="flex flex-col">
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="h-3 w-3" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="h-3 w-3" />
              ) : null}
            </div>
          </div>
        ),
        cell: ({ row }) => <div className="text-sm">{row.getValue("proposal_no") || "-"}</div>,
        size: COLUMN_WIDTHS.proposal_no,
        minSize: COLUMN_WIDTHS.proposal_no,
        maxSize: COLUMN_WIDTHS.proposal_no,
        enableColumnFilter: true,
        enableResizing: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <div 
            className="flex items-center justify-between cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <div className="flex flex-col">
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="h-3 w-3" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="h-3 w-3" />
              ) : null}
            </div>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap" title={row.getValue("name") || "-"}>
            {row.getValue("name") || "-"}
          </div>
        ),
        size: COLUMN_WIDTHS.name,
        minSize: COLUMN_WIDTHS.name,
        maxSize: COLUMN_WIDTHS.name,
        enableColumnFilter: true,
        enableResizing: false,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <div 
            className="flex items-center justify-between cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <div className="flex flex-col">
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="h-3 w-3" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="h-3 w-3" />
              ) : null}
            </div>
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <Badge 
              variant={
                row.getValue("status") === 'Approved' ? 'outline' : 
                row.getValue("status") === 'Pending' ? 'secondary' :
                row.getValue("status") === 'Rejected' ? 'destructive' :
                row.getValue("status") === 'Completed' ? 'outline' : 'default'
              }
              className={`text-xs font-normal
                ${row.getValue("status") === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                ${row.getValue("status") === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${row.getValue("status") === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
              `}
            >
              {row.getValue("status") || 'Unknown'}
            </Badge>
          </div>
        ),
        size: COLUMN_WIDTHS.status,
        minSize: COLUMN_WIDTHS.status,
        maxSize: COLUMN_WIDTHS.status,
        enableColumnFilter: true,
        enableResizing: false,
      },
      {
        accessorKey: "request_date",
        header: ({ column }) => (
          <div 
            className="flex items-center justify-between cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Request Date
            <div className="flex flex-col">
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="h-3 w-3" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="h-3 w-3" />
              ) : null}
            </div>
          </div>
        ),
        cell: ({ row }) => <div className="text-sm">{row.getValue("request_date") || "-"}</div>,
        size: COLUMN_WIDTHS.request_date,
        minSize: COLUMN_WIDTHS.request_date,
        maxSize: COLUMN_WIDTHS.request_date,
        enableColumnFilter: true,
        enableResizing: false,
      },
      {
        accessorKey: "deadline",
        header: ({ column }) => (
          <div 
            className="flex items-center justify-between cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Deadline
            <div className="flex flex-col">
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="h-3 w-3" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="h-3 w-3" />
              ) : null}
            </div>
          </div>
        ),
        cell: ({ row }) => <div className="text-sm">{row.getValue("deadline") || "-"}</div>,
        size: COLUMN_WIDTHS.deadline,
        minSize: COLUMN_WIDTHS.deadline,
        maxSize: COLUMN_WIDTHS.deadline,
        enableResizing: false,
      },
      {
        accessorKey: "quoted_amount",
        header: ({ column }) => (
          <div 
            className="flex items-center justify-between text-right cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="w-full text-right">Amount</span>
            <div className="flex flex-col">
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="h-3 w-3" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="h-3 w-3" />
              ) : null}
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const amount = row.getValue("quoted_amount") as number | null;
          const currency = row.original.currency || "USD";
          return (
            <div className="text-right text-sm">
              {amount
                    ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                    currency
                  }).format(amount)
                    : '-'}
            </div>
          );
        },
        size: COLUMN_WIDTHS.quoted_amount,
        minSize: COLUMN_WIDTHS.quoted_amount,
        maxSize: COLUMN_WIDTHS.quoted_amount,
        enableResizing: false,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => router.push(`/rfps/${row.original.id}`)}
            >
              View
            </Button>
          </div>
        ),
        size: COLUMN_WIDTHS.actions,
        minSize: COLUMN_WIDTHS.actions,
        maxSize: COLUMN_WIDTHS.actions,
        enableResizing: false,
      }
    ],
    [router]
  );

  // Initialize Tanstack Table with improved configuration
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    defaultColumn: {
      // Default values for all columns
      minSize: 80,
      maxSize: 400,
      size: 120,
      enableResizing: false,
    },
    state: {
      sorting,
      columnFilters,
      pagination,
      columnVisibility,
      rowSelection,
    },
    // Force a fixed layout to prevent resizing
    columnResizeMode: "onChange",
    enableColumnResizing: false,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  });

  // Handle global filter change
  const handleGlobalFilterChange = (value: string) => {
    setTableFilters(prev => ({
      ...prev,
      globalFilter: value
    }));
    
    // Trigger the filter update
    const filters = getInitialFilters();
    filters.search = value;
    handleFilterChange(filters);
  };

  // Get unique categories from data for filter options
  useEffect(() => {
    if (initialData.length > 0) {
      const categories = [...new Set(initialData
        .map(rfp => rfp.category)
        .filter(category => category !== null && category !== ''))] as string[];
      setCategoryOptions(categories);
      
      // Fetch status options
      fetchRfpStatuses()
        .then(statuses => {
          setStatusOptions(statuses);
        })
        .catch(error => {
          console.error('Error fetching RFP statuses:', error);
        });
    }
  }, [initialData]);

  // Parse search params to build initial filters
  const getInitialFilters = useCallback((): RfpFilters => {
    return {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      branch: searchParams.get('branch') || undefined,
      category: searchParams.get('category') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      minAmount: searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined,
      maxAmount: searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 10,
      sortBy: searchParams.get('sortBy') || 'id',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
    };
  }, [searchParams]);

  // Collect filter values from column filters
  const getColumnFiltersAsRfpFilters = (): Partial<RfpFilters> => {
    const filters: Partial<RfpFilters> = {};
    
    // Get proposal_no filter
    const proposalFilter = table.getColumn('proposal_no')?.getFilterValue() as string;
    if (proposalFilter) {
      filters.search = proposalFilter;
    }
    
    // Get name filter
    const nameFilter = table.getColumn('name')?.getFilterValue() as string;
    if (nameFilter) {
      filters.search = nameFilter;
    }
    
    // Get status filter
    const statusFilter = table.getColumn('status')?.getFilterValue() as string;
    if (statusFilter) {
      filters.status = statusFilter;
    }
    
    // Get date filter
    const dateFilter = table.getColumn('request_date')?.getFilterValue() as { from: string, to: string } | undefined;
    if (dateFilter) {
      filters.dateFrom = dateFilter.from;
      filters.dateTo = dateFilter.to;
    }
    
    return filters;
  };

  // Handle filter changes - this is called from the filter bar
  const handleFilterChange = async (filters: RfpFilters) => {
    setLoading(true);
    try {
      // Collect column filters
      const columnFiltersObj = getColumnFiltersAsRfpFilters();
      
      // Merge column filters with provided filters
      const mergedFilters = {
        ...filters,
        ...columnFiltersObj
      };
      
      // If table sorting state has changed, update the filters
      if (sorting.length > 0) {
        mergedFilters.sortBy = sorting[0].id;
        mergedFilters.sortOrder = sorting[0].desc ? 'desc' : 'asc';
      }

      // Update pagination if needed
      if (pagination.pageIndex !== (mergedFilters.page || 1) - 1) {
        mergedFilters.page = pagination.pageIndex + 1;
      }
      
      if (pagination.pageSize !== mergedFilters.pageSize) {
        mergedFilters.pageSize = pagination.pageSize;
      }
      
      const result = await getFilteredRfps(mergedFilters);
      setData(result.data);
      setRowCount(result.count);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
      toast.error('Failed to apply filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Effect to update data when sorting or pagination changes
  useEffect(() => {
    const filters = getInitialFilters();
    
    // Update filters with current sorting state
    if (sorting.length > 0) {
      filters.sortBy = sorting[0].id;
      filters.sortOrder = sorting[0].desc ? 'desc' : 'asc';
    }
    
    // Update filters with current pagination state
    filters.page = pagination.pageIndex + 1;
    filters.pageSize = pagination.pageSize;
    
    handleFilterChange(filters);
  }, [sorting, pagination]);

  // Effect for column filters
  useEffect(() => {
    if (columnFilters.length > 0) {
      const filters = getInitialFilters();
      handleFilterChange(filters);
    }
  }, [columnFilters]);

  // Load filtered data on initial render based on URL params
  useEffect(() => {
    if (searchParams.toString()) {
      const initialFilters = getInitialFilters();
      // Set initial pagination state from filters
      setPagination({
        pageIndex: (initialFilters.page || 1) - 1,
        pageSize: initialFilters.pageSize || 10,
      });
      
      // Set initial sorting state from filters
      if (initialFilters.sortBy) {
        setSorting([
          {
            id: initialFilters.sortBy,
            desc: initialFilters.sortOrder === 'desc',
          },
        ]);
      }
      
      // Initialize global filter if search is present
      if (initialFilters.search) {
        setTableFilters(prev => ({
          ...prev,
          globalFilter: initialFilters.search || ""
        }));
      }
      
      handleFilterChange(initialFilters);
    }
  }, [searchParams, getInitialFilters]);

  // Effect for column visibility changes
  useEffect(() => {
    // Force the table to use fixed column widths regardless of content
    const forceFixedWidths = () => {
      const tableElement = document.querySelector('.rfp-table') as HTMLTableElement;
      if (tableElement) {
        // Apply fixed table layout immediately
        tableElement.style.tableLayout = 'fixed';
        tableElement.style.width = '100%';
        
        // Force each cell to respect its width
        const allCells = tableElement.querySelectorAll('th, td');
        allCells.forEach((cell, index) => {
          const colIndex = index % 8; // 8 columns total
          let width = '100px';
          
          switch(colIndex) {
            case 0: width = '80px'; break;
            case 1: width = '150px'; break;
            case 2: width = '250px'; break;
            case 3: width = '130px'; break;
            case 4: width = '150px'; break;
            case 5: width = '120px'; break;
            case 6: width = '120px'; break;
            case 7: width = '100px'; break;
          }
          
          (cell as HTMLElement).style.width = width;
          (cell as HTMLElement).style.minWidth = width;
          (cell as HTMLElement).style.maxWidth = width;
        });
      }
    };

    // Apply immediately and after a small delay to catch any DOM updates
    forceFixedWidths();
    const timer = setTimeout(forceFixedWidths, 100);
    
    return () => clearTimeout(timer);
  }, [columnVisibility, data, sorting, pagination]);

  // Effect to ensure fixed widths on initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      const tableElement = document.querySelector('.rfp-table') as HTMLTableElement;
      if (tableElement) {
        tableElement.style.tableLayout = 'fixed';
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  // Effect to enforce fixed widths after data changes, pagination, or tab changes
  useEffect(() => {
    const applyFixedWidths = () => {
      const tableElement = document.querySelector('.rfps-table table') as HTMLTableElement;
      if (tableElement) {
        // Set table layout to fixed
        tableElement.style.tableLayout = 'fixed';
        
        // Calculate total width
        const totalWidth = Object.values(COLUMN_WIDTHS).reduce((sum, width) => sum + width, 0);
        tableElement.style.width = `${totalWidth}px`;
        
        // Apply fixed widths to header cells
        const headerCells = tableElement.querySelectorAll('thead th');
        const columnKeys = Object.keys(COLUMN_WIDTHS) as Array<keyof typeof COLUMN_WIDTHS>;
        headerCells.forEach((cell, index) => {
          if (index < columnKeys.length) {
            const htmlCell = cell as HTMLElement;
            htmlCell.style.width = `${COLUMN_WIDTHS[columnKeys[index]]}px`;
          }
        });
        
        // Apply fixed widths to body cells
        const bodyRows = tableElement.querySelectorAll('tbody tr');
        bodyRows.forEach(row => {
          const cells = row.querySelectorAll('td');
          cells.forEach((cell, index) => {
            if (index < columnKeys.length) {
              const htmlCell = cell as HTMLElement;
              htmlCell.style.width = `${COLUMN_WIDTHS[columnKeys[index]]}px`;
            }
          });
        });
        
        // Set minimum width on table wrapper
        const wrapper = document.querySelector('.rfps-table') as HTMLElement;
        if (wrapper) {
          wrapper.style.minWidth = `${totalWidth}px`;
        }
      }
    };

    // Apply immediately
    applyFixedWidths();
    
    // Apply again after a short delay to handle DOM updates
    const timeoutId = setTimeout(applyFixedWidths, 200);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [table, data, pagination, sorting, COLUMN_WIDTHS]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">RFPs Management</CardTitle>
          <CardDescription>Manage and track all Request for Proposals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search RFPs..."
                value={tableFilters.globalFilter}
                onChange={(e) => handleGlobalFilterChange(e.target.value)}
                className="pl-8 w-full"
              />
              {tableFilters.globalFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-9 w-9 px-2.5"
                  onClick={() => handleGlobalFilterChange("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear</span>
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 gap-1">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>View</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id === "quoted_amount" ? "Amount" : column.id.replace(/_/g, " ")}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button className="h-9 gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>Add RFP</span>
              </Button>
            </div>
          </div>
          
          {/* Add RFP Filter Bar */}
          <RfpFilterBar
            statusOptions={statusOptions}
            categoryOptions={categoryOptions}
            initialFilters={getInitialFilters()}
            onFilterChange={handleFilterChange}
          />
          
          <div className="overflow-auto rfp-table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', position: 'relative' }}>
            <div className="rounded-md border min-w-full rfp-table-container" style={{ width: '100%' }}>
              <style jsx global>{`
                /* Fix for RFPs table to ensure consistent column widths */
                .rfps-table-fixed {
                  table-layout: fixed !important;
                  width: 100% !important;
                  border-collapse: separate !important;
                  border-spacing: 0 !important;
                }
                
                /* Apply consistent widths to all th/td elements */
                .rfps-table-fixed th,
                .rfps-table-fixed td {
                  box-sizing: border-box !important;
                  overflow: hidden !important;
                  text-overflow: ellipsis !important;
                  white-space: nowrap !important;
                }
                
                /* Fixed width for column 1 - ID */
                .rfps-table-fixed th:nth-of-type(1),
                .rfps-table-fixed td:nth-of-type(1) {
                  width: ${COLUMN_WIDTHS.id}px !important;
                  min-width: ${COLUMN_WIDTHS.id}px !important;
                  max-width: ${COLUMN_WIDTHS.id}px !important;
                }
                
                /* Fixed width for column 2 - Proposal # */
                .rfps-table-fixed th:nth-of-type(2),
                .rfps-table-fixed td:nth-of-type(2) {
                  width: ${COLUMN_WIDTHS.proposal_no}px !important;
                  min-width: ${COLUMN_WIDTHS.proposal_no}px !important;
                  max-width: ${COLUMN_WIDTHS.proposal_no}px !important;
                }
                
                /* Fixed width for column 3 - Name */
                .rfps-table-fixed th:nth-of-type(3),
                .rfps-table-fixed td:nth-of-type(3) {
                  width: ${COLUMN_WIDTHS.name}px !important;
                  min-width: ${COLUMN_WIDTHS.name}px !important;
                  max-width: ${COLUMN_WIDTHS.name}px !important;
                }
                
                /* Fixed width for column 4 - Status */
                .rfps-table-fixed th:nth-of-type(4),
                .rfps-table-fixed td:nth-of-type(4) {
                  width: ${COLUMN_WIDTHS.status}px !important;
                  min-width: ${COLUMN_WIDTHS.status}px !important;
                  max-width: ${COLUMN_WIDTHS.status}px !important;
                }
                
                /* Fixed width for column 5 - Request Date */
                .rfps-table-fixed th:nth-of-type(5),
                .rfps-table-fixed td:nth-of-type(5) {
                  width: ${COLUMN_WIDTHS.request_date}px !important;
                  min-width: ${COLUMN_WIDTHS.request_date}px !important;
                  max-width: ${COLUMN_WIDTHS.request_date}px !important;
                }
                
                /* Fixed width for column 6 - Deadline */
                .rfps-table-fixed th:nth-of-type(6),
                .rfps-table-fixed td:nth-of-type(6) {
                  width: ${COLUMN_WIDTHS.deadline}px !important;
                  min-width: ${COLUMN_WIDTHS.deadline}px !important;
                  max-width: ${COLUMN_WIDTHS.deadline}px !important;
                }
                
                /* Fixed width for column 7 - Amount */
                .rfps-table-fixed th:nth-of-type(7),
                .rfps-table-fixed td:nth-of-type(7) {
                  width: ${COLUMN_WIDTHS.quoted_amount}px !important;
                  min-width: ${COLUMN_WIDTHS.quoted_amount}px !important;
                  max-width: ${COLUMN_WIDTHS.quoted_amount}px !important;
                }
                
                /* Fixed width for column 8 - Actions */
                .rfps-table-fixed th:nth-of-type(8),
                .rfps-table-fixed td:nth-of-type(8) {
                  width: ${COLUMN_WIDTHS.actions}px !important;
                  min-width: ${COLUMN_WIDTHS.actions}px !important;
                  max-width: ${COLUMN_WIDTHS.actions}px !important;
                }
                
                /* Force rows to maintain consistent heights */
                .rfps-table-fixed tr {
                  height: 48px !important;
                }
                
                .rfps-table-fixed thead tr {
                  height: 56px !important;
                }
                
                /* Force the specific width of the table */
                .rfps-table-fixed.table-width-enforced {
                  width: ${Object.values(COLUMN_WIDTHS).reduce((sum, width) => sum + width, 0)}px !important;
                }
              `}</style>
              <Table 
                className="rfps-table-fixed table-width-enforced"
              >
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted">
                      {headerGroup.headers.map((header, index) => {
                        // Map column indices to our width constants
                        let width = 100;
                        if (index === 0) width = COLUMN_WIDTHS.id;
                        else if (index === 1) width = COLUMN_WIDTHS.proposal_no;
                        else if (index === 2) width = COLUMN_WIDTHS.name;
                        else if (index === 3) width = COLUMN_WIDTHS.status;
                        else if (index === 4) width = COLUMN_WIDTHS.request_date;
                        else if (index === 5) width = COLUMN_WIDTHS.deadline;
                        else if (index === 6) width = COLUMN_WIDTHS.quoted_amount;
                        else if (index === 7) width = COLUMN_WIDTHS.actions;
                        
                        return (
                          <TableHead 
                            key={header.id} 
                            className="py-2"
                            style={{
                              width: `${width}px`,
                              minWidth: `${width}px`,
                              maxWidth: `${width}px`,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          <p className="text-sm text-muted-foreground">Loading...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell, index) => {
                          // Map column indices to our width constants
                          let width = 100;
                          if (index === 0) width = COLUMN_WIDTHS.id;
                          else if (index === 1) width = COLUMN_WIDTHS.proposal_no;
                          else if (index === 2) width = COLUMN_WIDTHS.name;
                          else if (index === 3) width = COLUMN_WIDTHS.status;
                          else if (index === 4) width = COLUMN_WIDTHS.request_date;
                          else if (index === 5) width = COLUMN_WIDTHS.deadline;
                          else if (index === 6) width = COLUMN_WIDTHS.quoted_amount;
                          else if (index === 7) width = COLUMN_WIDTHS.actions;
                          
                          return (
                            <TableCell 
                              key={cell.id} 
                              className="py-3"
                              style={{
                                width: `${width}px`,
                                minWidth: `${width}px`,
                                maxWidth: `${width}px`,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination Controls */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {table.getRowModel().rows.length > 0 
                    ? pagination.pageIndex * pagination.pageSize + 1 
                    : 0} to {Math.min(
                    (pagination.pageIndex + 1) * pagination.pageSize,
                    rowCount
                  )} of {rowCount} entries
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage() || loading}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage() || loading}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center gap-1 mx-2">
                    <div className="text-sm font-medium">
                      Page {pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage() || loading}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage() || loading}
                  >
                    Last
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 