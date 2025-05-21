import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { interestFormSchema, type InterestForm } from "@shared/schema";

interface InterestFormProps {
  candidateId: number;
}

const InterestForm = ({ candidateId }: InterestFormProps) => {
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast } = useToast();

  const form = useForm<InterestForm>({
    resolver: zodResolver(interestFormSchema),
    defaultValues: {
      candidateId,
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const submitInterest = useMutation({
    mutationFn: async (data: InterestForm) => {
      const res = await apiRequest("POST", "/api/interests", data);
      return await res.json();
    },
    onSuccess: () => {
      setSubmissionStatus("success");
      toast({
        title: "Interest submitted",
        description: "Your interest has been submitted successfully.",
      });
    },
    onError: (error) => {
      setSubmissionStatus("error");
      toast({
        title: "Error submitting interest",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InterestForm) => {
    submitInterest.mutate(data);
  };

  if (submissionStatus === "success") {
    return (
      <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        <AlertDescription className="mt-3">
          <h3 className="text-lg font-medium mb-2">Thank you for your interest!</h3>
          <p className="mb-4">
            Your interest has been submitted successfully. The candidate will be notified,
            and you may be contacted for further discussion.
          </p>
          <Button onClick={() => setSubmissionStatus("idle")}>Submit Another Interest</Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Express Interest in this Candidate</h3>
        <p className="text-sm text-muted-foreground">
          Fill out the form below to express your interest in this candidate. Your information
          will be shared with the candidate, and they may contact you directly.
        </p>
      </div>

      {submissionStatus === "error" && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            There was an error submitting your interest. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter additional details about your interest (optional)"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Include any specific information about the role, compensation, or requirements.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={submitInterest.isPending}
            >
              {submitInterest.isPending ? "Submitting..." : "Submit Interest"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default InterestForm;
