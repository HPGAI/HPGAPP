"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Card } from "../../../components/ui/card";

type RfpData = {
  id: number;
  name: string;
  status?: string;
  created_at?: string;
  company?: string;
  budget?: number;
  description?: string;
};

interface SimpleRfpsTableProps {
  data: RfpData[];
  title?: string;
}

export function SimpleRfpsTable({ data, title = "RFPs List" }: SimpleRfpsTableProps) {
  // Format date nicely if available
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Format currency if available
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    if (!status) return "default";
    
    switch (status.toLowerCase()) {
      case "open":
      case "active":
        return "success";
      case "closed":
      case "completed":
        return "secondary";
      case "pending":
      case "review":
        return "warning";
      case "demo":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Showing {data.length} {data.length === 1 ? "record" : "records"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No RFPs found
                </TableCell>
              </TableRow>
            ) : (
              data.map((rfp) => (
                <TableRow key={rfp.id}>
                  <TableCell className="font-medium">{rfp.id}</TableCell>
                  <TableCell>{rfp.name || "Unnamed"}</TableCell>
                  <TableCell>{rfp.company || "N/A"}</TableCell>
                  <TableCell>{formatDate(rfp.created_at)}</TableCell>
                  <TableCell>{formatCurrency(rfp.budget)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getStatusColor(rfp.status) as any}>
                      {rfp.status || "Unknown"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
} 