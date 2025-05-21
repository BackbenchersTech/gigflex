import { useState } from "react";
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import InterestForm from "@/components/interest-form";
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Award, 
  Clock 
} from "lucide-react";
import { formatExperienceYears } from "@/lib/utils";
import type { Candidate } from "@shared/schema";

interface CandidateDetailProps {
  candidate: Candidate;
  onClose: () => void;
}

const CandidateDetail = ({ candidate, onClose }: CandidateDetailProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      <DialogHeader className="text-left">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {candidate.profileImageUrl ? (
              <AvatarImage src={candidate.profileImageUrl} alt={candidate.initials} />
            ) : (
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {candidate.initials}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <DialogTitle className="text-2xl">{candidate.initials}</DialogTitle>
            <DialogDescription className="text-base">
              {candidate.title}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mt-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="express-interest">Express Interest</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 space-y-6">
          {/* Key details */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{candidate.location}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-medium">{formatExperienceYears(candidate.experienceYears)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Availability</p>
                  <p className="font-medium">{candidate.availability}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Education</p>
                  <p className="font-medium">{candidate.education}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-lg font-medium mb-2">Bio</h3>
            <p className="text-muted-foreground">{candidate.bio}</p>
          </div>

          <Separator />

          {/* Skills */}
          <div>
            <h3 className="text-lg font-medium mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {candidate.certifications && candidate.certifications.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-3">
                  <Award className="h-5 w-5 inline mr-2" />
                  Certifications
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {candidate.certifications.map((cert) => (
                    <li key={cert} className="text-muted-foreground">
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="express-interest" className="mt-4">
          <InterestForm candidateId={candidate.id} />
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-6">
        <Button type="button" onClick={onClose} variant="outline">
          Close
        </Button>
        {activeTab === "overview" ? (
          <Button onClick={() => setActiveTab("express-interest")}>
            Express Interest
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setActiveTab("overview")}>
            View Profile
          </Button>
        )}
      </DialogFooter>
    </>
  );
};

export default CandidateDetail;
