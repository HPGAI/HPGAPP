"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, PlusCircle, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";

// Define the Rfp type
export type Rfp = {
  id: number;
  branch: string | null;
  proposal_no: string | null;
  file_no: string | null;
  name: string | null;
  status: string | null;
  request_date: string | null;
  deadline: string | null;
  sent_date: string | null;
  quoted_amount: number | null;
  revised_amount: number | null;
  currency: string | null;
  conversion: number | null;
  location_id: string | null;
  project_details_id: string | null;
  category: string | null;
  sub_category: string | null;
  operator: string | null;
  brand: string | null;
  contacts_id: string | null;
  lead_generator: string | null;
  lead_closer: string | null;
  followup_id: string | null;
  drive: string | null;
  path: string | null;
};

// Sample data for development and testing only
const sampleData: Rfp[] = [
  {
    id: 1,
    branch: "Main Branch",
    proposal_no: "RFP-2025-001",
    file_no: "F001",
    name: "Office Equipment Upgrade",
    status: "Pending",
    request_date: "2025-03-01",
    deadline: "2025-03-30",
    sent_date: "2025-03-05",
    quoted_amount: 25000,
    revised_amount: null,
    currency: "USD",
    conversion: null,
    location_id: "LOC-001",
    project_details_id: "PD-001",
    category: "Equipment",
    sub_category: "Office",
    operator: "John Doe",
    brand: "Various",
    contacts_id: "CONT-001",
    lead_generator: "Jane Smith",
    lead_closer: "Mike Johnson",
    followup_id: "FU-001",
    drive: "G",
    path: "/proposals/2025/Q1",
  },
  {
    id: 2,
    branch: "East Branch",
    proposal_no: "RFP-2025-002",
    file_no: "F002",
    name: "Software Licensing",
    status: "Approved",
    request_date: "2025-02-15",
    deadline: "2025-03-15",
    sent_date: "2025-02-20",
    quoted_amount: 35000,
    revised_amount: 32000,
    currency: "USD",
    conversion: null,
    location_id: "LOC-002",
    project_details_id: "PD-002",
    category: "Software",
    sub_category: "Licensing",
    operator: "Susan White",
    brand: "Microsoft",
    contacts_id: "CONT-002",
    lead_generator: "Robert Brown",
    lead_closer: "Lisa Green",
    followup_id: "FU-002",
    drive: "G",
    path: "/proposals/2025/Q1",
  },
];

// Define the form schema
const formSchema = z.object({
  branch: z.string().optional().nullable(),
  proposal_no: z.string().optional().nullable(),
  file_no: z.string().optional().nullable(),
  name: z.string().min(1, { message: "Name is required" }),
  status: z.string().optional().nullable(),
  request_date: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  sent_date: z.string().optional().nullable(),
  quoted_amount: z.coerce.number().optional().nullable(),
  revised_amount: z.coerce.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  sub_category: z.string().optional().nullable(),
});

interface RfpsTableProps {
  initialData?: Rfp[];
}

export function RfpsTable({ initialData = [] }: RfpsTableProps) {
  const [data, setData] = useState<Rfp[]>(initialData);

  // Use a simple table instead of the complex one
  return (
    <div className="overflow-x-auto rounded-md border">
      <div className="flex items-center py-4 px-4">
        <Input
          placeholder="Filter RFPs..."
          className="max-w-sm"
        />
      </div>
      <table className="w-full min-w-full table-auto">
        <thead className="bg-muted/50">
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Proposal #</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Request Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Deadline</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                No RFPs found
              </td>
            </tr>
          ) : (
            data.map((rfp) => (
              <tr key={rfp.id} className="border-b">
                <td className="px-4 py-3 text-sm">{rfp.id}</td>
                <td className="px-4 py-3 text-sm">{rfp.proposal_no || '-'}</td>
                <td className="px-4 py-3 text-sm font-medium">{rfp.name || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${rfp.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                    ${rfp.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${rfp.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {rfp.status || 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{rfp.request_date || '-'}</td>
                <td className="px-4 py-3 text-sm">{rfp.deadline || '-'}</td>
                <td className="px-4 py-3 text-sm text-right">
                  {rfp.quoted_amount 
                    ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: rfp.currency || 'USD'
                      }).format(rfp.quoted_amount)
                    : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="p-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data.length} RFPs
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add RFP
          </Button>
        </div>
      </div>
    </div>
  );
} 