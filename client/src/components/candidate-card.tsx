import { useState } from "react";
import { 
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  CalendarClock, 
  MapPin, 
  Briefcase,
  DollarSign
} from "lucide-react";
import CandidateDetail from "@/components/candidate-detail";
import { formatExperienceYears } from "@/lib/utils";
import type { Candidate } from "@shared/schema";

interface CandidateCardProps {
  candidate: Candidate;
}

const CandidateCard = ({ candidate }: CandidateCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Avatar className="h-16 w-16">
                  {candidate.profileImageUrl ? (
                    <AvatarImage src={candidate.profileImageUrl} alt={candidate.initials} />
                  ) : (
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {candidate.initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold">{candidate.initials}</h3>
                  {candidate.billRate && (
                    <div className="flex items-center mt-1 text-green-600 dark:text-green-400 font-medium">
                      <DollarSign className="h-3.5 w-3.5 mr-1" />
                      <span>${candidate.billRate}/hr</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="uppercase text-xs">
                {candidate.availability}
              </Badge>
            </div>
            <p className="text-base text-muted-foreground">{candidate.title}</p>
            
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{candidate.location}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Briefcase className="h-4 w-4 mr-2" />
              <span>{formatExperienceYears(candidate.experienceYears)}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <CalendarClock className="h-4 w-4 mr-2" />
              <span>Available {candidate.availability.toLowerCase()}</span>
            </div>
            
            {candidate.billRate && (
              <div className="flex items-center text-sm font-semibold text-green-600 dark:text-green-500 mt-2">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>${candidate.billRate}/hr</span>
              </div>
            )}

          </CardContent>
          
          <CardFooter className="px-6 pb-6 pt-0 flex flex-wrap gap-2">
            {candidate.skills.slice(0, 3).map((skill) => (
              <Badge 
                key={skill} 
                className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-none px-2 py-0.5 text-xs font-normal dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 3 && (
              <Badge 
                className="bg-gray-50 text-gray-500 hover:bg-gray-100 border-none px-2 py-0.5 text-xs font-normal dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                +{candidate.skills.length - 3}
              </Badge>
            )}
          </CardFooter>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <CandidateDetail candidate={candidate} onClose={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default CandidateCard;
