import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Phone, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Doctors = () => {
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      speciality: "Cardiology",
      phone: "9123456780",
      patients: 156,
      experience: "12 years",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      speciality: "Pediatrics",
      phone: "9123456781",
      patients: 203,
      experience: "8 years",
    },
    {
      id: 3,
      name: "Dr. Emily Williams",
      speciality: "Dermatology",
      phone: "9123456782",
      patients: 127,
      experience: "15 years",
    },
    {
      id: 4,
      name: "Dr. James Martinez",
      speciality: "Orthopedics",
      phone: "9123456783",
      patients: 189,
      experience: "10 years",
    },
    {
      id: 5,
      name: "Dr. Lisa Anderson",
      speciality: "Neurology",
      phone: "9123456784",
      patients: 142,
      experience: "18 years",
    },
    {
      id: 6,
      name: "Dr. Robert Taylor",
      speciality: "General Medicine",
      phone: "9123456785",
      patients: 234,
      experience: "6 years",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Doctors</h1>
            <p className="text-muted-foreground">Medical staff directory and information</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elevated">
            <Plus className="w-4 h-4 mr-2" />
            Add Doctor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor, index) => (
            <Card
              key={doctor.id}
              className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in border-border overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-2 bg-gradient-primary" />
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-semibold text-foreground mb-2">
                      {doctor.name}
                    </CardTitle>
                    <Badge className="bg-secondary text-secondary-foreground">
                      {doctor.speciality}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2 text-primary" />
                  {doctor.phone}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Award className="w-4 h-4 mr-2 text-primary" />
                  {doctor.experience} of experience
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Patients</span>
                    <span className="text-2xl font-bold text-primary">{doctor.patients}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-accent">
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
