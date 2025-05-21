import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";
import { 
  commonSkills, 
  experienceOptions, 
  availabilityOptions 
} from "@/lib/utils";

interface FilterValues {
  skills: string[];
  experience: number | null;
  availability: string | null;
}

interface CandidateFilterProps {
  onFilter: (filters: FilterValues) => void;
}

const CandidateFilter = ({ onFilter }: CandidateFilterProps) => {
  const [filters, setFilters] = useState<FilterValues>({
    skills: [],
    experience: null,
    availability: null
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleSkillChange = (skill: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      skills: checked 
        ? [...prev.skills, skill]
        : prev.skills.filter(s => s !== skill)
    }));
  };

  const handleExperienceChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      experience: value ? parseInt(value) : null
    }));
  };

  const handleAvailabilityChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      availability: value || null
    }));
  };

  const applyFilters = () => {
    onFilter(filters);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      skills: [],
      experience: null,
      availability: null
    });
    onFilter({
      skills: [],
      experience: null,
      availability: null
    });
  };

  const hasActiveFilters = 
    filters.skills.length > 0 || 
    filters.experience !== null || 
    filters.availability !== null;

  return (
    <div className="relative">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <Button 
          variant="outline" 
          className="w-full flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {filters.skills.length + 
                 (filters.experience !== null ? 1 : 0) + 
                 (filters.availability !== null ? 1 : 0)}
              </Badge>
            )}
          </span>
          <span>{isOpen ? "Hide" : "Show"}</span>
        </Button>
      </div>

      {/* Filter Sidebar */}
      <div 
        className={`
          bg-background border rounded-lg shadow-sm p-4
          md:block
          ${isOpen ? 'block' : 'hidden'}
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">Filters</h3>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="h-8 px-2 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Reset all
            </Button>
          )}
        </div>

        <Accordion type="single" collapsible defaultValue="skills">
          {/* Skills Filter */}
          <AccordionItem value="skills">
            <AccordionTrigger>Skills</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {commonSkills.slice(0, 15).map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`skill-${skill}`} 
                      checked={filters.skills.includes(skill)}
                      onCheckedChange={(checked) => 
                        handleSkillChange(skill, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`skill-${skill}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {skill}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Experience Filter */}
          <AccordionItem value="experience">
            <AccordionTrigger>Experience</AccordionTrigger>
            <AccordionContent>
              <Select 
                value={filters.experience?.toString() || ""} 
                onValueChange={handleExperienceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select minimum experience" />
                </SelectTrigger>
                <SelectContent>
                  {experienceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          {/* Availability Filter */}
          <AccordionItem value="availability">
            <AccordionTrigger>Availability</AccordionTrigger>
            <AccordionContent>
              <Select 
                value={filters.availability || ""} 
                onValueChange={handleAvailabilityChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator className="my-4" />

        {/* Selected Filters */}
        {hasActiveFilters && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Selected Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {filters.skills.map(skill => (
                <Badge 
                  key={skill}
                  variant="secondary"
                  className="flex items-center"
                >
                  {skill}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => handleSkillChange(skill, false)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {skill}</span>
                  </Button>
                </Badge>
              ))}
              
              {filters.experience !== null && (
                <Badge 
                  variant="secondary"
                  className="flex items-center"
                >
                  {experienceOptions.find(o => o.value === filters.experience)?.label}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => handleExperienceChange("")}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove experience filter</span>
                  </Button>
                </Badge>
              )}
              
              {filters.availability && (
                <Badge 
                  variant="secondary"
                  className="flex items-center"
                >
                  {filters.availability}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => handleAvailabilityChange("")}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove availability filter</span>
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}

        <Button 
          className="w-full"
          onClick={applyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default CandidateFilter;
