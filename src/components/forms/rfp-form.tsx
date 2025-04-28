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
import { Separator } from "../../components/ui/separator";
import { toast } from "../../components/ui/use-toast";
import { ContactSelector } from "./contact-selector";
import { fetchCurrencies, type Currency, calculateExchangeRate } from "../../lib/currency";
import { branchOptions, fetchRfpStatuses, type RfpStatus } from "../../lib/rfp-options";

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
  contacts_id: z.number().optional().nullable(),
});

export type RfpFormValues = z.infer<typeof rfpFormSchema>;

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
    contacts_id?: number | null;
  };
  isEditMode?: boolean;
}

export function RfpForm({ onSuccess, onCancel, defaultValues, isEditMode = false }: RfpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [statuses, setStatuses] = useState<RfpStatus[]>([]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [showConversion, setShowConversion] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

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
      currency: defaultValues?.currency || "INR",
      contacts_id: defaultValues?.contacts_id || null,
    },
  });

  // Fetch currencies from Supabase
  useEffect(() => {
    async function loadCurrencies() {
      setIsLoadingCurrencies(true);
      try {
        const currencyData = await fetchCurrencies();
        setCurrencies(currencyData);
        
        // Find the default or selected currency
        const currencyCode = form.getValues("currency") || "INR";
        const currency = currencyData.find(c => c.code === currencyCode);
        if (currency) {
          setSelectedCurrency(currency);
        }
      } catch (error) {
        console.error('Error fetching currencies:', error);
        // Fallback to default currency (INR) if fetching fails
        setCurrencies([
          { id: 1, code: 'INR', name: 'Indian Rupee', symbol: '₹', conversion_rate: 1 }
        ]);
      } finally {
        setIsLoadingCurrencies(false);
      }
    }
    
    loadCurrencies();
  }, [form]);
  
  // Fetch RFP statuses from Supabase
  useEffect(() => {
    async function loadStatuses() {
      setIsLoadingStatuses(true);
      try {
        const statusData = await fetchRfpStatuses();
        setStatuses(statusData);
      } catch (error) {
        console.error('Error fetching RFP statuses:', error);
        // Fallback to hardcoded statuses if fetching fails
        setStatuses([
          { id: 1, name: 'Pending' },
          { id: 2, name: 'Approved' },
          { id: 3, name: 'Rejected' },
          { id: 4, name: 'In Review' },
          { id: 5, name: 'Completed' },
          { id: 6, name: 'In Progress' },
          { id: 7, name: 'On Hold' },
          { id: 8, name: 'Cancelled' }
        ]);
      } finally {
        setIsLoadingStatuses(false);
      }
    }
    
    loadStatuses();
  }, [form]);

  // Update the converted amount when the quoted amount or currency changes
  useEffect(() => {
    if (selectedCurrency && selectedCurrency.code !== 'INR') {
      const amount = form.getValues('quoted_amount');
      if (amount && !isNaN(amount)) {
        // Convert to INR using the stored conversion rate
        const inrAmount = amount * selectedCurrency.conversion_rate;
        setConvertedAmount(Math.round(inrAmount * 100) / 100);
        setShowConversion(true);
      } else {
        setConvertedAmount(null);
        setShowConversion(false);
      }
    } else {
      setShowConversion(false);
    }
  }, [selectedCurrency, form.watch('quoted_amount')]);

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
        currency: defaultValues.currency || "INR",
        contacts_id: defaultValues.contacts_id || null,
      });
    }
  }, [defaultValues, form]);

  // Set today's date as the default request date if not already set
  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    const requestDate = form.getValues("request_date");
    
    if (!requestDate || requestDate.trim() === "") {
      form.setValue("request_date", currentDate);
    }
  }, [form]);

  async function onSubmit(values: RfpFormValues) {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      
      // Clean up empty values before submitting
      const cleanedValues = {
        ...values,
        // Ensure request_date is properly set
        request_date: values.request_date && values.request_date.trim() !== "" ? values.request_date : null,
        // Ensure deadline is properly set to null if empty
        deadline: values.deadline && values.deadline.trim() !== "" ? values.deadline : null,
        // Ensure quoted_amount is null if undefined or empty string
        quoted_amount: values.quoted_amount === undefined ? null : values.quoted_amount,
      };
      
      if (isEditMode && defaultValues?.id) {
        // Log update attempt for debugging
        console.log("Updating RFP with ID:", defaultValues.id, "Values:", cleanedValues);
        
        // Update existing RFP
        const { data, error } = await supabase
          .from("rfps")
          .update(cleanedValues)
          .eq("id", defaultValues.id)
          .select();
        
        if (error) throw error;
        
        console.log("Update response:", data);
        
        toast({
          title: "RFP updated successfully",
          description: `RFP "${values.name}" has been updated.`,
        });
      } else {
        // Create new RFP
        const { error } = await supabase
          .from("rfps")
          .insert([cleanedValues]);
        
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
  
  // Branch dropdown component
  const BranchField = () => (
    <FormField
      control={form.control}
      name="branch"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Branch</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || ""}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {branchOptions.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  // Status dropdown component
  const StatusField = () => (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Status *</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || "Pending"}
            disabled={isLoadingStatuses}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.id} value={status.name}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoadingStatuses && <p className="text-xs text-muted-foreground">Loading statuses...</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // Currency dropdown component
  const CurrencyField = () => (
    <FormField
      control={form.control}
      name="currency"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>Currency</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              const currency = currencies.find(c => c.code === value);
              if (currency) {
                setSelectedCurrency(currency);
              }
            }}
            defaultValue={field.value || "INR"}
            value={field.value || "INR"}
            disabled={isLoadingCurrencies}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoadingCurrencies && <p className="text-xs text-muted-foreground">Loading currencies...</p>}
          {selectedCurrency && selectedCurrency.code !== 'INR' && (
            <p className="text-xs text-muted-foreground">
              Conversion rate: 1 {selectedCurrency.code} = {selectedCurrency.conversion_rate.toFixed(4)} INR
            </p>
          )}
          {showConversion && convertedAmount !== null && (
            <p className="text-xs text-muted-foreground mt-1">
              Equivalent: ₹ {convertedAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} INR
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );

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
          
          <BranchField />
          
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
          
          <StatusField />
          
          <FormField
            control={form.control}
            name="request_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Request Date *</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value || new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      // If empty, set to today's date
                      const value = e.target.value || new Date().toISOString().split("T")[0];
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
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deadline</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value || ""}
                    onChange={(e) => {
                      // Allow empty value (it will be converted to null later)
                      field.onChange(e.target.value);
                    }}
                  />
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
                    value={field.value === null || field.value === undefined ? "" : field.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      // Empty string becomes null, otherwise convert to number
                      const value = e.target.value === "" ? null : parseFloat(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <CurrencyField />
        </div>
        
        <div className="my-6">
          <Separator className="my-4" />
          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
          
          <FormField
            control={form.control}
            name="contacts_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Contact</FormLabel>
                <FormControl>
                  <ContactSelector 
                    value={field.value || null} 
                    onChange={(value) => field.onChange(value)}
                  />
                </FormControl>
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