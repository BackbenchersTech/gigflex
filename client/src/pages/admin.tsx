import AnalyticsDashboard from '@/components/admin/analytics-dashboard';
import CandidateForm from '@/components/admin/candidate-form';
import CandidateList from '@/components/admin/candidate-list';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/lib/utils';
import { type Interest } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation } from 'wouter';

const AdminPage = () => {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('candidates');
  const { loading, isAdmin } = useAuth();

  const { data: interests = [] } = useQuery<
    (Interest & { candidateName?: string })[]
  >({
    queryKey: ['/api/interests'],
  });

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (!isAdmin) {
    navigate('/');
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-6xl'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-4 mb-8'>
          <TabsTrigger value='candidates'>Candidate Management</TabsTrigger>
          <TabsTrigger value='interests'>Interest Requests</TabsTrigger>
          <TabsTrigger value='add-candidate'>Add New Candidate</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='candidates'>
          <Card>
            <CardHeader>
              <CardTitle>Candidate Management</CardTitle>
              <CardDescription>
                View, edit, or delete candidate profiles. Toggle candidate
                visibility in the marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CandidateList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='interests'>
          <Card>
            <CardHeader>
              <CardTitle>Interest Requests</CardTitle>
              <CardDescription>
                View and manage interest requests from potential employers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {interests.length === 0 ? (
                <p className='text-center py-8 text-muted-foreground'>
                  No interest requests yet. When companies express interest in
                  candidates, they'll appear here.
                </p>
              ) : (
                <div className='border rounded-lg overflow-hidden'>
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
                            {interest.candidateName ||
                              `Candidate #${interest.candidateId}`}
                          </TableCell>
                          <TableCell>{interest.companyName}</TableCell>
                          <TableCell>{interest.contactName}</TableCell>
                          <TableCell>{interest.email}</TableCell>
                          <TableCell>{interest.phone || '—'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                interest.status === 'new'
                                  ? 'default'
                                  : interest.status === 'contacted'
                                  ? 'secondary'
                                  : interest.status === 'accepted'
                                  ? 'outline'
                                  : 'destructive'
                              }
                            >
                              {interest.status.charAt(0).toUpperCase() +
                                interest.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {interest.createdAt
                              ? formatDateTime(interest.createdAt)
                              : '—'}
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

        <TabsContent value='add-candidate'>
          <Card>
            <CardHeader>
              <CardTitle>Add New Candidate</CardTitle>
              <CardDescription>
                Create a new candidate profile to showcase in the talent
                marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CandidateForm onSuccess={() => setActiveTab('candidates')} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics'>
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Track candidate views, search activity, and marketplace
                engagement metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
