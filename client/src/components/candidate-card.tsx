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
  Briefcase 
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
                  <h3 className="text-xl font-semibold">{candidate.initials}</h3>
                </div>
              </div>
              <Badge variant="outline" className="uppercase">
                {candidate.availability}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground">{candidate.title}</p>
            
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
          </CardContent>
          
          <CardFooter className="px-6 pb-6 pt-0 flex flex-wrap gap-2">
            {candidate.skills.slice(0, 3).map((skill) => (
              <Badge 
                key={skill} 
                className="bg-primary/20 text-primary-foreground hover:bg-primary/30 border-none px-2.5 py-1 font-medium"
              >
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 3 && (
              <Badge 
                className="bg-muted text-muted-foreground hover:bg-muted/80 border-none px-2.5 py-1 font-medium"
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
