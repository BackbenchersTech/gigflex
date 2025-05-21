import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import CandidateCard from "@/components/candidate-card";
import SearchBar from "@/components/search-bar";
import CandidateFilter from "@/components/candidate-filter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import type { Candidate } from "@shared/schema";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    skills: [] as string[],
    experience: null as number | null,
    availability: null as string | null
  });

  // Base query to get all candidates
  const candidatesQuery = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"]
  });
  
  // Derive filtered candidates based on the base query, search and filters
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  
  useEffect(() => {
    if (!candidatesQuery.data) return;
    
    let result = [...candidatesQuery.data].filter(c => c.isActive);
    
    // Apply search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(candidate => 
        candidate.fullName.toLowerCase().includes(lowerQuery) ||
        candidate.title.toLowerCase().includes(lowerQuery) ||
        candidate.location.toLowerCase().includes(lowerQuery) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(lowerQuery)) ||
        candidate.bio.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Apply skills filter
    if (filters.skills.length > 0) {
      result = result.filter(candidate => 
        filters.skills.some(skill => candidate.skills.includes(skill))
      );
    }
    
    // Apply experience filter
    if (filters.experience !== null) {
      result = result.filter(candidate => 
        candidate.experienceYears >= filters.experience!
      );
    }
    
    // Apply availability filter
    if (filters.availability) {
      result = result.filter(candidate => 
        candidate.availability === filters.availability
      );
    }
    
    setFilteredCandidates(result);
  }, [candidatesQuery.data, searchQuery, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: {
    skills: string[];
    experience: number | null;
    availability: string | null;
  }) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({
      skills: [],
      experience: null,
      availability: null
    });
  };

  const hasActiveFilters = searchQuery || 
    filters.skills.length > 0 || 
    filters.experience !== null || 
    filters.availability !== null;

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
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <CandidateFilter onFilter={handleFilter} />
          </div>

          <div className="md:col-span-3 space-y-6">
            {hasActiveFilters && (
              <div className="flex items-center justify-between">
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
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
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
                  <Users className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No candidates found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear All Filters
                </Button>
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
    </div>
  );
};

export default HomePage;
