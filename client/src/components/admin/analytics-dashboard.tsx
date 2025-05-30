import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Search, TrendingUp, Users } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const AnalyticsDashboard = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center p-8 text-gray-500">
        No analytics data available
      </div>
    );
  }

  const { candidateViewStats, searchStats, topViewedCandidates, recentSearches, totalViews, totalSearches } = analyticsData as {
    candidateViewStats: any[];
    searchStats: any[];
    topViewedCandidates: any[];
    recentSearches: any[];
    totalViews: number;
    totalSearches: number;
  };

  const totalUniqueSearchTerms = searchStats.length;
  const avgSearchResults = searchStats.length > 0 
    ? (searchStats.reduce((acc: number, stat: any) => acc + Number(stat.avgResults || 0), 0) / searchStats.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Candidate profile views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSearches}</div>
            <p className="text-xs text-muted-foreground">
              Search queries performed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Results</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSearchResults}</div>
            <p className="text-xs text-muted-foreground">
              Per search query
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search Terms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUniqueSearchTerms}</div>
            <p className="text-xs text-muted-foreground">
              Unique search queries
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Viewed Candidates */}
        <Card>
          <CardHeader>
            <CardTitle>Top Viewed Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topViewedCandidates.slice(0, 10).map((candidate: any, index: number) => (
                <div key={candidate.candidateId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium">
                      {candidate.initials}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{candidate.title}</p>
                      <p className="text-xs text-muted-foreground">{candidate.location}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {candidate.viewCount} view{candidate.viewCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
              {topViewedCandidates.length === 0 && (
                <p className="text-center text-muted-foreground">No candidate views yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Searches */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSearches.slice(0, 10).map((search: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">{search.searchQuery}</p>
                    <p className="text-xs text-muted-foreground">
                      {search.resultsCount} results • {formatDateTime(search.searchedAt)}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {search.searchType}
                  </Badge>
                </div>
              ))}
              {recentSearches.length === 0 && (
                <p className="text-center text-muted-foreground">No searches yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Trends Chart */}
      {searchStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Search Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={searchStats.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="searchQuery" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="searchCount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;