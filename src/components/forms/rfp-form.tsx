"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createClient } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "../../components/ui/use-toast";

// Define the form schema using Zod
const rfpFormSchema = z.object({
  branch: z.string().optional().nullable(),
  proposal_no: z.string().min(1, "Proposal number is required"),
  file_no: z.string().optional().nullable(),
  name: z.string().min(1, "Name is required"),
  status: z.string().min(1, "Status is required"),
  request_date: z.string().min(1, "Request date is required"),
  deadline: z.string().optional().nullable(),
  quoted_amount: z.coerce.number().optional().nullable(),
  currency: z.string().optional(),
});

export type RfpFormValues = z.infer<typeof rfpFormSchema>;

// Status options
const statusOptions = [
  "Pending",
  "Approved",
  "Rejected",
  "In Review",
  "Completed",
  "In Progress",
  "On Hold",
  "Cancelled",
];

// Currency options
const currencyOptions = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];

interface RfpFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultValues?: {
    id?: number;
    branch?: string | null;
    proposal_no?: string | null;
    file_no?: string | null;
    name?: string | null;
    status?: string | null;
    request_date?: string | null;
    deadline?: string | null;
    quoted_amount?: number | null;
    currency?: string | null;
  };
  isEditMode?: boolean;
}

export function RfpForm({ onSuccess, onCancel, defaultValues, isEditMode = false }: RfpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<RfpFormValues>({
    resolver: zodResolver(rfpFormSchema),
    defaultValues: {
      branch: defaultValues?.branch || "",
      proposal_no: defaultValues?.proposal_no || "",
      file_no: defaultValues?.file_no || "",
      name: defaultValues?.name || "",
      status: defaultValues?.status || "Pending",
      request_date: defaultValues?.request_date || new Date().toISOString().split("T")[0],
      deadline: defaultValues?.deadline || "",
      quoted_amount: defaultValues?.quoted_amount || null,
      currency: defaultValues?.currency || "USD",
    },
  });

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        branch: defaultValues.branch || "",
        proposal_no: defaultValues.proposal_no || "",
        file_no: defaultValues.file_no || "",
        name: defaultValues.name || "",
        status: defaultValues.status || "Pending",
        request_date: defaultValues.request_date || new Date().toISOString().split("T")[0],
        deadline: defaultValues.deadline || "",
        quoted_amount: defaultValues.quoted_amount || null,
        currency: defaultValues.currency || "USD",
      });
    }
  }, [defaultValues, form]);

  async function onSubmit(values: RfpFormValues) {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      
      if (isEditMode && defaultValues?.id) {
        // Update existing RFP
        const { error } = await supabase
          .from("rfps")
          .update(values)
          .eq("id", defaultValues.id);
        
        if (error) throw error;
        
        toast({
          title: "RFP updated successfully",
          description: `RFP "${values.name}" has been updated.`,
        });
      } else {
        // Create new RFP
        const { error } = await supabase
          .from("rfps")
          .insert([values]);
        
        if (error) throw error;
        
        toast({
          title: "RFP created successfully",
          description: `RFP "${values.name}" has been created.`,
        });
      }
      
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} RFP:`, error);
      toast({
        variant: "destructive",
        title: `Failed to ${isEditMode ? 'update' : 'create'} RFP`,
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="proposal_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proposal Number *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter proposal number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="file_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter file number" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>
                <FormControl>
                  <Input placeholder="Enter branch" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter RFP name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="request_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Request Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deadline</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="quoted_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quoted Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter amount" 
                    {...field} 
                    value={field.value === null ? "" : field.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value === "" ? null : Number(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem className="w-1/3">
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || "USD"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencyOptions.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditMode ? "Update RFP" : "Create RFP"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 