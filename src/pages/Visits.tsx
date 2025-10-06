import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, DollarSign, FileText } from "lucide-react";

const Visits = () => {
  const visits = [
    {
      id: 1,
      patient: "John Doe",
      doctor: "Dr. Sarah Johnson",
      date: "2025-10-06",
      visitType: "Follow-up",
      fee: 500,
      location: "Main Clinic",
      status: "Completed",
    },
    {
      id: 2,
      patient: "Jane Smith",
      doctor: "Dr. Michael Chen",
      date: "2025-10-06",
      visitType: "Consultation",
      fee: 800,
      location: "Downtown Branch",
      status: "Scheduled",
    },
    {
      id: 3,
      patient: "Mike Brown",
      doctor: "Dr. Emily Williams",
      date: "2025-10-05",
      visitType: "Check-up",
      fee: 600,
      location: "Main Clinic",
      status: "Completed",
    },
    {
      id: 4,
      patient: "Sarah Davis",
      doctor: "Dr. James Martinez",
      date: "2025-10-05",
      visitType: "Emergency",
      fee: 1200,
      location: "Emergency Center",
      status: "Completed",
    },
    {
      id: 5,
      patient: "Robert Wilson",
      doctor: "Dr. Lisa Anderson",
      date: "2025-10-07",
      visitType: "Follow-up",
      fee: 500,
      location: "Main Clinic",
      status: "Scheduled",
    },
    {
      id: 6,
      patient: "Emma Thompson",
      doctor: "Dr. Robert Taylor",
      date: "2025-10-04",
      visitType: "Consultation",
      fee: 750,
      location: "Downtown Branch",
      status: "Completed",
    },
  ];

  const getStatusColor = (status: string) => {
    return status === "Completed" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground";
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visits.map((visit, index) => (
            <Card
              key={visit.id}
              className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in border-border"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-semibold text-foreground mb-1">
                      {visit.patient}
                    </CardTitle>
                    <p className="text-sm text-primary font-medium">{visit.doctor}</p>
                  </div>
                  <Badge className={getStatusColor(visit.status)}>
                    {visit.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <div>
                      <p className="text-muted-foreground text-xs">Date</p>
                      <p className="font-medium text-foreground">
                        {new Date(visit.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-2 text-primary" />
                    <div>
                      <p className="text-muted-foreground text-xs">Fee</p>
                      <p className="font-medium text-foreground">₹{visit.fee}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  <FileText className="w-4 h-4 mr-2 text-primary" />
                  <div>
                    <p className="text-muted-foreground text-xs">Visit Type</p>
                    <p className="font-medium text-foreground">{visit.visitType}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="text-sm font-medium text-foreground">{visit.location}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-accent">
                    View Details
                  </Button>
                  {visit.status === "Scheduled" && (
                    <Button variant="outline" className="flex-1">
                      Reschedule
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Visits;
