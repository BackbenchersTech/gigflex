import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  resultsCount?: number;
}

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search candidates by name, skills, title...", 
  initialValue = "",
  resultsCount = 0
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);

    // Track search if query is not empty
    if (searchQuery.trim()) {
      trackSearch(searchQuery.trim(), "general", resultsCount);
    }
  };

  const trackSearch = async (query: string, searchType: string, resultsCount: number) => {
    try {
      await fetch("/api/analytics/search", {
        method: "POST",
        body: JSON.stringify({ query, searchType, resultsCount }),
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      // Silently fail search tracking to not disrupt user experience
      console.error("Failed to track search:", error);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-12"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-12 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
        <Button type="submit" className="absolute right-0 rounded-l-none">
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
