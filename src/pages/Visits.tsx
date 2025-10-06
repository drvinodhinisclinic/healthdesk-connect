import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, DollarSign, FileText } from "lucide-react";
import { visitAPI, Visit } from "@/lib/api";
import { toast } from "sonner";
import { useEffect } from "react";

const Visits = () => {
  const { data: visits, isLoading, error } = useQuery<Visit[]>({
    queryKey: ['visits'],
    queryFn: visitAPI.getAll,
  });

  useEffect(() => {
    if (error) toast.error("Failed to load visits");
  }, [error]);

  const getStatusFromDate = (followupDate: string) => {
    const today = new Date();
    const followup = new Date(followupDate);
    return followup > today ? "Scheduled" : "Completed";
  };

  const getStatusColor = (status: string) => {
    return status === "Completed" 
      ? "bg-primary text-primary-foreground" 
      : "bg-secondary text-secondary-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Visits</h1>
            <p className="text-muted-foreground">Track patient visits and appointments</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elevated">
            <Plus className="w-4 h-4 mr-2" />
            New Visit
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading visits...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visits?.map((visit, index) => (
              <Card
                key={visit.visitID}
                className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in border-border"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-foreground mb-1">
                        {visit.patientName || `Patient ID: ${visit.patientID}`}
                      </CardTitle>
                      <p className="text-sm text-primary font-medium">
                        {visit.doctorName || `Doctor ID: ${visit.doctorID}`}
                      </p>
                    </div>
                    <Badge className={getStatusColor(getStatusFromDate(visit.Followup))}>
                      {getStatusFromDate(visit.Followup)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      <div>
                        <p className="text-muted-foreground text-xs">Follow-up</p>
                        <p className="font-medium text-foreground">
                          {new Date(visit.Followup).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="w-4 h-4 mr-2 text-primary" />
                      <div>
                        <p className="text-muted-foreground text-xs">Fee</p>
                        <p className="font-medium text-foreground">₹{visit.Fee}</p>
                      </div>
                    </div>
                  </div>
                  
                  {visit.DoctorNotes && (
                    <div className="flex items-start text-sm">
                      <FileText className="w-4 h-4 mr-2 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-muted-foreground text-xs">Doctor's Notes</p>
                        <p className="text-foreground">{visit.DoctorNotes}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="text-sm font-medium text-foreground">
                      {visit.locationName || `Location ID: ${visit.clinicLocationID}`}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-accent">
                      View Details
                    </Button>
                    {getStatusFromDate(visit.Followup) === "Scheduled" && (
                      <Button variant="outline" className="flex-1">
                        Reschedule
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (!visits || visits.length === 0) && (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No visits found in the system.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Visits;
