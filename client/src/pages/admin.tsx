import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CandidateList from "@/components/admin/candidate-list";
import CandidateForm from "@/components/admin/candidate-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatExperienceYears, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/lib/firebase";
import Login from "@/components/auth/login";
import { type Interest } from "@shared/schema";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("candidates");
  const { user, loading, isAdmin } = useAuth();
  
  const { data: interests = [] } = useQuery<(Interest & { candidateName?: string })[]>({
    queryKey: ["/api/interests"]
  });

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Login />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            Welcome, {user?.displayName || user?.email}
          </span>
          <Button variant="outline" onClick={handleSignOut} className="flex items-center space-x-2">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="candidates">Candidate Management</TabsTrigger>
          <TabsTrigger value="interests">Interest Requests</TabsTrigger>
          <TabsTrigger value="add-candidate">Add New Candidate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="candidates">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Management</CardTitle>
              <CardDescription>
                View, edit, or delete candidate profiles. Toggle candidate visibility in the marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CandidateList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="interests">
          <Card>
            <CardHeader>
              <CardTitle>Interest Requests</CardTitle>
              <CardDescription>
                View and manage interest requests from potential employers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {interests.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No interest requests yet. When companies express interest in candidates, they'll appear here.
                </p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interests.map((interest) => (
                        <TableRow key={interest.id}>
                          <TableCell>
                            {interest.candidateName || `Candidate #${interest.candidateId}`}
                          </TableCell>
                          <TableCell>{interest.companyName}</TableCell>
                          <TableCell>{interest.contactName}</TableCell>
                          <TableCell>{interest.email}</TableCell>
                          <TableCell>{interest.phone || "—"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                interest.status === "new" ? "default" :
                                interest.status === "contacted" ? "secondary" :
                                interest.status === "accepted" ? "outline" :
                                "destructive"
                              }
                            >
                              {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {interest.createdAt ? formatDateTime(interest.createdAt) : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add-candidate">
          <Card>
            <CardHeader>
              <CardTitle>Add New Candidate</CardTitle>
              <CardDescription>
                Create a new candidate profile to showcase in the talent marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CandidateForm onSuccess={() => setActiveTab("candidates")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
