"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  onPaginationChange: (pagination: PaginationState) => void;
  isLoading?: boolean;
  pageIndex?: number;
  pageSize?: number;
  totalEntries?: number;
  onRowDoubleClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  onPaginationChange,
  isLoading = false,
  pageIndex = 0,
  pageSize = 10,
  totalEntries,
  onRowDoubleClick,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex,
    pageSize,
  });

  // Calculate the actual total entries if not provided
  const actualTotalEntries = totalEntries !== undefined 
    ? totalEntries 
    : Math.min(pageCount * pageSize, 9999); // Fallback calculation with a reasonable upper limit

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater(pagination);
        setPagination(newPagination);
        onPaginationChange(newPagination);
      } else {
        setPagination(updater);
        onPaginationChange(updater);
      }
    },
  });

  // Calculate visible range
  const from = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
  const to = Math.min(
    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, 
    actualTotalEntries
  );

  // Handler for double-click on row
  const handleRowDoubleClick = (row: TData) => {
    if (onRowDoubleClick) {
      onRowDoubleClick(row);
    }
  };

  return (
    <div className="space-y-2">
      <div className="rounded-md border">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-1.5 text-left font-medium text-muted-foreground text-xs"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b hover:bg-muted/20 transition-colors cursor-pointer"
                    onDoubleClick={() => handleRowDoubleClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-1.5 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-4 text-center text-muted-foreground"
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-xs text-muted-foreground">
          Showing {from} to {to} of {actualTotalEntries} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
            className="h-7 px-2"
          >
            <ChevronLeft className="h-3 w-3" />
            <span className="text-xs ml-1">Previous</span>
          </Button>
          <div className="text-xs font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {pageCount}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
            className="h-7 px-2"
          >
            <span className="text-xs mr-1">Next</span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
} 