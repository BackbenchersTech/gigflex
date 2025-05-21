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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import InterestForm from "@/components/interest-form";
import { 
  Briefcase, 
  MapPin, 
  GraduationCap, 
  Award, 
  Clock,
  Banknote,
  Users,
  BookOpen,
  CheckCircle2,
  Star,
  Medal,
  GanttChart,
  Share2
} from "lucide-react";
import { formatExperienceYears } from "@/lib/utils";
import type { Candidate } from "@shared/schema";

interface CandidateDetailProps {
  candidate: Candidate;
  onClose: () => void;
}

const CandidateDetail = ({ candidate, onClose }: CandidateDetailProps) => {
  const [showInterestForm, setShowInterestForm] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 pb-20">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              {candidate.profileImageUrl ? (
                <AvatarImage src={candidate.profileImageUrl} alt={candidate.initials} />
              ) : (
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {candidate.initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="text-2xl font-bold">{candidate.initials}</DialogTitle>
                {candidate.isActive && (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Available
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-lg font-medium text-foreground mb-1">
                {candidate.title}
              </DialogDescription>
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                {candidate.location}
              </div>
              <div className="text-green-600 font-medium text-sm mt-1">
                <Banknote className="h-4 w-4 inline mr-1" />
                ${candidate.billRate}/hr
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {showInterestForm ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Share2 className="h-5 w-5 mr-2 text-primary" />
                  Contact About This Candidate
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fill out the form below to express your interest in this candidate. Our team will get back to you shortly.
                </p>
              </CardHeader>
              <CardContent>
                <InterestForm candidateId={candidate.id} />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Bio Section */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                    Professional Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {candidate.bio || "Experienced professional with a proven track record in the industry."}
                  </p>
                </CardContent>
              </Card>

              {/* Skills Section */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Star className="h-5 w-5 mr-2 text-primary" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-md text-xs font-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Professional Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-primary" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Industry Experience</p>
                      <p className="font-medium">{formatExperienceYears(candidate.experienceYears)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Availability</p>
                      <p className="font-medium">{candidate.availability}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Education</p>
                      <p className="font-medium">{candidate.education}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              {candidate.certifications && candidate.certifications.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Medal className="h-5 w-5 mr-2 text-primary" />
                      Certifications & Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {candidate.certifications.map((cert) => (
                        <li key={cert} className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Project Experience */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <GanttChart className="h-5 w-5 mr-2 text-primary" />
                    Project Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-2 border-gray-200 pl-4 relative">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                      <h4 className="text-base font-medium">Senior Role</h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        {candidate.experienceYears > 5 ? "5+ years" : `${Math.max(1, candidate.experienceYears-2)}+ years`}
                      </p>
                      <p className="text-sm">
                        Led cross-functional teams and delivered key projects in {candidate.skills.slice(0, 2).join(" and ")} technologies.
                      </p>
                    </div>

                    <div className="border-l-2 border-gray-200 pl-4 relative">
                      <div className="absolute w-3 h-3 bg-gray-400 rounded-full -left-[7px] top-1"></div>
                      <h4 className="text-base font-medium">Earlier Experience</h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        {candidate.experienceYears > 3 ? "3+ years" : "1-2 years"}
                      </p>
                      <p className="text-sm">
                        Developed expertise in {candidate.skills.slice(1, 3).join(", ")} and contributed to various projects.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonials Section */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Testimonials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-3 rounded-lg relative">
                      <div className="absolute top-0 right-0 p-2 text-2xl text-muted-foreground">"</div>
                      <p className="text-sm italic">
                        A {candidate.experienceYears > 5 ? "seasoned" : "talented"} professional who consistently delivers high-quality work. Their expertise in {candidate.skills[0]} was particularly valuable to our project.
                      </p>
                      <p className="text-sm font-medium mt-2">— Previous Client</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Fixed footer */}
      <div className="sticky bottom-0 left-0 right-0 bg-slate-50 dark:bg-gray-900 border-t z-50 flex justify-between items-center px-4 py-3">
        <Button type="button" onClick={onClose} variant="outline">
          Close
        </Button>
        
        {showInterestForm ? (
          <Button variant="secondary" onClick={() => setShowInterestForm(false)}>
            View Profile
          </Button>
        ) : (
          <Button onClick={() => setShowInterestForm(true)}>
            Express Interest
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateDetail;