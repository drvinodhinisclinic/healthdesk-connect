import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Phone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const patients = [
    {
      id: 1,
      name: "John Doe",
      dob: "1985-03-15",
      phone: "9876543210",
      height: 175,
      weight: 72.5,
      address: "123 Main St, City",
      lastVisit: "2025-09-28",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      dob: "1990-07-22",
      phone: "9876543211",
      height: 165,
      weight: 58.3,
      address: "456 Oak Ave, Town",
      lastVisit: "2025-10-02",
      status: "Active",
    },
    {
      id: 3,
      name: "Mike Brown",
      dob: "1978-11-08",
      phone: "9876543212",
      height: 180,
      weight: 85.0,
      address: "789 Pine Rd, Village",
      lastVisit: "2025-08-15",
      status: "Follow-up",
    },
    {
      id: 4,
      name: "Sarah Davis",
      dob: "1995-05-30",
      phone: "9876543213",
      height: 160,
      weight: 55.0,
      address: "321 Elm St, City",
      lastVisit: "2025-10-05",
      status: "Active",
    },
  ];

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Patients</h1>
            <p className="text-muted-foreground">Manage patient records and information</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elevated">
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>

        <Card className="mb-6 shadow-card animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient, index) => (
            <Card
              key={patient.id}
              className="shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer animate-fade-in border-border"
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-foreground mb-1">
                      {patient.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {calculateAge(patient.dob)} years old
                    </p>
                  </div>
                  <Badge
                    variant={patient.status === "Active" ? "default" : "secondary"}
                    className={patient.status === "Active" ? "bg-primary text-primary-foreground" : ""}
                  >
                    {patient.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2 text-primary" />
                  {patient.phone}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Height:</span>
                      <span className="ml-1 font-medium text-foreground">{patient.height} cm</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <span className="ml-1 font-medium text-foreground">{patient.weight} kg</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4 border-primary text-primary hover:bg-accent">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No patients found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Patients;
