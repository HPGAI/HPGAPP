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

  // Define columns for the table
  const columns = useMemo<ColumnDef<Rfp>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => {
          return (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                className="px-2 py-1 h-8"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                ID
                {column.getIsSorted() === "asc" ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ChevronDown className="ml-1 h-4 w-4" />
                ) : null}
              </Button>
            </div>
          );
        },
        cell: ({ row }) => <div className="text-sm">{row.getValue("id")}</div>,
      },
      {
        accessorKey: "proposal_no",
        header: ({ column }) => {
          return (
            <div className="flex flex-col space-y-1">
              <Button
                variant="ghost"
                className="px-2 py-1 h-8"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Proposal #
                {column.getIsSorted() === "asc" ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ChevronDown className="ml-1 h-4 w-4" />
                ) : null}
              </Button>
              <Input
                placeholder="Filter..."
                value={(column.getFilterValue() as string) ?? ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="max-w-sm h-8 text-xs"
              />
            </div>
          );
        },
        cell: ({ row }) => <div className="text-sm">{row.getValue("proposal_no") || "-"}</div>,
        enableColumnFilter: true,
      },
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <div className="flex flex-col space-y-1">
              <Button
                variant="ghost"
                className="px-2 py-1 h-8"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Name
                {column.getIsSorted() === "asc" ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ChevronDown className="ml-1 h-4 w-4" />
                ) : null}
              </Button>
              <Input
                placeholder="Filter..."
                value={(column.getFilterValue() as string) ?? ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="max-w-sm h-8 text-xs"
              />
            </div>
          );
        },
        cell: ({ row }) => <div className="text-sm font-medium">{row.getValue("name") || "-"}</div>,
        enableColumnFilter: true,
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <div className="flex flex-col space-y-1">
              <Button
                variant="ghost"
                className="px-2 py-1 h-8"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Status
                {column.getIsSorted() === "asc" ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ChevronDown className="ml-1 h-4 w-4" />
                ) : null}
              </Button>
              <Select
                value={(column.getFilterValue() as string) ?? ""}
                onValueChange={(value) => column.setFilterValue(value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        },
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
        enableColumnFilter: true,
      },
      {
        accessorKey: "request_date",
        header: ({ column }) => {
  return (
            <div className="flex flex-col space-y-1">
              <Button
                variant="ghost"
                className="px-2 py-1 h-8"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Request Date
                {column.getIsSorted() === "asc" ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ChevronDown className="ml-1 h-4 w-4" />
                ) : null}
              </Button>
              <Input
                type="date"
                placeholder="From..."
                value={tableFilters.dateFromFilter}
                onChange={(e) => {
                  setTableFilters(prev => ({
                    ...prev,
                    dateFromFilter: e.target.value
                  }));
                  handleDateFilterChange(column, e.target.value, tableFilters.dateToFilter);
                }}
                className="max-w-sm h-8 text-xs mb-1"
              />
        <Input
                type="date"
                placeholder="To..."
                value={tableFilters.dateToFilter}
                onChange={(e) => {
                  setTableFilters(prev => ({
                    ...prev,
                    dateToFilter: e.target.value
                  }));
                  handleDateFilterChange(column, tableFilters.dateFromFilter, e.target.value);
                }}
                className="max-w-sm h-8 text-xs"
        />
      </div>
          );
        },
        cell: ({ row }) => <div className="text-sm">{row.getValue("request_date") || "-"}</div>,
        enableColumnFilter: true,
      },
      {
        accessorKey: "deadline",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="px-2 py-1 h-8"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Deadline
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-1 h-4 w-4" />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => <div className="text-sm">{row.getValue("deadline") || "-"}</div>,
      },
      {
        accessorKey: "quoted_amount",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="px-2 py-1 h-8 justify-end w-full"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Amount
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-1 h-4 w-4" />
              ) : null}
            </Button>
          );
        },
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
      },
      {
        id: "actions",
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
      }
    ],
    [tableFilters, router]
  );

  // Handle date filter changes
  const handleDateFilterChange = (column: any, fromDate: string, toDate: string) => {
    // Build a filter object for the date range
    const dateFilter = { from: fromDate, to: toDate };
    if (!fromDate && !toDate) {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue(dateFilter);
    }
  };

  // Initialize Tanstack Table
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
    state: {
      sorting,
      columnFilters,
      pagination,
      columnVisibility,
      rowSelection,
    },
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
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="py-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
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
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
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
        </CardContent>
      </Card>
    </div>
  );
} 