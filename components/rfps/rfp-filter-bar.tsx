"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Filter, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { branchOptions } from "../../src/lib/rfp-options";
import { RfpFilters } from "../../src/lib/rfps";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

export function RfpFilterBar({
  statusOptions = [],
  categoryOptions = [],
  initialFilters = {},
  onFilterChange,
}: {
  statusOptions?: { id: number; name: string }[];
  categoryOptions?: string[];
  initialFilters?: Partial<RfpFilters>;
  onFilterChange: (filters: RfpFilters) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Local filter state
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || "");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(initialFilters.status);
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(initialFilters.branch);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialFilters.category);
  const [dateFrom, setDateFrom] = useState<string | undefined>(initialFilters.dateFrom);
  const [dateTo, setDateTo] = useState<string | undefined>(initialFilters.dateTo);
  const [minAmount, setMinAmount] = useState<string>(
    initialFilters.minAmount ? initialFilters.minAmount.toString() : ""
  );
  const [maxAmount, setMaxAmount] = useState<string>(
    initialFilters.maxAmount ? initialFilters.maxAmount.toString() : ""
  );

  // Apply filters to URL and trigger callback
  const applyFilters = () => {
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams);
      
      // Set search params
      if (searchTerm) {
        newParams.set("search", searchTerm);
      } else {
        newParams.delete("search");
      }
      
      if (selectedStatus) {
        newParams.set("status", selectedStatus);
      } else {
        newParams.delete("status");
      }
      
      if (selectedBranch) {
        newParams.set("branch", selectedBranch);
      } else {
        newParams.delete("branch");
      }
      
      if (selectedCategory) {
        newParams.set("category", selectedCategory);
      } else {
        newParams.delete("category");
      }
      
      if (dateFrom) {
        newParams.set("dateFrom", dateFrom);
      } else {
        newParams.delete("dateFrom");
      }
      
      if (dateTo) {
        newParams.set("dateTo", dateTo);
      } else {
        newParams.delete("dateTo");
      }
      
      if (minAmount) {
        newParams.set("minAmount", minAmount);
      } else {
        newParams.delete("minAmount");
      }
      
      if (maxAmount) {
        newParams.set("maxAmount", maxAmount);
      } else {
        newParams.delete("maxAmount");
      }
      
      // Update URL
      router.push(`${pathname}?${newParams.toString()}`);
      
      // Trigger callback with all filters
      onFilterChange({
        search: searchTerm,
        status: selectedStatus,
        branch: selectedBranch,
        category: selectedCategory,
        dateFrom: dateFrom,
        dateTo: dateTo,
        minAmount: minAmount ? Number(minAmount) : undefined,
        maxAmount: maxAmount ? Number(maxAmount) : undefined,
      });
    });
  };

  // Immediate search on search term change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    startTransition(() => {
      applyFilters();
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus(undefined);
    setSelectedBranch(undefined);
    setSelectedCategory(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
    setMinAmount("");
    setMaxAmount("");
    
    router.push(pathname);
    
    onFilterChange({});
  };

  // Check if any filters are applied
  const hasActiveFilters = 
    searchTerm || 
    selectedStatus || 
    selectedBranch || 
    selectedCategory || 
    dateFrom || 
    dateTo || 
    minAmount || 
    maxAmount;

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search RFPs..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 w-9 px-2.5"
              onClick={() => handleSearchChange("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>

        {/* Filter Button and Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="min-w-[120px]">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-primary"></span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              {/* Status Filter */}
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={selectedStatus || ""}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.id} value={status.name}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch Filter */}
              <div className="grid gap-2">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={selectedBranch || ""}
                  onValueChange={setSelectedBranch}
                >
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Branches</SelectItem>
                    {branchOptions.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategory || ""}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filters - Using simple inputs instead of calendar */}
              <div className="grid gap-2">
                <Label>Request Date Range</Label>
                <div className="flex gap-2">
                  <div className="w-full">
                    <Label htmlFor="dateFrom" className="sr-only">From date</Label>
                    <div className="relative">
                      <Input 
                        id="dateFrom"
                        type="date"
                        value={dateFrom || ""}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <Label htmlFor="dateTo" className="sr-only">To date</Label>
                    <div className="relative">
                      <Input 
                        id="dateTo"
                        type="date"
                        value={dateTo || ""}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Range Filters */}
              <div className="grid gap-2">
                <Label>Amount Range</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min amount"
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                  <Input
                    placeholder="Max amount"
                    type="number" 
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <SheetFooter>
              <div className="flex justify-between w-full">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                >
                  Clear Filters
                </Button>
                <SheetClose asChild>
                  <Button onClick={applyFilters}>Apply Filters</Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          {selectedStatus && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => {
                setSelectedStatus(undefined);
                applyFilters();
              }}
            >
              Status: {selectedStatus}
              <X className="h-3 w-3" />
            </Button>
          )}
          {selectedBranch && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => {
                setSelectedBranch(undefined);
                applyFilters();
              }}
            >
              Branch: {selectedBranch}
              <X className="h-3 w-3" />
            </Button>
          )}
          {selectedCategory && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => {
                setSelectedCategory(undefined);
                applyFilters();
              }}
            >
              Category: {selectedCategory}
              <X className="h-3 w-3" />
            </Button>
          )}
          {dateFrom && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => {
                setDateFrom(undefined);
                applyFilters();
              }}
            >
              From: {dateFrom}
              <X className="h-3 w-3" />
            </Button>
          )}
          {dateTo && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => {
                setDateTo(undefined);
                applyFilters();
              }}
            >
              To: {dateTo}
              <X className="h-3 w-3" />
            </Button>
          )}
          {minAmount && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => {
                setMinAmount("");
                applyFilters();
              }}
            >
              Min: {minAmount}
              <X className="h-3 w-3" />
            </Button>
          )}
          {maxAmount && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => {
                setMaxAmount("");
                applyFilters();
              }}
            >
              Max: {maxAmount}
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
} 