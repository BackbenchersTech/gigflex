import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText } from "lucide-react";
import { availabilityOptions } from "@/lib/utils";
import { candidateFormSchema, type CandidateForm, type Candidate } from "@shared/schema";

interface CandidateFormProps {
  candidate?: Candidate;
  onSuccess?: () => void;
}

const CandidateForm = ({ candidate, onSuccess }: CandidateFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!candidate;

  const form = useForm<CandidateForm>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      initials: candidate?.initials || "",
      profileImageUrl: candidate?.profileImageUrl || "",
      fullName: candidate?.fullName || "",
      title: candidate?.title || "",
      location: candidate?.location || "",
      skills: candidate?.skills || [],
      experienceYears: candidate?.experienceYears || 0,
      bio: candidate?.bio || "",
      education: candidate?.education || "",
      availability: candidate?.availability || "Immediate",
      contactEmail: candidate?.contactEmail || "",
      contactPhone: candidate?.contactPhone || "",
      certifications: candidate?.certifications || [],
      billRate: candidate?.billRate || undefined,
      payRate: candidate?.payRate || undefined,
      isActive: candidate?.isActive ?? true,
    },
  });

  const saveCandidate = useMutation({
    mutationFn: async (data: CandidateForm) => {
      // Handle skills and certifications properly for editing
      let skills = data.skills;
      let certifications = data.certifications || [];
      
      // If skills is a string, convert it (this shouldn't happen with our updated schema)
      if (typeof skills === 'string') {
        skills = skills.split(',').map(s => s.trim()).filter(Boolean);
      }
      
      // If certifications is a string, convert it
      if (typeof certifications === 'string') {
        certifications = certifications.split(',').map(s => s.trim()).filter(Boolean);
      }
      
      // Process bill rate and pay rate
      const billRate = data.billRate === undefined || data.billRate === null || data.billRate === "" 
        ? undefined 
        : typeof data.billRate === 'string' ? parseInt(data.billRate as string) : data.billRate;
        
      const payRate = data.payRate === undefined || data.payRate === null || data.payRate === "" 
        ? undefined 
        : typeof data.payRate === 'string' ? parseInt(data.payRate as string) : data.payRate;
        
      // Create cleaned data object
      const cleanedData = {
        ...data,
        initials: data.initials || '', // Ensure initials are sent even if empty
        skills,
        certifications,
        billRate,
        payRate,
        // Explicitly set these fields even when they're empty
        profileImageUrl: data.profileImageUrl === '' ? null : data.profileImageUrl,
        contactEmail: data.contactEmail === '' ? null : data.contactEmail,
        contactPhone: data.contactPhone === '' ? null : data.contactPhone
      };
      
      console.log("Submitting data:", cleanedData);
      
      if (isEditing) {
        const res = await apiRequest("PUT", `/api/candidates/${candidate.id}`, cleanedData);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/candidates", cleanedData);
        return await res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Candidate updated" : "Candidate created",
        description: isEditing
          ? "The candidate has been updated successfully."
          : "The candidate has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: `Error ${isEditing ? "updating" : "creating"} candidate`,
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CandidateForm) => {
    saveCandidate.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Full name will be private, only initials will be shown publicly.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="initials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initials *</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. JD" maxLength={3} {...field} />
                  </FormControl>
                  <FormDescription>
                    Initials to display in the candidate list (1-3 characters).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profileImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional profile image URL. If not provided, initials will be displayed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Full Stack Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. San Francisco, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experienceYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0} 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availabilityOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="E.g. JavaScript, React, Node.js (comma separated)"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter skills separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief professional bio"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education *</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. BS in Computer Science, Stanford" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certifications</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="E.g. AWS Certified Developer, Google Cloud Associate (comma separated)"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter certifications separated by commas (optional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email (private)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone (private)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Rate ($/hr)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        placeholder="Hourly bill rate" 
                        value={field.value ?? ''} 
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value) : undefined);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      The hourly rate charged to clients.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pay Rate ($/hr)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        placeholder="Hourly pay rate"
                        value={field.value ?? ''} 
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value) : undefined);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      The hourly rate paid to the candidate (internal only).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 border rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription>
                      Inactive candidates will not be shown in the candidate list.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={saveCandidate.isPending}>
            {saveCandidate.isPending 
              ? `${isEditing ? "Updating" : "Creating"}...` 
              : isEditing ? "Update Candidate" : "Create Candidate"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CandidateForm;
