import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CandidateCard from "@/components/candidate-card";
import SearchBar from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search } from "lucide-react";
import type { Candidate } from "@shared/schema";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Query for searching candidates
  const candidatesQuery = useQuery<Candidate[]>({
    queryKey: ["/api/candidates/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) {
        return fetch("/api/candidates").then(res => res.json());
      }
      return fetch(`/api/candidates/search?q=${encodeURIComponent(searchQuery)}`).then(res => res.json());
    },
    enabled: true
  });
  
  // Filter to active candidates only
  const filteredCandidates = candidatesQuery.data?.filter(candidate => candidate.isActive) || [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const hasActiveSearch = searchQuery.trim() !== "";

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Find Your Next Great Hire
          </h1>
          <p className="text-xl text-muted-foreground">
            Browse our curated selection of top talent available for your next project or full-time role.
          </p>
        </div>

        <div className="max-w-3xl mx-auto w-full">
          <div className="space-y-2">
            <SearchBar 
              onSearch={handleSearch} 
              initialValue={searchQuery} 
              placeholder="Try natural language search: 'React developer with 3+ years of experience'" 
            />
            <p className="text-sm text-muted-foreground text-center">
              You can search by skills, experience level, and availability (e.g., "JavaScript developer with 5 years available immediately")
            </p>
          </div>
        </div>

        <div className="w-full max-w-6xl mx-auto">
          {hasActiveSearch && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">
                  {filteredCandidates.length} {filteredCandidates.length === 1 ? 'candidate' : 'candidates'} found
                </span>
                {searchQuery && (
                  <Badge variant="secondary" className="mr-2">
                    Search: {searchQuery}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearSearch}>
                Clear search
              </Button>
            </div>
          )}

          {candidatesQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex space-x-2 pt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : candidatesQuery.isError ? (
            <div className="text-center py-12">
              <p className="text-destructive text-lg">Error loading candidates.</p>
              <Button 
                variant="outline" 
                onClick={() => candidatesQuery.refetch()}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-background">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No candidates found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search criteria or using different keywords.
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={clearSearch} className="mt-4">
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
