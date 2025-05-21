import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Pencil, 
  Trash, 
  Eye, 
  Search, 
  Mail, 
  Plus, 
  X,
  MoreHorizontal,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CandidateForm from "@/components/admin/candidate-form";
import CandidateDetail from "@/components/candidate-detail";
import { type Candidate } from "@shared/schema";

const CandidateList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { data: candidates = [], isLoading, error } = useQuery({
    queryKey: ["/api/candidates"],
    select: (data: Candidate[]) => {
      // First filter by active/inactive status
      let filteredData = showInactive 
        ? data 
        : data.filter(candidate => candidate.isActive);
        
      // Then apply search query if it exists
      if (!searchQuery) return filteredData;
      
      const lowerCaseQuery = searchQuery.toLowerCase();
      return filteredData.filter(
        candidate => 
          candidate.fullName.toLowerCase().includes(lowerCaseQuery) ||
          candidate.title.toLowerCase().includes(lowerCaseQuery) ||
          candidate.skills.some(skill => skill.toLowerCase().includes(lowerCaseQuery))
      );
    }
  });

  const toggleCandidateStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/candidates/${id}`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({
        title: "Status updated",
        description: "Candidate status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating status",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const deleteCandidate = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/candidates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({
        title: "Candidate deleted",
        description: "Candidate has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error deleting candidate",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleToggleStatus = (candidate: Candidate) => {
    toggleCandidateStatus.mutate({
      id: candidate.id,
      isActive: !candidate.isActive,
    });
  };

  const handleDeleteClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCandidate) {
      deleteCandidate.mutate(selectedCandidate.id);
    }
  };

  const handleEditClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsFormDialogOpen(true);
  };

  const handleViewClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsViewDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCandidate(null);
    setIsFormDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Candidates</h2>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-5 w-5"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-inactive" 
            checked={showInactive}
            onCheckedChange={(checked) => setShowInactive(checked === true)}
          />
          <Label htmlFor="show-inactive" className="text-sm font-medium cursor-pointer">
            Show inactive candidates
          </Label>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search candidates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-5 w-5"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading candidates...</div>
      ) : error ? (
        <div className="text-center py-4 text-destructive">
          Error loading candidates. Please try again.
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-background">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No candidates found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery 
              ? "No candidates match your search criteria." 
              : "Get started by adding a new candidate."}
          </p>
          <Button className="mt-4" onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Candidate
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Bill Rate</TableHead>
                <TableHead>Pay Rate</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {candidate.profileImageUrl ? (
                          <AvatarImage 
                            src={candidate.profileImageUrl} 
                            alt={candidate.initials} 
                          />
                        ) : (
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {candidate.initials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{candidate.fullName}</p>
                        <p className="text-sm text-muted-foreground">{candidate.location}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{candidate.title}</TableCell>
                  <TableCell>{candidate.experienceYears} years</TableCell>
                  <TableCell>{candidate.billRate ? `$${candidate.billRate}/hr` : "—"}</TableCell>
                  <TableCell>{candidate.payRate ? `$${candidate.payRate}/hr` : "—"}</TableCell>
                  <TableCell>{candidate.availability}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={candidate.isActive}
                        onCheckedChange={() => handleToggleStatus(candidate)}
                        disabled={toggleCandidateStatus.isPending}
                      />
                      <span className={candidate.isActive ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                        {candidate.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewClick(candidate)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(candidate)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            View Interests
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(candidate)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit/Create Candidate Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCandidate ? "Edit Candidate" : "Add New Candidate"}
            </DialogTitle>
          </DialogHeader>
          <CandidateForm 
            candidate={selectedCandidate || undefined} 
            onSuccess={() => setIsFormDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Candidate Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <CandidateDetail 
              candidate={selectedCandidate} 
              onClose={() => setIsViewDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCandidate?.fullName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCandidate.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CandidateList;
