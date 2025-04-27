"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "../../components/ui/use-toast";
import { PlusCircle, SearchIcon, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";

// Type definitions
export type Contact = {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  designation: string | null;
  company_id: number | null;
  is_primary: boolean;
};

export type Company = {
  id: number;
  name: string;
  hq_location: string | null;
  industry: string | null;
};

export type ContactWithCompany = Contact & {
  company_name: string | null;
  hq_location: string | null;
};

// Zod schemas for form validation
const contactFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  company_id: z.coerce.number().optional().nullable(),
  is_primary: z.boolean().default(false),
});

const companyFormSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  hq_location: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface ContactSelectorProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export function ContactSelector({ value, onChange }: ContactSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("select");
  const [contacts, setContacts] = useState<ContactWithCompany[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactWithCompany | null>(null);
  const [isNewCompanyDialogOpen, setIsNewCompanyDialogOpen] = useState(false);

  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      designation: "",
      company_id: null,
      is_primary: false,
    }
  });

  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      hq_location: "",
      industry: "",
      website: "",
    }
  });

  // Load contacts and selected contact data
  useEffect(() => {
    fetchContacts();
    fetchCompanies();
    if (value) {
      fetchSelectedContact(value);
    }
  }, [value]);

  // Fetch contacts from Supabase
  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .rpc('get_contacts_with_company');
      
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        variant: "destructive",
        title: "Failed to load contacts",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch companies from Supabase
  const fetchCompanies = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  // Fetch the selected contact details
  const fetchSelectedContact = async (contactId: number) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .rpc('get_contact_by_id', { p_contact_id: contactId });
      
      if (error) throw error;
      if (data && data.length > 0) {
        setSelectedContact(data[0]);
      }
    } catch (error) {
      console.error("Error fetching selected contact:", error);
    }
  };

  // Create a new contact
  const handleCreateContact = async (values: ContactFormValues) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('contacts')
        .insert([values])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        onChange(data[0].id);
        toast({
          title: "Contact created successfully",
          description: `${values.first_name} ${values.last_name} has been added.`,
        });
        await fetchContacts();
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      toast({
        variant: "destructive",
        title: "Failed to create contact",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new company
  const handleCreateCompany = async (values: CompanyFormValues) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('companies')
        .insert([values])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newCompany = data[0];
        toast({
          title: "Company created successfully",
          description: `${values.name} has been added.`,
        });
        
        // Update companies list
        setCompanies([...companies, newCompany]);
        
        // Set the new company as the selected company in the contact form
        contactForm.setValue('company_id', newCompany.id);
        
        // Close the company dialog
        setIsNewCompanyDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating company:", error);
      toast({
        variant: "destructive",
        title: "Failed to create company",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  // Filter contacts by search term
  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
    const companyName = (contact.company_name || "").toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || 
           companyName.includes(searchLower) ||
           (contact.email && contact.email.toLowerCase().includes(searchLower));
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        {selectedContact ? (
          <div className="flex-1 p-2 border rounded-md flex items-center justify-between">
            <div>
              <div className="font-medium">
                {selectedContact.first_name} {selectedContact.last_name}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {selectedContact.company_name && (
                  <span>{selectedContact.company_name}</span>
                )}
                {selectedContact.designation && (
                  <>
                    <span className="text-xs">•</span>
                    <span>{selectedContact.designation}</span>
                  </>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTab("select");
                setIsOpen(true);
              }}
            >
              Change
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab("select");
              setIsOpen(true);
            }}
          >
            <SearchIcon className="h-4 w-4 mr-2" />
            Select a contact
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Selection</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select">Select Existing</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>
            
            <TabsContent value="select" className="space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts by name, company or email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading contacts...
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No contacts found. Try a different search or create a new contact.
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <div 
                      key={contact.id}
                      className={`p-3 cursor-pointer hover:bg-muted flex items-center justify-between ${value === contact.id ? 'bg-muted' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChange(contact.id);
                        setIsOpen(false);
                      }}
                    >
                      <div>
                        <div className="font-medium">
                          {contact.first_name} {contact.last_name}
                          {contact.is_primary && (
                            <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                          {contact.company_name && (
                            <span>{contact.company_name}</span>
                          )}
                          {contact.designation && (
                            <>
                              <span className="text-xs">•</span>
                              <span>{contact.designation}</span>
                            </>
                          )}
                        </div>
                        {contact.email && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {contact.email}
                          </div>
                        )}
                      </div>
                      
                      {value === contact.id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="create">
              <Form {...contactForm}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={contactForm.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={contactForm.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={contactForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="john.doe@example.com" 
                            {...field} 
                            value={field.value || ""} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={contactForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+1 (555) 123-4567" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={contactForm.control}
                      name="designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="CEO, Manager, etc." 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <FormField
                      control={contactForm.control}
                      name="company_id"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Company</FormLabel>
                          <div className="flex gap-2">
                            <Select
                              onValueChange={(value) => field.onChange(Number(value) || null)}
                              value={field.value?.toString() || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select company" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {companies.map((company) => (
                                  <SelectItem key={company.id} value={company.id.toString()}>
                                    {company.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsNewCompanyDialogOpen(true)}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <FormField
                    control={contactForm.control}
                    name="is_primary"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Primary Contact</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            This contact is the primary point of contact for their company
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      disabled={isLoading}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        contactForm.handleSubmit(handleCreateContact)(e);
                      }}
                    >
                      {isLoading ? "Creating..." : "Create Contact"}
                    </Button>
                  </DialogFooter>
                </div>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* New Company Dialog */}
      <Dialog open={isNewCompanyDialogOpen} onOpenChange={setIsNewCompanyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
          </DialogHeader>
          
          <Form {...companyForm}>
            <div className="space-y-4">
              <FormField
                control={companyForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Technology, Manufacturing, etc." 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={companyForm.control}
                  name="hq_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HQ Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="New York, USA" 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={companyForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com" 
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsNewCompanyDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    companyForm.handleSubmit(handleCreateCompany)(e);
                  }}
                >
                  Create Company
                </Button>
              </DialogFooter>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 